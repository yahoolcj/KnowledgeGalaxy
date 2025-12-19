
import React, { useRef, useMemo, useEffect } from 'react';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import { GraphData, GraphNode } from '../types';

interface GraphViewProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

// 宇宙星系视觉标准色
export const GALAXY_COLORS: Record<string, string> = {
  concept: '#00f2ff',   // 赛博青
  person: '#ff0055',    // 脉冲红
  location: '#00ffaa',  // 极光绿
  entity: '#ffcc00',    // 恒星金
  event: '#9d00ff',     // 虚空紫
  document: '#ffffff'   // 纯白
};

const GraphView: React.FC<GraphViewProps> = ({ data, onNodeClick }) => {
  const fgRef = useRef<ForceGraphMethods>(null);

  // 数据预处理
  const processedData = useMemo(() => {
    return {
      nodes: data.nodes.map(n => {
        const typeKey = (n.type || 'concept').toLowerCase();
        let color = GALAXY_COLORS[typeKey];
        if (!color) {
          if (/人|role|person/i.test(typeKey)) color = GALAXY_COLORS.person;
          else if (/地|位|loc/i.test(typeKey)) color = GALAXY_COLORS.location;
          else if (/事|event/i.test(typeKey)) color = GALAXY_COLORS.event;
          else if (/实|团|组|org|entity/i.test(typeKey)) color = GALAXY_COLORS.entity;
          else if (/文|书|doc/i.test(typeKey)) color = GALAXY_COLORS.document;
          else color = GALAXY_COLORS.concept;
        }
        return { ...n, color };
      }),
      links: data.links.map(l => ({ ...l }))
    };
  }, [data]);

  // 初始化 3D 场景增强：创建更加深邃、繁星点点的星空
  useEffect(() => {
    if (!fgRef.current) return;

    const scene = fgRef.current.scene();
    
    // 清除旧的星田
    const existingStarfield = scene.getObjectByName('Starfield');
    if (existingStarfield) scene.remove(existingStarfield);

    // 创建更加深邃的三维星海
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 20000; // 进一步增加星星数量
    const posArray = new Float32Array(starsCount * 3);
    const colorArray = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      // 位置散布在更广阔的空间，增加深度感
      const r = 1500 + Math.random() * 2500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      posArray[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i * 3 + 2] = r * Math.cos(phi);

      // 颜色随机微调，营造不同星等的效果
      const mixedColor = new THREE.Color();
      const rand = Math.random();
      if (rand > 0.95) mixedColor.setHex(0xddeeff); // 亮蓝白
      else if (rand > 0.90) mixedColor.setHex(0xfff4e0); // 暖白
      else mixedColor.setHex(0xffffff); // 纯白
      
      // 增加亮度变化，让部分星星更突出
      const intensity = 0.6 + Math.random() * 0.4;
      colorArray[i * 3] = mixedColor.r * intensity;
      colorArray[i * 3 + 1] = mixedColor.g * intensity;
      colorArray[i * 3 + 2] = mixedColor.b * intensity;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      size: 2.8, // 略微增加尺寸，使星星更明显
      vertexColors: true,
      transparent: true,
      opacity: 1.0, // 提高不透明度
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    starField.name = 'Starfield';
    scene.add(starField);

    // 视角初始化
    fgRef.current.d3Force('link')?.distance(200);
    fgRef.current.d3Force('charge')?.strength(-900);
    fgRef.current.cameraPosition({ z: 600 });

  }, [processedData]);

  // 绘制发光文字标签
  const createTextLabel = (text: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    const fontSize = 80;
    context.font = `bold ${fontSize}px "Inter", "Microsoft YaHei", sans-serif`;
    const textWidth = context.measureText(text).width;

    canvas.width = textWidth + 160;
    canvas.height = fontSize + 100;

    context.font = `bold ${fontSize}px "Inter", "Microsoft YaHei", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    context.shadowColor = 'rgba(0, 0, 0, 0.9)';
    context.shadowBlur = 30;
    
    context.strokeStyle = '#000000';
    context.lineWidth = 15;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    
    context.fillStyle = '#ffffff';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
      depthWrite: false,
      depthTest: false 
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    const aspectRatio = canvas.width / canvas.height;
    sprite.scale.set(aspectRatio * 18, 18, 1);
    
    return sprite;
  };

  return (
    <div className="w-full h-full relative bg-black">
      <ForceGraph3D
        ref={fgRef}
        graphData={processedData}
        backgroundColor="#000000"
        showNavInfo={false}
        
        linkColor={(link: any) => {
          const source = typeof link.source === 'object' ? link.source : processedData.nodes.find(n => n.id === link.source);
          return `${source?.color || '#ffffff'}cc`;
        }}
        linkWidth={2.0}
        linkResolution={12}
        
        linkDirectionalParticles={8} 
        linkDirectionalParticleWidth={3.8}
        linkDirectionalParticleSpeed={0.015}
        linkDirectionalParticleColor={(link: any) => {
          const source = typeof link.source === 'object' ? link.source : processedData.nodes.find(n => n.id === link.source);
          return source?.color || '#ffffff';
        }}
        
        onNodeClick={(node: any) => onNodeClick(node as GraphNode)}
        
        nodeThreeObject={(node: any) => {
          const group = new THREE.Group();
          const nodeColor = node.color || '#ffffff';
          const size = Math.max(node.val || 5, 2) * 1.5;
          
          const geometry = new THREE.SphereGeometry(size, 64, 64);
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(nodeColor),
            emissive: new THREE.Color(nodeColor),
            emissiveIntensity: 0.6,
            roughness: 0.1,
            metalness: 0.9,
            transparent: false
          });
          const sphere = new THREE.Mesh(geometry, material);
          group.add(sphere);

          const light = new THREE.PointLight(nodeColor, 60, 150);
          group.add(light);

          const glowGeo = new THREE.SphereGeometry(size * 1.6, 64, 64);
          const glowMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(nodeColor),
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
          });
          const glowSphere = new THREE.Mesh(glowGeo, glowMat);
          group.add(glowSphere);

          const label = createTextLabel(node.name);
          if (label) {
            label.position.y = size + 18;
            group.add(label);
          }

          return group;
        }}
        nodeThreeObjectExtend={false}
        
        nodeLabel={(node: any) => `
          <div style="background: rgba(0,0,0,0.95); border: 2px solid ${node.color}; padding: 22px; border-radius: 32px; color: white; min-width: 260px; backdrop-filter: blur(25px); box-shadow: 0 10px 60px ${node.color}55;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
              <div style="width: 18px; height: 18px; border-radius: 50%; background: ${node.color}; box-shadow: 0 0 25px ${node.color}"></div>
              <b style="font-size: 24px; letter-spacing: -0.03em;">${node.name}</b>
            </div>
            <div style="font-size: 11px; color: ${node.color}; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 4px; font-weight: 900; opacity: 0.8;">
              ${translateType(node.type)}
            </div>
            <div style="font-size: 16px; line-height: 1.8; color: #f8fafc; font-weight: 400; opacity: 0.9;">
              ${node.description || '语义星图引擎解析中...'}
            </div>
          </div>
        `}
      />
      
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 100%)'
        }}></div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none select-none text-white/10 text-[10px] uppercase tracking-[1em] font-black italic whitespace-nowrap">
        知识银河引擎 // 纯净流 v2.7.0
      </div>
    </div>
  );
};

const translateType = (type: string) => {
  const map: Record<string, string> = {
    concept: '核心概念', 
    person: '人物角色', 
    location: '地理位置', 
    entity: '实体组织', 
    event: '关键事件', 
    document: '参考文档'
  };
  return map[type.toLowerCase()] || type;
};

export default GraphView;
