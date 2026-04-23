import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import { nanoid } from 'nanoid';

import { TriggerNode } from './nodes/TriggerNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { ResponseNode } from './nodes/ResponseNode';
import { Sidebar } from './Sidebar';

// Assuming these will be created next
import { ApiNode } from './nodes/ApiNode';
import { TransformNode } from './nodes/TransformNode';
import { EventNode } from './nodes/EventNode';
import { ConditionNode } from './nodes/ConditionNode';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeDataChange = useCallback((nodeId: string, key: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [key]: value,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Inject handleNodeDataChange into initial nodes
  const nodesWithOnChange = useMemo(() => {
    return nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            onChange: handleNodeDataChange
        }
    }))
  }, [nodes, handleNodeDataChange]);

  const nodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    database: DatabaseNode,
    response: ResponseNode,
    api_request: ApiNode,
    transform: TransformNode,
    event_publish: EventNode,
    condition: ConditionNode,
  }), []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: nanoid(),
        type,
        position,
        data: {}, // Initial data can be set via defaultValues in components
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const deployFlow = async () => {
    try {
      setDeployStatus('Deploying...');
      const payload = {
        flow: {
          // Remove the onChange function before sending
          nodes: nodes.map(n => ({ id: n.id, type: n.type, data: { ...n.data, onChange: undefined } })),
          edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle }))
        }
      };

      const res = await axios.post('http://localhost:3001/api/deploy', payload);
      setDeployStatus(`Success: ${res.data.message}`);
    } catch (error: any) {
      setDeployStatus(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '10px 20px', background: '#1e1e2f', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>JuleBOS Visual API Builder</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {deployStatus && <span style={{ fontSize: '0.9rem', color: deployStatus.startsWith('Error') ? '#ff6b6b' : '#51cf66' }}>{deployStatus}</span>}
          <button
            onClick={deployFlow}
            style={{ background: '#4c6ef5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Deploy Flow
          </button>
        </div>
      </header>

      <div style={{ flexGrow: 1, display: 'flex' }}>
        <Sidebar />
        <div style={{ flexGrow: 1 }} className="reactflow-wrapper">
          <ReactFlow
            nodes={nodesWithOnChange}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
