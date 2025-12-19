
import { GoogleGenAI, Type } from "@google/genai";
import { GraphData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractRelationships = async (text: string): Promise<GraphData> => {
  // Use gemini-3-pro-preview for complex semantic analysis
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `以下是需要分析的文本内容:\n\n${text.substring(0, 30000)}`,
    config: {
      systemInstruction: `你是一个专业的语义分析助手。请分析提供的文本并提取高质量的知识图谱数据。
      识别关键实体（人物、组织、地点、概念、事件）及其相互联系。
      输出必须是一个干净的 JSON 对象，包含节点 (nodes) 和连接 (links)。
      请确保所有提取的内容（名称、描述、关系标签）均使用中文。`,
      // Thinking budget helps improve the quality of relationship extraction
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
                id: { type: Type.STRING, description: "节点的唯一 ID" },
                name: { type: Type.STRING, description: "显示名称" },
                type: { 
                  type: Type.STRING, 
                  description: "节点类别 (concept, entity, person, location, event, document)" 
                },
                val: { type: Type.NUMBER, description: "重要性评分 (1-10)" },
                description: { type: Type.STRING, description: "关于该节点的简要背景信息" }
              },
              required: ["id", "name", "type", "val"]
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING, description: "源节点的 ID" },
                target: { type: Type.STRING, description: "目标节点的 ID" },
                label: { type: Type.STRING, description: "关系的性质" }
              },
              required: ["source", "target", "label"]
            }
          }
        },
        required: ["nodes", "links"]
      }
    }
  });

  try {
    const textOutput = response.text || '{}';
    const data = JSON.parse(textOutput);
    return data as GraphData;
  } catch (error) {
    console.error("解析响应失败:", error);
    throw new Error("知识引擎返回的图表数据无效");
  }
};
