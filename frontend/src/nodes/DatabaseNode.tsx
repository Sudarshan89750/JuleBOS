import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';

export const DatabaseNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-blue-500 shadow-md min-w-[200px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      <div className="bg-blue-100 p-2 border-b border-blue-200 rounded-t-sm flex items-center gap-2">
        <Database size={16} className="text-blue-600" />
        <strong className="text-blue-800 text-sm">Database</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Collection</label>
          <input
            type="text"
            className="text-sm p-1 border rounded"
            defaultValue={data.collection || 'users'}
            onChange={(e) => data.onChange(data.id, 'collection', e.target.value)}
          />

          <label className="text-xs text-gray-500 mt-1">Query</label>
          <input
            type="text"
            className="text-sm p-1 border rounded"
            defaultValue={data.query || 'SELECT * FROM users'}
            onChange={(e) => data.onChange(data.id, 'query', e.target.value)}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};
