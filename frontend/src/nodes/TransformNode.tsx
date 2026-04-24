import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code } from 'lucide-react';

export const TransformNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-yellow-500 shadow-md min-w-[200px]  cursor-default">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-yellow-500" />
      <div className="bg-yellow-100 p-2 border-b border-yellow-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <Code size={16} className="text-yellow-600" />
        <strong className="text-yellow-800 text-sm">Transform (JS)</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Script `(context)`</label>
          <textarea
            className="text-sm p-1 border rounded h-24 font-mono whitespace-pre"
            placeholder={"context.dbResult.filter(x => x.active)"}
            defaultValue={data.script || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'script', e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col items-end pr-2 pb-2 gap-2 text-xs font-semibold">
        <div className="relative">
          <span className="text-green-600 mr-4">Success</span>
          <Handle type="source" position={Position.Right} id="success" className="w-3 h-3 bg-green-500 absolute -right-4 top-1" />
        </div>
        <div className="relative">
          <span className="text-red-600 mr-4">Error</span>
          <Handle type="source" position={Position.Right} id="error" className="w-3 h-3 bg-red-500 absolute -right-4 top-1" />
        </div>
      </div>
    </div>
  );
};
