import { Application, Request, Response } from 'express';

export interface FlowNode {
    id: string;
    type: string;
    data: any;
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
}

import { getDb } from '../db';
import { interpolateObject } from './ContextEngine';
import axios from 'axios';
import ivm from 'isolated-vm';
import crypto from 'crypto';

export interface FlowDef {
    nodes: FlowNode[];
    edges: FlowEdge[];
}

export class FlowEngine {
    private app: Application;
    // Store registered flows mapped by `${METHOD} ${ROUTE}`
    private routeMap: Map<string, { flow: FlowDef, triggerNodeId: string }> = new Map();

    constructor(app: Application) {
        this.app = app;
        this.setupCatchAllRoute();
    }

    private setupCatchAllRoute() {
        // Catch all requests and route to the dynamically registered flows
        this.app.all('*', async (req: Request, res: Response, next: any) => {
            // Ignore /api/deploy
            if (req.path === '/api/deploy') {
                return next();
            }

            const method = req.method.toLowerCase();
            const route = req.path;
            const key = `${method} ${route}`;

            const registeredFlow = this.routeMap.get(key);

            if (registeredFlow) {
                const context = {
                    req,
                    res,
                    data: {}, // Data passed between nodes
                    currentNodeId: registeredFlow.triggerNodeId
                };

                await this.executeFlow(registeredFlow.flow, context);
            } else {
                next(); // Pass to default 404 handler if no flow matches
            }
        });
    }

    registerFlow(flow: FlowDef) {
        // Find the HTTP trigger node
        const triggerNode = flow.nodes.find(n => n.type === 'trigger');
        if (!triggerNode) {
            throw new Error('Flow must contain a Trigger node');
        }

        const method = (triggerNode.data.method || 'GET').toLowerCase();
        const route = triggerNode.data.route || '/api/dynamic';
        const key = `${method} ${route}`;

        // Save or update the flow in the map
        this.routeMap.set(key, { flow, triggerNodeId: triggerNode.id });

        console.log(`Registered dynamic route: [${method.toUpperCase()}] ${route}`);
    }

    private async executeFlow(flow: FlowDef, context: any) {
        let currentNodeId = context.currentNodeId;
        let stepCount = 0;
        const MAX_STEPS = 1000;
        const executionId = crypto.randomUUID();

        while (currentNodeId) {
            stepCount++;
            if (stepCount > MAX_STEPS) {
                console.error(`[${executionId}] MAX_STEPS exceeded. Aborting to prevent infinite loop.`);
                context.res.status(500).json({ error: 'Flow execution exceeded maximum allowed steps (infinite loop detected).' });
                return;
            }

            const node = flow.nodes.find(n => n.id === currentNodeId);
            if (!node) break;

            console.log(`[${executionId}] Executing node: ${node.type} (${node.id})`);
            const startTime = Date.now();
            let executionStatus = 'success';

            // Interpolate dynamic node data using current context
            const nodeData = interpolateObject(node.data, context.data);

            // Execute node logic
            switch (node.type) {
                case 'trigger':
                    // Just passes payload to next node
                    context.data.trigger = {
                        payload: context.req.body,
                        query: context.req.query,
                        params: context.req.params,
                        headers: context.req.headers
                    };
                    context.data.payload = context.data.trigger.payload || context.data.trigger.query; // Backwards compat
                    break;
                case 'auth':
                    console.log('Evaluating Auth Node');
                    const authHeader = (context.data.trigger?.headers && context.data.trigger.headers['authorization']) ? context.data.trigger.headers['authorization'] : '';
                    const providedKey = authHeader.replace('Bearer ', '').trim();

                    // Allow simple string or dynamic interpolation
                    const expectedKey = nodeData.apiKey;

                    if (providedKey && providedKey === expectedKey) {
                        context.data._nextHandle = 'success';
                    } else {
                        console.warn(`Auth failed! Unauthorized. Provided: ${providedKey}, Expected: ${expectedKey}`);
                        context.data.error = 'Unauthorized';
                        context.data._nextHandle = 'unauthorized';
                    }
                    break;
                case 'database':
                    console.log('Executing real DB query:', nodeData.query);
                    try {
                        const db = await getDb();

                        const params: any[] = [];
                        const queryWithParams = node.data.query.replace(/\{\{([^}]+)\}\}/g, (match: string, path: string) => {
                            const lodashGet = require('lodash/get');
                            const val = lodashGet(context.data, path.trim());
                            params.push(val);
                            return '?';
                        });

                        if (queryWithParams.trim().toLowerCase().startsWith('select')) {
                            const results = await db.all(queryWithParams, params);
                            context.data[node.id] = results;
                            context.data.dbResult = results;
                        } else {
                            const result = await db.run(queryWithParams, params);
                            context.data[node.id] = { changes: result.changes, lastID: result.lastID };
                            context.data.dbResult = { changes: result.changes, lastID: result.lastID };
                        }
                        context.data._nextHandle = 'success';
                    } catch (error: any) {
                        console.error('DB Error:', error.message);
                        context.data[node.id] = { error: error.message };
                        context.data.error = error.message;
                        context.data._nextHandle = 'error';
                    }
                    break;
                case 'api_request':
                    console.log('Executing API Request:', nodeData.method, nodeData.url);
                    try {
                        const response = await axios({
                            method: nodeData.method || 'GET',
                            url: nodeData.url,
                            headers: nodeData.headers ? JSON.parse(nodeData.headers) : undefined,
                            data: nodeData.body ? JSON.parse(nodeData.body) : undefined
                        });
                        context.data[node.id] = { status: response.status, data: response.data };
                        context.data.apiResult = context.data[node.id]; // helper alias
                        context.data._nextHandle = 'success';
                    } catch (error: any) {
                        console.error('API Error:', error.message);
                        context.data[node.id] = { error: error.message, response: error.response?.data };
                        context.data.error = error.message;
                        context.data._nextHandle = 'error';
                    }
                    break;
                case 'condition':
                    console.log('Evaluating Condition script');
                    try {
                        const scriptCode = nodeData.condition;
                        const isolate = new ivm.Isolate({ memoryLimit: 128 });
                        const vmContext = await isolate.createContext();

                        // Pass a deep clone of the context data into the sandbox
                        await vmContext.global.set('context', new ivm.ExternalCopy(context.data).copyInto());

                        const script = await isolate.compileScript(`(function() { return ${scriptCode}; })()`);
                        const result = await script.run(vmContext, { timeout: 1000 });

                        // The condition script should return a boolean
                        const isTrue = !!result;
                        context.data[node.id] = { result: isTrue };

                        // Instruct the flow engine which handle to follow
                        context.data._nextHandle = isTrue ? 'true' : 'false';

                        isolate.dispose();
                    } catch (error: any) {
                        console.error('Condition Error:', error.message);
                        context.data[node.id] = { error: error.message };
                        // Default to false path on error
                        context.data._nextHandle = 'false';
                    }
                    break;
                case 'transform':
                    console.log('Executing Transform script');
                    try {
                        const scriptCode = nodeData.script;
                        const isolate = new ivm.Isolate({ memoryLimit: 128 });
                        const vmContext = await isolate.createContext();

                        // Pass a deep clone of the context data into the sandbox
                        await vmContext.global.set('context', new ivm.ExternalCopy(context.data).copyInto());

                        const script = await isolate.compileScript(`(function() { return ${scriptCode}; })()`);
                        const result = await script.run(vmContext, { timeout: 1000 });

                        context.data[node.id] = result;
                        context.data._nextHandle = 'success';

                        isolate.dispose();
                    } catch (error: any) {
                        console.error('Transform Error:', error.message);
                        context.data[node.id] = { error: error.message };
                        context.data.error = error.message;
                        context.data._nextHandle = 'error';
                    }
                    break;
                case 'event_publish':
                    console.log('Publishing Event:', nodeData.topic);
                    // Mock event publishing (e.g. to Redis/Kafka)
                    context.data[node.id] = { published: true, topic: nodeData.topic, message: nodeData.message };
                    break;
                case 'set_variable':
                    console.log(`Setting Variable: ${nodeData.key}`);
                    if (!context.data.variables) {
                        context.data.variables = {};
                    }
                    context.data.variables[nodeData.key] = nodeData.value;
                    break;
                case 'loop':
                    console.log(`Executing Loop`);

                    // The user provides an array (e.g. from a previous transform or db node)
                    // Since it's interpolated, if it was an object/array, ContextEngine returns the object.
                    // If it's a string, we attempt to parse it.
                    let items = nodeData.items;
                    if (typeof items === 'string') {
                        try { items = JSON.parse(items); } catch(e) { items = []; }
                    }
                    if (!Array.isArray(items)) {
                        items = []; // Fallback if not an array
                    }

                    // Initialize or retrieve loop state
                    if (!context.data._loopStates) context.data._loopStates = {};
                    if (context.data._loopStates[node.id] === undefined) {
                        context.data._loopStates[node.id] = 0; // start at index 0
                    }

                    const currentIndex = context.data._loopStates[node.id];

                    if (currentIndex < items.length) {
                        // We have an item to process
                        const currentItem = items[currentIndex];

                        // Expose to context so downstream nodes can use {{loopItem}}
                        context.data.loopItem = currentItem;
                        context.data.loopIndex = currentIndex;

                        // Increment for the NEXT time the loop node is hit
                        context.data._loopStates[node.id] = currentIndex + 1;

                        // Follow the 'item' branch
                        context.data._nextHandle = 'item';
                    } else {
                        // Loop is finished
                        // Clean up state so it could theoretically be run again in the same flow
                        delete context.data._loopStates[node.id];
                        delete context.data.loopItem;
                        delete context.data.loopIndex;

                        // Follow the 'done' branch
                        context.data._nextHandle = 'done';
                    }
                    break;
                case 'response':
                    // Send response and end execution

                    // If message uses dynamic syntax, try parsing it as JSON if it represents an object
                    let finalMessage = nodeData.message || 'Flow executed';
                    try {
                        if (finalMessage.startsWith('{') || finalMessage.startsWith('[')) {
                            finalMessage = JSON.parse(finalMessage);
                        }
                    } catch(e) {}

                    context.res.status(nodeData.statusCode || 200).json({
                        result: context.data.dbResult || context.data.payload,
                        data: finalMessage
                    });
                    break;
                default:
                    console.log(`Unknown node type: ${node.type}`);
            }

            if (context.data._nextHandle === 'error' || context.data.error) {
                executionStatus = 'error';
            }

            // Trace Execution Logging
            try {
                const db = await getDb();

                // Deep clone the context to safely remove noisy data without mutating the live flow state
                const traceContext = structuredClone(context.data);

                // Filter out large/noisy objects from the DB trace
                if (traceContext.trigger && traceContext.trigger.headers) {
                    delete traceContext.trigger.headers;
                }

                await db.run(`
                    INSERT INTO execution_logs (execution_id, node_id, node_type, duration_ms, status, context_snapshot)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [executionId, node.id, node.type, Date.now() - startTime, executionStatus, JSON.stringify(traceContext)]);
            } catch (err) {
                console.error("Failed to write execution log:", err);
            }

            if (node.type === 'response') {
                return; // End flow
            }

            // Find next node
            // If the node we just executed dictated a specific handle (e.g. condition node), use it.
            const handleToFollow = context.data._nextHandle;
            delete context.data._nextHandle; // clean up for next iteration
            delete context.data.error; // clear error state for next node

            const edge = flow.edges.find(e => {
                if (e.source !== currentNodeId) return false;
                // If the node requested a specific handle, the edge must match it
                if (handleToFollow) {
                    return e.sourceHandle === handleToFollow;
                }
                return true; // standard linear progression
            });

            currentNodeId = edge ? edge.target : null;
        }

        // If flow finished without a response node
        if (!context.res.headersSent) {
            context.res.status(200).json({ message: 'Flow finished with no response node', data: context.data });
        }
    }
}
