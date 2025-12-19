
import { GoogleGenAI, Type } from "@google/genai";
import { GraphData, AppConfig, VendorID } from "../types";

const SYSTEM_INSTRUCTION = `你是一个专业的语义分析助手。请分析提供的文本并提取高质量的知识图谱数据。
你需要将提取的实体归类为以下具体的“星系类型”：
- concept (核心概念/理论)
- person (人物/角色)
- location (地理位置)
- entity (组织/机构/物体)
- event (关键事件/历史时刻)
- document (参考资料/文献)

识别这些实体之间的强关联。
输出必须是一个干净的 JSON 对象，包含节点 (nodes) 和连接 (links)。
请确保所有提取的内容（名称、描述、关系标签）均使用中文。`;

const JSON_SCHEMA_PROMPT = `
请严格按照以下 JSON 格式输出：
{
  "nodes": [
    { "id": "唯一ID", "name": "显示名称", "type": "concept/person/location/entity/event/document", "val": 1-10重要评分, "description": "背景描述" }
  ],
  "links": [
    { "source": "源ID", "target": "目标ID", "label": "关系描述" }
  ]
}`;

/**
 * 根据厂商和用户输入获取最终使用的 API Key
 * 优先级：用户手动设置 > 环境变量
 */
const getEffectiveKey = (vendor: VendorID, userKey: string): string => {
  if (userKey) return userKey;
  
  switch (vendor) {
    case 'google': return (process.env as any).API_KEY || '';
    case 'deepseek': return (process.env as any).DEEPSEEK_API_KEY || '';
    case 'alibaba': return (process.env as any).ALIBABA_API_KEY || '';
    case 'bytedance': return (process.env as any).BYTEDANCE_API_KEY || '';
    default: return '';
  }
};

export const extractRelationships = async (text: string, config: AppConfig): Promise<GraphData> => {
  const activeKey = getEffectiveKey(config.vendor, config.apiKey);
  const activeModel = config.model;

  if (!activeKey) {
    throw new Error(`请先在设置中配置 ${config.vendor.toUpperCase()} 的 API Key 或联系管理员配置环境变量。`);
  }

  // 处理 Google Gemini (原生支持 Schema)
  if (config.vendor === 'google') {
    const ai = new GoogleGenAI({ apiKey: activeKey });
    const response = await ai.models.generateContent({
      model: activeModel,
      contents: `以下是需要分析的文本内容:\n\n${text.substring(0, 30000)}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  val: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["id", "name", "type", "val"]
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  label: { type: Type.STRING }
                },
                required: ["source", "target", "label"]
              }
            }
          },
          required: ["nodes", "links"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  // 处理其他厂商 (OpenAI 兼容接口)
  let endpoint = '';
  switch (config.vendor) {
    case 'deepseek': endpoint = 'https://api.deepseek.com/v1/chat/completions'; break;
    case 'alibaba': endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'; break;
    case 'bytedance': endpoint = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'; break;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${activeKey}`
    },
    body: JSON.stringify({
      model: activeModel,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION + "\n" + JSON_SCHEMA_PROMPT },
        { role: 'user', content: text.substring(0, 30000) }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `请求 ${config.vendor} 失败`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("JSON 解析失败:", content);
    throw new Error("模型返回了无效的 JSON 格式，请重试。");
  }
};
