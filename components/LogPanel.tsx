
import React from 'react';
import { X, Clock, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AnalysisLog } from '../types';

interface LogPanelProps {
  logs: AnalysisLog[];
  onClose: () => void;
  onClear: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClose, onClear }) => {
  return (
    <div className="fixed inset-y-0 left-0 w-80 md:w-96 bg-zinc-900 border-r border-white/10 z-[80] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock size={20} className="text-indigo-400" />
          任务日志
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClear}
            className="text-[10px] uppercase font-bold text-gray-500 hover:text-red-400 transition-colors"
          >
            清空日志
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 space-y-2">
            <AlertCircle size={32} />
            <p className="text-sm">暂无任务记录</p>
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className={`p-4 rounded-xl border transition-all ${
                log.status === 'success' 
                  ? 'bg-emerald-500/5 border-emerald-500/10' 
                  : 'bg-red-500/5 border-red-500/10'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium truncate text-gray-200">{log.filename}</span>
                </div>
                {log.status === 'success' ? (
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle size={14} className="text-red-400 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{log.vendor}</span>
                <span>•</span>
                <span className="truncate">{log.model}</span>
                <span className="ml-auto">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>

              {log.status === 'error' && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/10 rounded-lg">
                  <p className="text-[10px] text-red-300 leading-relaxed font-mono">
                    <span className="font-bold mr-1">失败原因:</span>
                    {log.errorMessage}
                  </p>
                </div>
              )}
            </div>
          ))
        ).reverse()}
      </div>

      <div className="p-4 border-t border-white/5 text-[10px] text-gray-500 text-center italic">
        日志仅在当前会话中保存，刷新页面后将重置。
      </div>
    </div>
  );
};

export default LogPanel;
