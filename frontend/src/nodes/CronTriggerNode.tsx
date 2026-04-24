import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CalendarClock } from 'lucide-react';

export const CronTriggerNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-emerald-500 shadow-md min-w-[200px] cursor-default">
      <div className="bg-emerald-100 p-2 border-b border-emerald-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <CalendarClock size={16} className="text-emerald-600" />
        <strong className="text-emerald-800 text-sm">Cron Trigger</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Cron Expression</label>
          <input
            type="text"
            className="text-sm p-1 border rounded font-mono"
            placeholder="* * * * *"
            defaultValue={data.expression || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'expression', e.target.value)}
          />
          <span className="text-[10px] text-gray-400 italic mt-1 leading-tight">
            Executes independently on the server.<br/>No HTTP Request needed.
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500" />
    </div>
  );
};
