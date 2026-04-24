import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export const TriggerNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-green-500 shadow-md min-w-[200px]">
      <div className="bg-green-100 p-2 border-b border-green-200 rounded-t-sm flex items-center gap-2">
        <Play size={16} className="text-green-600" />
        <strong className="text-green-800 text-sm">HTTP Trigger</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Method</label>
          <select
            className="text-sm p-1 border rounded"
            defaultValue={data.method || 'GET'}
            onChange={(e) => data.onChange(data.id, 'method', e.target.value)}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>

          <label className="text-xs text-gray-500 mt-1">Route</label>
          <input
            type="text"
            className="text-sm p-1 border rounded"
            defaultValue={data.route || '/api/dynamic'}
            onChange={(e) => data.onChange(data.id, 'route', e.target.value)}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
    </div>
  );
};
