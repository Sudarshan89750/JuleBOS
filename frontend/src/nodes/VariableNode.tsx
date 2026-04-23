import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Variable } from 'lucide-react';

export const VariableNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-indigo-500 shadow-md min-w-[200px] cursor-default">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
      <div className="bg-indigo-100 p-2 border-b border-indigo-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <Variable size={16} className="text-indigo-600" />
        <strong className="text-indigo-800 text-sm">Set Variable</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Variable Key</label>
          <input
            type="text"
            className="text-sm p-1 border rounded"
            placeholder="myVar"
            defaultValue={data.key || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'key', e.target.value)}
          />

          <label className="text-xs text-gray-500 mt-1">Value (Supports {'{{...}}'})</label>
          <input
            type="text"
            className="text-sm p-1 border rounded"
            placeholder="{{trigger.payload.id}}"
            defaultValue={data.value || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'value', e.target.value)}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
    </div>
  );
};
