# 知识银河 (Knowledge Galaxy) 🌌

**知识银河** 是一款基于 AI 驱动的开源文档分析与 3D 可视化工具。它能够将枯燥的文档内容（如 .docx, .txt, .md）瞬间转化为浩瀚星系中的 3D 语义关系图谱，让复杂的知识结构触手可及。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-r173-black.svg)

## 🌟 项目亮点

- **AI 语义提取**：利用先进的大语言模型深度理解文本，自动识别人物、组织、地理位置、核心概念及关键事件。
- **3D 沉浸式星系**：基于 Three.js 和 Force-Graph 的高性能 3D 渲染，将知识点模拟为发光的星体，关系连线模拟为星轨。
- **多格式支持**：原生支持 `.docx`、`.txt`、`.md` 等多种文档格式的解析与读取。
- **交互式探索**：支持自由旋转、缩放 3D 视角，点击节点可查看由 AI 生成的深度背景分析及重要程度评估。
- **全中文化支持**：针对中文语境优化，无论是界面文案还是 AI 提取的知识点，均完美适配中文显示。

## 🛠️ 技术栈

- **前端框架**: [React 19](https://react.dev/)
- **3D 引擎**: [Three.js](https://threejs.org/) & [React Force Graph](https://github.com/vasturiano/react-force-graph)
- **AI 引擎**: [Google Gemini API](https://ai.google.dev/) (通过 `@google/genai` SDK)
- **样式处理**: [Tailwind CSS](https://tailwindcss.com/)
- **图标库**: [Lucide React](https://lucide.dev/)
- **文档解析**: [Mammoth.js](https://github.com/mwilliamson/mammoth.js) (处理 DOCX)

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/knowledge-galaxy.git
cd knowledge-galaxy
```

### 2. 环境配置
在根目录或部署环境中配置您的 API 密钥：
```env
API_KEY=您的_GEMINI_API_KEY
```

### 3. 安装依赖与启动
```bash
npm install
npm run dev
```

## 📂 项目结构
- `src/components/GraphView.tsx`: 3D 星系图核心渲染组件。
- `src/services/geminiService.ts`: AI 语义提取与图谱构建逻辑。
- `src/App.tsx`: 应用主状态管理与交互逻辑。
- `src/types.ts`: 全局数据模型定义。

## 🎨 视觉预览
- **初始界面**：简约的宇宙黑背景，带有动态星尘效果。
- **处理中**：流线型的进度条与 AI 实时分析状态反馈。
- **结果展示**：五彩斑斓的发光节点，节点上方悬浮显示中文名称，右侧提供详细的侧边信息面板。

## 📄 开源协议
本项目采用 [MIT License](LICENSE) 协议。

---
*让知识在星系间流动。*