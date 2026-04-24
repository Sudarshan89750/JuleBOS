import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Clock, AlertCircle, CheckCircle2, Activity } from 'lucide-react';

export const HistoryPanel = ({ onClose }: { onClose: () => void }) => {
  const [executions, setExecutions] = useState<any[]>([]);
  const [selectedExec, setSelectedExec] = useState<string | null>(null);
  const [execDetails, setExecDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/executions');
      setExecutions(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchDetails = async (id: string) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/executions/${id}`);
      setExecDetails(res.data);
      setSelectedExec(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute top-0 right-0 w-[500px] h-full bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col transition-all">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2"><Activity size={18} /> Execution History</h2>
        <button onClick={onClose} className="hover:text-gray-300"><X size={20} /></button>
      </div>

      {!selectedExec ? (
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-gray-500 mt-10">Loading history...</div>
          ) : executions.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No executions found. Deploy a flow and trigger it!</div>
          ) : (
            <div className="flex flex-col gap-3">
              {executions.map((exec) => (
                <div
                  key={exec.execution_id}
                  onClick={() => fetchDetails(exec.execution_id)}
                  className="border rounded p-3 cursor-pointer hover:bg-gray-50 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-500">{exec.execution_id.split('-')[0]}</span>
                    {exec.has_error ?
                      <span className="flex items-center gap-1 text-red-600 text-xs font-bold"><AlertCircle size={14}/> Error</span> :
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle2 size={14}/> Success</span>
                    }
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{new Date(exec.started_at).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {exec.total_duration_ms}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-gray-100 p-2 border-b flex items-center gap-2">
            <button onClick={() => setSelectedExec(null)} className="text-sm text-blue-600 hover:underline">← Back</button>
            <span className="text-xs font-mono text-gray-500 truncate">{selectedExec}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {execDetails.map((node, i) => (
              <div key={node.id} className="border rounded shadow-sm">
                <div className={`p-2 border-b flex justify-between items-center ${node.status === 'error' ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <strong className="text-sm capitalize">{node.node_type} Node</strong>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">{node.duration_ms}ms</span>
                    {node.status === 'error' ? <AlertCircle size={14} className="text-red-500"/> : <CheckCircle2 size={14} className="text-green-500"/>}
                  </div>
                </div>
                <div className="p-3 bg-gray-900 text-green-400 font-mono text-[10px] overflow-x-auto whitespace-pre max-h-64">
                  {node.context_snapshot ? JSON.stringify(JSON.parse(node.context_snapshot), null, 2) : 'No data'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
