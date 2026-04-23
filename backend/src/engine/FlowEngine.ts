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
}

import { getDb } from '../db';
import { interpolateObject } from './ContextEngine';
import axios from 'axios';
import ivm from 'isolated-vm';

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

        while (currentNodeId) {
            const node = flow.nodes.find(n => n.id === currentNodeId);
            if (!node) break;

            console.log(`Executing node: ${node.type} (${node.id})`);

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
                case 'database':
                    // We must avoid SQL injection. To do this properly, the user should provide a raw query with placeholders
                    // (e.g. `SELECT * FROM users WHERE id = ?`) and an array of parameters.
                    // However, to keep our `{{variable}}` string interpolation UX intact while fixing injection,
                    // we will execute the query using parameterized logic instead of raw interpolated strings if possible,
                    // but for this iteration, we will use a basic parameterized query executor instead.
                    console.log('Executing real DB query:', nodeData.query);
                    try {
                        const db = await getDb();

                        // Extract `{{var}}` placeholders into parameterized array
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
                    } catch (error: any) {
                        console.error('DB Error:', error.message);
                        context.data[node.id] = { error: error.message };
                        context.data.dbResult = { error: error.message };
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
                    } catch (error: any) {
                        console.error('API Error:', error.message);
                        context.data[node.id] = { error: error.message, response: error.response?.data };
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

                        isolate.dispose();
                    } catch (error: any) {
                        console.error('Transform Error:', error.message);
                        context.data[node.id] = { error: error.message };
                    }
                    break;
                case 'event_publish':
                    console.log('Publishing Event:', nodeData.topic);
                    // Mock event publishing (e.g. to Redis/Kafka)
                    context.data[node.id] = { published: true, topic: nodeData.topic, message: nodeData.message };
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
                    return; // End flow
                default:
                    console.log(`Unknown node type: ${node.type}`);
            }

            // Find next node
            const edge = flow.edges.find(e => e.source === currentNodeId);
            currentNodeId = edge ? edge.target : null;
        }

        // If flow finished without a response node
        if (!context.res.headersSent) {
            context.res.status(200).json({ message: 'Flow finished with no response node', data: context.data });
        }
    }
}
