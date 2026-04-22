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

            // Execute node logic
            switch (node.type) {
                case 'trigger':
                    // Just passes payload to next node
                    context.data.payload = context.req.body || context.req.query;
                    break;
                case 'database':
                    // Mock database execution
                    console.log('Executing DB query:', node.data.query);
                    context.data.dbResult = { status: 'success', mockData: true, collection: node.data.collection };
                    break;
                case 'response':
                    // Send response and end execution
                    context.res.status(node.data.statusCode || 200).json({
                        result: context.data.dbResult || context.data.payload,
                        message: node.data.message || 'Flow executed'
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
