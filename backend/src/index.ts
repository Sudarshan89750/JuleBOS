import express from 'express';
import cors from 'cors';
import { FlowEngine } from './engine/FlowEngine';

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`JuleBOS Engine running on port ${PORT}`);
});
