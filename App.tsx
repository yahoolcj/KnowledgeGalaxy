
import React, { useState, useCallback } from 'react';
import { GraphData, GraphNode, ProcessingState } from './types';
import { extractRelationships } from './services/geminiService';
import GraphView from './components/GraphView';
import { Upload, FileText, Info, Loader2, Star, Trash2 } from 'lucide-react';

declare const mammoth: any;

const App: React.FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing({ status: 'parsing', progress: 20, message: '正在解析文档内容...' });

    try {
      let text = '';
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        setProcessing({ status: 'error', progress: 0, message: '目前仅支持 DOCX、TXT 或 MD 格式，请转换后重试。' });
        return;
      } else {
        text = await file.text();
      }

      if (!text.trim()) {
        throw new Error("文档内容似乎为空。");
      }

      setProcessing({ status: 'analyzing', progress: 50, message: '知识引擎正在构建语义关系网络...' });
      
      const graphData = await extractRelationships(text);
      
      setData(graphData);
      setProcessing({ status: 'rendering', progress: 90, message: '正在初始化 3D 银河景观...' });
      
      setTimeout(() => {
        setProcessing({ status: 'idle', progress: 100, message: '' });
      }, 1000);

    } catch (error: any) {
      console.error(error);
      setProcessing({ 
        status: 'error', 
        progress: 0, 
        message: error.message || '文档处理失败，请重试。' 
      });
    }
  };

  const reset = () => {
    setData(null);
    setSelectedNode(null);
    setProcessing({ status: 'idle', progress: 0, message: '' });
  };

  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden">
      {/* 星空背景 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
      </div>

      <main className="relative z-10 w-full h-full flex flex-col">
        {/* 页眉 */}
        <header className="p-6 flex justify-between items-center border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Star className="text-white fill-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">知识银河</h1>
              <p className="text-xs text-indigo-300 font-medium">3D 语义关系探索</p>
            </div>
          </div>
          
          {data && (
            <button 
              onClick={reset}
              className="px-4 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} /> 重置应用
            </button>
          )}
        </header>

        {/* 视口区域 */}
        <div className="flex-1 relative">
          {!data && processing.status === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/30">
                  <Upload size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">构建您的知识银河</h2>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                  上传一个文档（DOCX, TXT），知识引擎将为您抽取核心实体与语义关系，并在 3D 星空中可视化展示。
                </p>
                <label className="w-full">
                  <span className="cursor-pointer w-full inline-block py-4 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                    选择并上传文档
                  </span>
                  <input type="file" className="hidden" accept=".docx,.txt,.md" onChange={handleFileUpload} />
                </label>
                <p className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest">支持格式：.docx, .txt, .md</p>
              </div>
            </div>
          )}

          {processing.status !== 'idle' && processing.status !== 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-xs text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-indigo-400" size={48} />
                <h3 className="text-lg font-medium mb-1">{processing.message}</h3>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-4">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${processing.progress}%` }} 
                  />
                </div>
              </div>
            </div>
          )}

          {processing.status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
               <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <p className="text-red-400 mb-4">{processing.message}</p>
                  <button onClick={reset} className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all">返回重试</button>
               </div>
            </div>
          )}

          {data && (
            <div className="w-full h-full">
              <GraphView data={data} onNodeClick={setSelectedNode} />
            </div>
          )}
        </div>

        {/* 侧边信息栏 (选中节点) */}
        {selectedNode && (
          <div className="absolute right-6 top-24 bottom-6 w-80 z-20 animate-in slide-in-from-right duration-300">
            <div className="h-full bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl flex flex-col p-6 shadow-2xl">
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              
              <div className="mb-6">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {translateType(selectedNode.type)}
                </span>
                <h3 className="text-2xl font-bold mt-3 leading-tight">{selectedNode.name}</h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                  <Info size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">智能语义分析</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedNode.description || "知识引擎识别出此节点为文档中的关键实体，它在整体叙事和主题连接中扮演着重要角色。"}
                </p>

                <div className="mt-8">
                  <div className="flex items-center gap-2 text-indigo-400 mb-4">
                    <Star size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">重要程度评估</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{selectedNode.val}</span>
                    <span className="text-gray-500 mb-1">/ 10</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                    <div 
                      className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" 
                      style={{ width: `${selectedNode.val * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 text-[10px] text-gray-500 uppercase tracking-widest text-center">
                由先进知识引擎驱动
              </div>
            </div>
          </div>
        )}

        {/* 图例 */}
        {data && (
          <div className="absolute bottom-6 left-6 z-20 bg-black/40 border border-white/5 backdrop-blur-md rounded-xl p-4 flex flex-col gap-2 shadow-lg">
            <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">星系类型</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 max-w-xs">
              <LegendItem color="#60a5fa" label="核心概念" />
              <LegendItem color="#f87171" label="人物/角色" />
              <LegendItem color="#4ade80" label="地理位置" />
              <LegendItem color="#fbbf24" label="组织/实体" />
              <LegendItem color="#a78bfa" label="关键事件" />
            </div>
          </div>
        )}
      </main>

      {/* 浮动提示 */}
      {!data && processing.status === 'idle' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-4 animate-bounce pointer-events-none">
           <div className="flex items-center gap-2 text-white/40 text-sm">
              <FileText size={16} /> 请选择一个文档以开始探索
           </div>
        </div>
      )}
    </div>
  );
};

const translateType = (type: string) => {
  const map: Record<string, string> = {
    concept: '概念',
    person: '人物',
    location: '地点',
    entity: '实体',
    event: '事件',
    document: '文档'
  };
  return map[type] || type;
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}></div>
    <span className="text-xs text-gray-400 whitespace-nowrap">{label}</span>
  </div>
);

export default App;
