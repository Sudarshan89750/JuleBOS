import React from 'react';

const onDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-4">
      <div className="text-sm font-semibold text-gray-600 mb-2">Drag Nodes</div>

      <div className="bg-white border-2 border-green-500 rounded p-2 text-sm text-center cursor-grab hover:bg-green-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'trigger')} draggable>
        HTTP Trigger
      </div>

      <div className="bg-white border-2 border-emerald-500 rounded p-2 text-sm text-center cursor-grab hover:bg-emerald-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'cron_trigger')} draggable>
        Cron Trigger
      </div>

      <div className="bg-white border-2 border-stone-600 rounded p-2 text-sm text-center cursor-grab hover:bg-stone-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'auth')} draggable>
        Auth (API Key)
      </div>

      <div className="bg-white border-2 border-blue-500 rounded p-2 text-sm text-center cursor-grab hover:bg-blue-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'database')} draggable>
        Database (SQLite)
      </div>

      <div className="bg-white border-2 border-orange-500 rounded p-2 text-sm text-center cursor-grab hover:bg-orange-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'api_request')} draggable>
        API Request
      </div>

      <div className="bg-white border-2 border-red-500 rounded p-2 text-sm text-center cursor-grab hover:bg-red-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'condition')} draggable>
        Condition (If/Else)
      </div>

      <div className="bg-white border-2 border-yellow-500 rounded p-2 text-sm text-center cursor-grab hover:bg-yellow-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'transform')} draggable>
        Transform JS
      </div>

      <div className="bg-white border-2 border-pink-500 rounded p-2 text-sm text-center cursor-grab hover:bg-pink-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'event_publish')} draggable>
        Publish Event
      </div>

      <div className="bg-white border-2 border-indigo-500 rounded p-2 text-sm text-center cursor-grab hover:bg-indigo-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'set_variable')} draggable>
        Set Variable
      </div>

      <div className="bg-white border-2 border-cyan-500 rounded p-2 text-sm text-center cursor-grab hover:bg-cyan-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'loop')} draggable>
        For Each Loop
      </div>

      <div className="bg-white border-2 border-slate-500 rounded p-2 text-sm text-center cursor-grab hover:bg-slate-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'delay')} draggable>
        Delay
      </div>

      <div className="bg-white border-2 border-purple-500 rounded p-2 text-sm text-center cursor-grab hover:bg-purple-50 shadow-sm"
           onDragStart={(event) => onDragStart(event, 'response')} draggable>
        HTTP Response
      </div>
    </aside>
  );
};
