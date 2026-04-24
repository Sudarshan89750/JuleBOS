import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Repeat } from 'lucide-react';

export const LoopNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-cyan-500 shadow-md min-w-[200px] cursor-default">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-500" />
      <div className="bg-cyan-100 p-2 border-b border-cyan-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <Repeat size={16} className="text-cyan-600" />
        <strong className="text-cyan-800 text-sm">For Each Loop</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Array to Loop `(context)`</label>
          <input
            className="text-sm p-1 border rounded font-mono"
            placeholder="{{dbResult}}"
            defaultValue={data.items || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'items', e.target.value)}
          />
          <span className="text-[10px] text-gray-400 italic mt-1 leading-tight">
            Use {'{{loopItem}}'} in downstream nodes.<br/>
            Must draw edge back here to loop!
          </span>
        </div>
      </div>

      {/* Right handles for branching */}
      <div className="flex flex-col items-end pr-2 pb-2 gap-2 text-xs font-semibold">
        <div className="relative">
          <span className="text-blue-600 mr-4">Next Item</span>
          <Handle type="source" position={Position.Right} id="item" className="w-3 h-3 bg-blue-500 absolute -right-4 top-1" />
        </div>
        <div className="relative">
          <span className="text-gray-600 mr-4">Done</span>
          <Handle type="source" position={Position.Right} id="done" className="w-3 h-3 bg-gray-500 absolute -right-4 top-1" />
        </div>
      </div>
    </div>
  );
};
