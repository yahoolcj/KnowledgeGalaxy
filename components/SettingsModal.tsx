
import React, { useState } from 'react';
import { X, Key, Cpu, Sparkles, Check, ChevronRight, Globe, Zap, Shield, Rocket } from 'lucide-react';
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
    models: [
      { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro', recommended: true },
      { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', recommended: true },
      { id: 'gemini-2.5-flash-lite-latest', label: 'Gemini 2.5 Flash Lite', recommended: false },
    ]
  },
  { 
    id: 'deepseek' as VendorID, 
    name: 'DeepSeek', 
    icon: Zap, 
    color: 'text-indigo-400',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek-V3', recommended: false },
      { id: 'deepseek-reasoner', label: 'DeepSeek-R1 (推理)', recommended: false },
    ]
  },
  { 
    id: 'alibaba' as VendorID, 
    name: '通义千问 (Qwen)', 
    icon: Shield, 
    color: 'text-orange-400',
    models: [
      { id: 'qwen-max', label: 'Qwen Max', recommended: false },
      { id: 'qwen-plus', label: 'Qwen Plus', recommended: false },
      { id: 'qwen-turbo', label: 'Qwen Turbo', recommended: false },
    ]
  },
  { 
    id: 'bytedance' as VendorID, 
    name: '豆包 (Doubao)', 
    icon: Rocket, 
    color: 'text-blue-500',
    models: [
      { id: 'doubao-pro-4k', label: 'Doubao Pro', recommended: false },
      { id: 'doubao-lite-4k', label: 'Doubao Lite', recommended: false },
    ]
  }
];

const SettingsModal: React.FC<SettingsModalProps> = ({ config, onClose, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>({ ...config });
  const [activeVendorId, setActiveVendorId] = useState<VendorID>(config.vendor);

  const activeVendor = VENDORS.find(v => v.id === activeVendorId)!;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleVendorChange = (id: VendorID) => {
    setActiveVendorId(id);
    // 切换厂商时，自动选择该厂商的第一个推荐模型或第一个模型
    const vendor = VENDORS.find(v => v.id === id)!;
    const defaultModel = vendor.models.find(m => m.recommended) || vendor.models[0];
    setLocalConfig({ ...localConfig, vendor: id, model: defaultModel.id });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-[600px] max-h-[90vh]">
        
        {/* Left Sidebar: Vendors */}
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col gap-2 overflow-y-auto">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">选择厂商</h3>
          {VENDORS.map((v) => (
            <button
              key={v.id}
              onClick={() => handleVendorChange(v.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeVendorId === v.id 
                  ? 'bg-white/10 text-white ring-1 ring-white/10' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <v.icon size={18} className={v.color} />
              <span className="text-sm font-medium whitespace-nowrap">{v.name}</span>
              {activeVendorId === v.id && <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full" />}
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
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Key size={14} /> {activeVendor.name} API Key
              </label>
              <input
                type="password"
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                placeholder={`输入您的 ${activeVendor.name} 密钥`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                您的密钥将仅保存在本地浏览器缓存中。{activeVendor.id === 'google' && "若为空则尝试使用系统内置密钥。"}
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={14} /> 选择模型
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
                      <span className="text-[10px] opacity-60">{m.id}</span>
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

              <div className="pt-2">
                <label className="text-[10px] text-gray-500 block mb-2 uppercase">自定义模型标识符</label>
                <input
                  type="text"
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  placeholder="手动输入模型 ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
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
              <Check size={18} /> 保存并生效
            </button>
          </div>
        </div>

        {/* Overlay Close for Desktop */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors hidden md:flex"
        >
          <X size={24} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
