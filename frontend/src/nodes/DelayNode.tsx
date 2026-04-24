import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Timer } from 'lucide-react';

export const DelayNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-slate-500 shadow-md min-w-[200px] cursor-default">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-500" />
      <div className="bg-slate-100 p-2 border-b border-slate-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <Timer size={16} className="text-slate-600" />
        <strong className="text-slate-800 text-sm">Delay (Sleep)</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Wait Time (ms)</label>
          <input
            type="number"
            className="text-sm p-1 border rounded"
            placeholder="5000"
            defaultValue={data.duration || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'duration', parseInt(e.target.value))}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-500" />
    </div>
  );
};
