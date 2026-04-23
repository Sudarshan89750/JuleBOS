import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Rss } from 'lucide-react';

export const EventNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-md border-2 border-pink-500 shadow-md min-w-[200px]  cursor-default">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-pink-500" />
      <div className="bg-pink-100 p-2 border-b border-pink-200 rounded-t-sm flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
        <Rss size={16} className="text-pink-600" />
        <strong className="text-pink-800 text-sm">Publish Event</strong>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Topic</label>
          <input
            type="text"
            className="text-sm p-1 border rounded"
            placeholder="user.created"
            defaultValue={data.topic || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'topic', e.target.value)}
          />

          <label className="text-xs text-gray-500 mt-1">Message Body</label>
          <textarea
            className="text-sm p-1 border rounded h-16 font-mono"
            placeholder={"{\"id\": \"{{trigger.payload.id}}\"}"}
            defaultValue={data.message || ''}
            onChange={(e) => data.onChange && data.onChange(data.id, 'message', e.target.value)}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-pink-500" />
    </div>
  );
};
