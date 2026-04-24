import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Send } from 'lucide-react';

export const ResponseNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-purple-500 shadow-md min-w-[200px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <div className="bg-purple-100 p-2 border-b border-purple-200 rounded-t-sm flex items-center gap-2">
        <Send size={16} className="text-purple-600" />
        <strong className="text-purple-800 text-sm">HTTP Response</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Status Code</label>
          <input
            type="number"
            className="text-sm p-1 border rounded"
            defaultValue={data.statusCode || 200}
            onChange={(e) => data.onChange(data.id, 'statusCode', parseInt(e.target.value))}
          />

          <label className="text-xs text-gray-500 mt-1">Message</label>
          <input
            type="text"
            className="text-sm p-1 border rounded"
            defaultValue={data.message || 'Success'}
            onChange={(e) => data.onChange(data.id, 'message', e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col items-end pr-2 pb-2 gap-2 text-xs font-semibold">
        <div className="relative">
          <span className="text-gray-500 mr-4 italic">Background Tasks</span>
          <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500 absolute -right-4 top-1" />
        </div>
      </div>
    </div>
  );
};
