import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export const ConditionNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-red-500 shadow-md min-w-[200px] cursor-default">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-500" />
      <div className="bg-red-100 p-2 border-b border-red-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <GitBranch size={16} className="text-red-600" />
        <strong className="text-red-800 text-sm">Condition (If/Else)</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Expression `(context)`</label>
          <input
            className="text-sm p-1 border rounded font-mono"
            placeholder="context.trigger.payload.amount > 100"
            defaultValue={data.condition || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'condition', e.target.value)}
          />
        </div>
      </div>

      {/* Right handles for branching */}
      <div className="flex flex-col items-end pr-2 pb-2 gap-2 text-xs font-semibold">
        <div className="relative">
          <span className="text-green-600 mr-4">True</span>
          <Handle type="source" position={Position.Right} id="true" className="w-3 h-3 bg-green-500 absolute -right-4 top-1" />
        </div>
        <div className="relative">
          <span className="text-red-600 mr-4">False</span>
          <Handle type="source" position={Position.Right} id="false" className="w-3 h-3 bg-red-500 absolute -right-4 top-1" />
        </div>
      </div>
    </div>
  );
};
