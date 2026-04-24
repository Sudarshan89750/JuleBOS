import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock } from 'lucide-react';

export const AuthNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-stone-600 shadow-md min-w-[200px] cursor-default">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-stone-600" />
      <div className="bg-stone-100 p-2 border-b border-stone-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <Lock size={16} className="text-stone-700" />
        <strong className="text-stone-800 text-sm">Auth (API Key)</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Expected API Key</label>
          <input
            type="password"
            className="text-sm p-1 border rounded"
            placeholder="super-secret-key"
            defaultValue={data.apiKey || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'apiKey', e.target.value)}
          />
        </div>
      </div>

      {/* Right handles for branching */}
      <div className="flex flex-col items-end pr-2 pb-2 gap-2 text-xs font-semibold">
        <div className="relative">
          <span className="text-green-600 mr-4">Success</span>
          <Handle type="source" position={Position.Right} id="success" className="w-3 h-3 bg-green-500 absolute -right-4 top-1" />
        </div>
        <div className="relative">
          <span className="text-red-600 mr-4">Unauthorized</span>
          <Handle type="source" position={Position.Right} id="unauthorized" className="w-3 h-3 bg-red-500 absolute -right-4 top-1" />
        </div>
      </div>
    </div>
  );
};
