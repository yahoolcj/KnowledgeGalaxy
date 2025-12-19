
import React, { useState } from 'react';
import { X, Key, Cpu, Sparkles, Check, ChevronRight, Globe, Zap, Shield, Rocket, Info } from 'lucide-react';
import { AppConfig, VendorID } from '../types';

interface SettingsModalProps {
  config: AppConfig;
  onClose: () => void;
  onSave: (config: AppConfig) => void;
}

const VENDORS = [
  { 
    id: 'google' as VendorID, 
    name: 'Google Gemini', 
    icon: Sparkles, 
    color: 'text-blue-400',
    envVar: 'API_KEY',
    models: [
      { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (超强分析)', recommended: true },
      { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (极速响应)', recommended: false },
      { id: 'gemini-2.5-pro-preview-09-2025', label: 'Gemini 2.5 Pro', recommended: false },
    ]
  },
  { 
    id: 'deepseek' as VendorID, 
    name: 'DeepSeek', 
    icon: Zap, 
    color: 'text-indigo-400',
    envVar: 'DEEPSEEK_API_KEY',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek-V3 (语义图谱优化)', recommended: true },
      { id: 'deepseek-reasoner', label: 'DeepSeek-R1 (深度逻辑分析)', recommended: false },
    ]
  },
  { 
    id: 'alibaba' as VendorID, 
    name: '通义千问 (Qwen)', 
    icon: Shield, 
    color: 'text-orange-400',
    envVar: 'ALIBABA_API_KEY',
    models: [
      { id: 'qwen-max', label: 'Qwen Max (企业级解析)', recommended: true },
      { id: 'qwen-plus', label: 'Qwen Plus', recommended: false },
    ]
  },
  { 
    id: 'bytedance' as VendorID, 
    name: '豆包 (Doubao)', 
    icon: Rocket, 
    color: 'text-blue-500',
    envVar: 'BYTEDANCE_API_KEY',
    models: [
      { id: 'doubao-pro-128k', label: 'Doubao Pro (长文本专家)', recommended: true },
    ]
  }
];

const SettingsModal: React.FC<SettingsModalProps> = ({ config, onClose, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>({ ...config });
  const [activeVendorId, setActiveVendorId] = useState<VendorID>(config.vendor);

  const activeVendor = VENDORS.find(v => v.id === activeVendorId)!;
  const isEnvKeyConfigured = !!(process.env as any)[activeVendor.envVar];

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleVendorChange = (id: VendorID) => {
    setActiveVendorId(id);
    const vendor = VENDORS.find(v => v.id === id)!;
    const defaultModel = vendor.models.find(m => m.recommended) || vendor.models[0];
    setLocalConfig({ ...localConfig, vendor: id, model: defaultModel.id });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-[600px] max-h-[90vh]">
        
        {/* Left Sidebar: Vendors */}
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col gap-2 overflow-y-auto bg-zinc-950/30">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">模型厂商</h3>
          {VENDORS.map((v) => (
            <button
              key={v.id}
              onClick={() => handleVendorChange(v.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeVendorId === v.id 
                  ? 'bg-white/10 text-white ring-1 ring-white/10 shadow-lg shadow-black/40' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <v.icon size={18} className={v.color} />
              <span className="text-sm font-medium whitespace-nowrap">{v.name}</span>
            </button>
          ))}
        </div>

        {/* Right Content: Models and API Key */}
        <div className="flex-1 flex flex-col bg-zinc-900/50">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <activeVendor.icon size={20} className={activeVendor.color} />
              <h2 className="text-lg font-bold">{activeVendor.name} 配置</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors md:hidden">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            {/* API Key Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Key size={14} /> API Key
                </label>
                {isEnvKeyConfigured && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={10} /> 系统已预设
                  </span>
                )}
              </div>
              <input
                type="password"
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                placeholder={isEnvKeyConfigured ? "已预设环境变量，此处留空即可使用系统密钥" : `输入您的 ${activeVendor.name} 密钥`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[10px] text-gray-500 leading-relaxed italic">
                您的密钥将仅保存在本地浏览器缓存中。为了安全，建议由系统管理员在环境变量中进行全局配置。
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={14} /> 语义解析模型
              </label>
              <div className="grid grid-cols-1 gap-2">
                {activeVendor.models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setLocalConfig({ ...localConfig, model: m.id })}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      localConfig.model === m.id
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className="text-[10px] opacity-60 font-mono">{m.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.recommended && (
                        <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1">
                          <Sparkles size={10} /> 推荐
                        </span>
                      )}
                      {localConfig.model === m.id && <Check size={16} className="text-indigo-400" />}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="pt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-300 leading-relaxed">
                  以上模型均经过测试，能较好地支持复杂文档的实体识别与语义关系提取任务。
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-950/50 border-t border-white/5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Check size={18} /> 保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
