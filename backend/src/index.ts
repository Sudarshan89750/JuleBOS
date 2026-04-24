import express from 'express';
import cors from 'cors';
import { FlowEngine } from './engine/FlowEngine';
import { getDb } from './db';

const app = express();
app.use(cors());
app.use(express.json());

const flowEngine = new FlowEngine(app);

app.post('/api/deploy', (req, res) => {
    const { flow } = req.body;
    try {
        flowEngine.registerFlow(flow);
        res.json({ message: 'Flow deployed successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/executions', async (req, res) => {
    try {
        const db = await getDb();
        // Group by execution_id and get summary
        const summary = await db.all(`
            SELECT
                execution_id,
                MIN(started_at) as started_at,
                SUM(duration_ms) as total_duration_ms,
                MAX(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as has_error
            FROM execution_logs
            GROUP BY execution_id
            ORDER BY started_at DESC
            LIMIT 50
        `);
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/executions/:id', async (req, res) => {
    try {
        const db = await getDb();
        const logs = await db.all(`
            SELECT id, node_id, node_type, started_at, duration_ms, status, context_snapshot
            FROM execution_logs
            WHERE execution_id = ?
            ORDER BY id ASC
        `, [req.params.id]);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`JuleBOS Engine running on port ${PORT}`);
});
