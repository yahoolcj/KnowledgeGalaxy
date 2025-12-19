
import React, { useState, useEffect } from 'react';
import { GraphData, GraphNode, ProcessingState, AppConfig, AnalysisLog } from './types';
import { extractRelationships } from './services/geminiService';
import GraphView, { GALAXY_COLORS } from './components/GraphView';
import SettingsModal from './components/SettingsModal';
import LogPanel from './components/LogPanel';
import { Upload, FileText, Info, Loader2, Star, Trash2, Settings, ListTodo } from 'lucide-react';

declare const mammoth: any;

const STORAGE_KEY = 'knowledge_galaxy_config';

const App: React.FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("加载配置失败", e);
      }
    }
    return {
      vendor: 'google',
      apiKey: '',
      model: 'gemini-3-pro-preview'
    };
  });

  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const saveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const addLog = (log: Omit<AnalysisLog, 'id' | 'timestamp'>) => {
    const newLog: AnalysisLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制大小 (例如 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setProcessing({ status: 'error', progress: 0, message: '文件过大，请上传 20MB 以内的文档。' });
      return;
    }

    setProcessing({ status: 'parsing', progress: 20, message: '正在解析文档内容...' });

    try {
      let text = '';
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        throw new Error('目前仅支持 DOCX、TXT 或 MD 格式。');
      } else {
        text = await file.text();
      }

      if (!text.trim()) throw new Error("文档内容为空。");

      setProcessing({ 
        status: 'analyzing', 
        progress: 50, 
        message: `知识引擎正在构建语义星系...` 
      });
      
      const graphData = await extractRelationships(text, config);
      
      setData(graphData);
      setProcessing({ status: 'rendering', progress: 90, message: '正在渲染沉浸式 3D 景观...' });
      
      addLog({
        filename: file.name,
        vendor: config.vendor,
        model: config.model,
        status: 'success'
      });

      setTimeout(() => {
        setProcessing({ status: 'idle', progress: 100, message: '' });
      }, 1000);

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || '处理失败，请检查 API 配置。';
      setProcessing({ status: 'error', progress: 0, message: errorMsg });
      addLog({ filename: file.name, vendor: config.vendor, model: config.model, status: 'error', errorMessage: errorMsg });
    }
    e.target.value = '';
  };

  const reset = () => {
    setData(null);
    setSelectedNode(null);
    setProcessing({ status: 'idle', progress: 0, message: '' });
  };

  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden font-sans select-none">
      {/* 极简星空叠加层 */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      <main className="relative z-10 w-full h-full flex flex-col">
        {/* 页眉 - 移除标题斜体效果 */}
        <header className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-black/60 backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/90 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] rotate-3">
              <Star className="text-white fill-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">知识银河</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em]">3D 语义关系探索</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLogOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-400 hover:text-white flex items-center gap-3 group"
            >
              <ListTodo size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">任务日志</span>
              {logs.length > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                  {logs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-400 hover:text-white group"
            >
              <Settings size={20} className="group-hover:rotate-90 transition-transform" />
            </button>

            {data && (
              <button 
                onClick={reset}
                className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <Trash2 size={16} /> 重置
              </button>
            )}
          </div>
        </header>

        {/* 视口区域 */}
        <div className="flex-1 relative">
          {!data && processing.status === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-xl w-full p-12 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 text-white shadow-2xl shadow-indigo-500/20 rotate-6">
                  <Upload size={40} />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tight">探索未知的知识宇宙</h2>
                <p className="text-gray-400 mb-10 text-lg leading-relaxed max-w-sm mx-auto">
                  上传文档（支持 .docx, .txt, .md，建议小于 20MB），让 AI 为您解析海量信息，编织一张闪耀的 3D 星系语义图。
                </p>
                
                <div className="w-full space-y-6">
                  <label className="w-full">
                    <span className="cursor-pointer w-full inline-block py-5 px-10 bg-white text-black hover:bg-indigo-50 rounded-2xl font-black text-lg transition-all shadow-2xl active:scale-[0.98] uppercase tracking-tighter text-center">
                      开始构建星系
                    </span>
                    <input type="file" className="hidden" accept=".docx,.txt,.md" onChange={handleFileUpload} />
                  </label>
                  
                  {!config.apiKey && config.vendor !== 'google' && (
                    <div className="py-3 px-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                      <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                        请先在设置中配置 {config.vendor} API Key
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {processing.status !== 'idle' && processing.status !== 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-sm text-center">
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <Loader2 className="animate-spin text-indigo-500 w-full h-full" strokeWidth={1} />
                  <Star className="absolute inset-0 m-auto text-white animate-pulse" size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{processing.message}</h3>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-8">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out" 
                    style={{ width: `${processing.progress}%` }} 
                  />
                </div>
              </div>
            </div>
          )}

          {processing.status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/90 backdrop-blur-xl">
              <div className="max-w-md p-10 bg-red-500/5 border border-red-500/20 rounded-[2rem] text-center">
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Info size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">分析过程中出现错误</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">{processing.message}</p>
                <button 
                  onClick={() => setProcessing({ status: 'idle', progress: 0, message: '' })}
                  className="px-8 py-3 bg-white text-black rounded-xl font-bold transition-transform active:scale-95"
                >
                  返回重试
                </button>
              </div>
            </div>
          )}

          {data && (
            <div className="w-full h-full">
              <GraphView data={data} onNodeClick={setSelectedNode} />
            </div>
          )}
        </div>

        {/* 侧边信息栏 */}
        {selectedNode && (
          <div className="absolute right-8 top-32 bottom-8 w-96 z-20 animate-in slide-in-from-right-12 duration-500">
            <div className="h-full bg-black/80 border border-white/10 backdrop-blur-3xl rounded-[2rem] flex flex-col p-8 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full"
              >
                ✕
              </button>
              
              <div className="mb-8">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedNode.color, boxShadow: `0 0 10px ${selectedNode.color}` }}></div>
                  <span className="text-[11px] uppercase font-black tracking-[0.2em]" style={{ color: selectedNode.color }}>
                    {translateType(selectedNode.type)}
                  </span>
                </div>
                <h3 className="text-4xl font-black leading-none tracking-tighter">{selectedNode.name}</h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                <section>
                  <div className="flex items-center gap-3 text-indigo-400 mb-4">
                    <Info size={20} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">语义分析数据</span>
                  </div>
                  <p className="text-gray-200 text-lg leading-relaxed font-medium">
                    {selectedNode.description || "该星体的重要语义细节正在深度挖掘中。"}
                  </p>
                </section>
                
                <section className="p-6 rounded-3xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3 text-indigo-400 mb-6">
                    <Star size={20} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">星系等级评估</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-6xl font-black italic tracking-tighter">{selectedNode.val}</span>
                    <span className="text-gray-500 font-bold">/ 10</span>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-in-out" 
                      style={{ width: `${selectedNode.val * 10}%`, backgroundColor: selectedNode.color }}
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* 底部图例 */}
        {data && (
          <div className="absolute bottom-10 left-10 z-20 bg-black/60 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-400/80">星系图例</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-3 max-w-sm">
              <LegendItem color={GALAXY_COLORS.concept} label="核心概念" />
              <LegendItem color={GALAXY_COLORS.person} label="人物角色" />
              <LegendItem color={GALAXY_COLORS.location} label="地理位置" />
              <LegendItem color={GALAXY_COLORS.entity} label="组织实体" />
              <LegendItem color={GALAXY_COLORS.event} label="关键事件" />
            </div>
          </div>
        )}
      </main>

      {/* 弹窗组件 */}
      {isSettingsOpen && <SettingsModal config={config} onClose={() => setIsSettingsOpen(false)} onSave={saveConfig} />}
      {isLogOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm" onClick={() => setIsLogOpen(false)} />
          <LogPanel logs={logs} onClose={() => setIsLogOpen(false)} onClear={() => setLogs([])} />
        </>
      )}
    </div>
  );
};

const translateType = (type: string) => {
  const map: Record<string, string> = {
    concept: '概念', person: '角色', location: '地点', entity: '实体', event: '事件', document: '参考'
  };
  return map[type.toLowerCase()] || type;
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-3 group cursor-help">
    <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}></div>
    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{label}</span>
  </div>
);

export default App;
