import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

export const ApiNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-orange-500 shadow-md min-w-[200px]  cursor-default">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />
      <div className="bg-orange-100 p-2 border-b border-orange-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <Globe size={16} className="text-orange-600" />
        <strong className="text-orange-800 text-sm">External API Request</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Method</label>
          <select
            className="text-sm p-1 border rounded"
            defaultValue={data.method || 'GET'}
            onChange={(e) => data.onChange && data.onChange(data.id, 'method', e.target.value)}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>

          <label className="text-xs text-gray-500 mt-1">URL (Supports {'{{...}}'})</label>
          <input
            type="text"
            className="text-sm p-1 border rounded"
            placeholder="https://api.example.com"
            defaultValue={data.url || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'url', e.target.value)}
          />

          <label className="text-xs text-gray-500 mt-1">Body (JSON)</label>
          <textarea
            className="text-sm p-1 border rounded h-16 font-mono"
            placeholder={'{"userId": "{{trigger.payload.userId}}"}'}
            defaultValue={data.body || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'body', e.target.value)}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
    </div>
  );
};
