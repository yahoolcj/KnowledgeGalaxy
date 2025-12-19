
import React, { useRef, useMemo, useEffect } from 'react';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import { GraphData, GraphNode } from '../types';

interface GraphViewProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ data, onNodeClick }) => {
  // Fix: Added null as initial value to resolve "Expected 1 arguments, but got 0"
  const fgRef = useRef<ForceGraphMethods>(null);

  // 实体类型的颜色映射
  const typeColors: Record<string, string> = {
    concept: '#60a5fa', // 蓝色 - 概念
    person: '#f87171',  // 红色 - 人物
    location: '#4ade80', // 绿色 - 地点
    entity: '#fbbf24',   // 黄色 - 实体/组织
    event: '#a78bfa',    // 紫色 - 事件
    document: '#ffffff'  // 白色 - 文档
  };

  const processedData = useMemo(() => {
    return {
      nodes: data.nodes.map(n => ({
        ...n,
        color: typeColors[n.type] || '#ffffff'
      })),
      links: data.links
    };
  }, [data]);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('link')?.distance(120);
      fgRef.current.d3Force('charge')?.strength(-200);
    }
  }, [processedData]);

  // 创建文本精灵图的辅助函数
  const createTextLabel = (text: string, color: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    const fontSize = 24;
    context.font = `${fontSize}px "Inter", sans-serif`;
    const textWidth = context.measureText(text).width;

    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;

    // 绘制半透明背景以便在复杂背景下阅读
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    // Use fallback for roundRect if it's not available in the current environment's types
    if (typeof (context as any).roundRect === 'function') {
      (context as any).roundRect(0, 0, canvas.width, canvas.height, 5);
    } else {
      context.rect(0, 0, canvas.width, canvas.height);
    }
    context.fill();

    context.font = `bold ${fontSize}px "Inter", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // 根据文字长度调整精灵图比例
    const aspectRatio = canvas.width / canvas.height;
    sprite.scale.set(aspectRatio * 10, 10, 1);
    
    return sprite;
  };

  return (
    <div className="w-full h-full relative">
      <ForceGraph3D
        ref={fgRef}
        graphData={processedData}
        backgroundColor="#000000"
        showNavInfo={false}
        nodeLabel={(node: any) => `
          <div class="bg-gray-900 border border-gray-700 p-2 rounded shadow-xl text-white">
            <div class="font-bold text-lg">${node.name}</div>
            <div class="text-xs uppercase text-gray-400 mb-1">${node.type}</div>
            <div class="text-sm max-w-xs">${node.description || '暂无详细信息'}</div>
          </div>
        `}
        nodeRelSize={4}
        nodeVal={(node: any) => Math.max(node.val, 2)}
        nodeColor={(node: any) => node.color}
        linkColor={() => 'rgba(255, 255, 255, 0.15)'}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.005}
        linkWidth={0.5}
        onNodeClick={(node: any) => onNodeClick(node as GraphNode)}
        nodeThreeObject={(node: any) => {
          const group = new THREE.Group();
          
          // 1. 核心发光球体
          const geometry = new THREE.SphereGeometry(Math.max(node.val, 2));
          const material = new THREE.MeshPhongMaterial({
            color: node.color,
            transparent: true,
            opacity: 0.8,
            emissive: node.color,
            emissiveIntensity: 0.6
          });
          const sphere = new THREE.Mesh(geometry, material);
          group.add(sphere);

          // 2. 悬浮文字标题
          const label = createTextLabel(node.name, '#ffffff');
          if (label) {
            label.position.set(0, Math.max(node.val, 2) + 8, 0);
            group.add(label);
          }

          return group;
        }}
        nodeThreeObjectExtend={false}
      />
      
      {/* 银河背景增强 */}
      <div className="absolute inset-0 pointer-events-none opacity-50 mix-blend-screen" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(60, 40, 150, 0.15) 0%, transparent 80%), url(https://www.transparenttextures.com/patterns/stardust.png)',
        backgroundSize: 'cover'
      }} />
    </div>
  );
};

export default GraphView;
