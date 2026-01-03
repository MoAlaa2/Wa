
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  Bot, MessageSquare, HelpCircle, Zap, Plus, X, ArrowLeft, Settings, 
  Trash2, Save, Image as ImageIcon, MousePointer, Hand, Undo, Redo, 
  ZoomIn, ZoomOut, Maximize, List, Clock, UserCheck, Tag
} from 'lucide-react';
import { FlowNode, ChatFlow, FlowEdge, FlowNodeOption, FlowNodeType, BotTrigger } from '../../../types';
import { whatsappService } from '../../../services/whatsappService';

const GRID_SIZE = 20;
const NODE_WIDTH = 280;

const ChatbotBuilderPage = () => {
  const { t, dir } = useLanguage();
  const [bots, setBots] = useState<ChatFlow[]>([]);
  const [activeBot, setActiveBot] = useState<ChatFlow | null>(null);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [editingBotMeta, setEditingBotMeta] = useState<Partial<ChatFlow>>({});
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [tool, setTool] = useState<'pointer' | 'hand'>('pointer');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectingSource, setConnectingSource] = useState<{ nodeId: string, handleId?: string } | null>(null);
  const [mousePosCanvas, setMousePosCanvas] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ChatFlow[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 }); 
  const transformRef = useRef(transform);
  const activeBotRef = useRef(activeBot);

  useEffect(() => { transformRef.current = transform; }, [transform]);
  useEffect(() => { activeBotRef.current = activeBot; }, [activeBot]);

  useEffect(() => { fetchBots(); }, []);

  const fetchBots = async () => {
    const data = await whatsappService.getChatFlows();
    setBots(data);
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDraggingCanvas) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      if (draggingNodeId && activeBotRef.current) {
        const scale = transformRef.current.scale;
        const dx = (e.clientX - dragStartRef.current.x) / scale;
        const dy = (e.clientY - dragStartRef.current.y) / scale;
        setActiveBot(prev => {
          if (!prev) return null;
          return {
            ...prev,
            nodes: prev.nodes.map(n => {
              if (n.id === draggingNodeId) {
                return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } };
              }
              return n;
            })
          };
        });
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        setMousePosCanvas({ x: (rawX - transformRef.current.x) / transformRef.current.scale, y: (rawY - transformRef.current.y) / transformRef.current.scale });
      }
    };

    const handleWindowMouseUp = () => {
      if (isDraggingCanvas) setIsDraggingCanvas(false);
      if (draggingNodeId) {
        setDraggingNodeId(null);
        if (activeBotRef.current) pushHistory(activeBotRef.current);
      }
      if (connectingSource) setConnectingSource(null);
    };

    if (isDraggingCanvas || draggingNodeId || connectingSource) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDraggingCanvas, draggingNodeId, connectingSource]);

  const pushHistory = (newState: ChatFlow) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newState)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setActiveBot(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setActiveBot(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.25, transform.scale + delta), 2);
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
        const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);
        setTransform({ x: newX, y: newY, scale: newScale });
      }
    } else {
      // Allow normal pan with scroll wheel if no keys
      setTransform(prev => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || tool === 'hand') {
      setIsDraggingCanvas(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (tool === 'pointer') {
      if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
        setSelectedNodeId(null);
      }
    }
  };

  const addNode = (type: FlowNodeType) => {
    if (!activeBot) return;
    const id = `node_${Date.now()}`;
    const viewCenterX = (-transform.x + (canvasRef.current?.clientWidth || 800) / 2) / transform.scale;
    const viewCenterY = (-transform.y + (canvasRef.current?.clientHeight || 600) / 2) / transform.scale;
    const newNode: FlowNode = {
      id, type, label: type.charAt(0).toUpperCase() + type.slice(1),
      data: { content: '', options: type === 'question' ? [{ id: `opt_${Date.now()}_1`, label: t.automation.chatbot.option1 }] : undefined },
      position: { x: viewCenterX - NODE_WIDTH/2, y: viewCenterY }
    };
    const newBotState = { ...activeBot, nodes: [...activeBot.nodes, newNode] };
    setActiveBot(newBotState);
    pushHistory(newBotState);
    setSelectedNodeId(id);
  };

  const updateNodeData = (id: string, data: any) => {
    if (!activeBot) return;
    setActiveBot({ ...activeBot, nodes: activeBot.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n) });
  };

  const deleteNode = (id: string) => {
    if (!activeBot) return;
    const newState = { ...activeBot, nodes: activeBot.nodes.filter(n => n.id !== id), edges: activeBot.edges.filter(e => e.source !== id && e.target !== id) };
    setActiveBot(newState);
    pushHistory(newState);
    setSelectedNodeId(null);
  };

  const handleMouseDownHandle = (e: React.MouseEvent, nodeId: string, handleId?: string) => {
    e.stopPropagation(); e.preventDefault();
    if (tool !== 'pointer') return;
    setConnectingSource({ nodeId, handleId });
  };

  const handleMouseUpNode = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (connectingSource && connectingSource.nodeId !== targetNodeId && activeBot) {
      const newEdge: FlowEdge = { id: `e_${Date.now()}`, source: connectingSource.nodeId, sourceHandle: connectingSource.handleId, target: targetNodeId };
      const newState = { ...activeBot, edges: [...activeBot.edges, newEdge] };
      setActiveBot(newState);
      pushHistory(newState);
    }
    setConnectingSource(null);
  };

  const getHandlePosition = (nodeId: string, handleId?: string) => {
    const node = activeBot?.nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    if (handleId) {
      const optIndex = node.data.options?.findIndex(o => o.id === handleId) ?? 0;
      return { x: node.position.x + NODE_WIDTH, y: node.position.y + 70 + (optIndex * 36) };
    }
    return { x: node.position.x + NODE_WIDTH / 2, y: node.position.y + (node.type === 'message' ? 80 : 60) }; 
  };

  const getTargetPosition = (nodeId: string) => {
    const node = activeBot?.nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.position.x, y: node.position.y + 20 };
  };

  const renderPath = (start: { x: number, y: number }, end: { x: number, y: number }) => {
    const dist = Math.abs(end.x - start.x);
    return `M ${start.x} ${start.y} C ${start.x + dist / 2} ${start.y}, ${end.x - dist / 2} ${end.y}, ${end.x} ${end.y}`;
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'message': return 'border-blue-500 bg-blue-50';
      case 'question': return 'border-purple-500 bg-purple-50';
      case 'action': return 'border-orange-500 bg-orange-50';
      case 'media': return 'border-pink-500 bg-pink-50';
      case 'list': return 'border-indigo-500 bg-indigo-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const handleCreateBot = () => { setEditingBotMeta({ name: t.automation.chatbot.newBot, language: 'ar' }); setIsBotModalOpen(true); };
  const handleSaveBotMeta = async () => {
    const botToSave = { 
      ...editingBotMeta, 
      id: editingBotMeta.id || `flow_${Date.now()}`, 
      nodes: [], 
      edges: [], 
      triggers: [] as string[],  // Required by backend
      active: false,  // Use boolean instead of status string (backend uses active boolean)
      lastModified: new Date().toISOString() 
    } as ChatFlow;
    const saved = await whatsappService.saveChatFlow(botToSave);
    setBots(prev => [...prev, saved]);
    setIsBotModalOpen(false);
  };

  if (!activeBot) return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t.automation.chatbot.title}</h1>
        <button onClick={handleCreateBot} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"><Plus className="mr-2"/> {t.automation.chatbot.newChatbot}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bots.map(bot => (
          <div key={bot.id} className="bg-white p-5 rounded-xl border cursor-pointer hover:shadow-md" onClick={() => { setActiveBot(bot); setHistory([bot]); setHistoryIndex(0); }}>
            <h3 className="font-bold">{bot.name}</h3>
            <div className="text-sm text-gray-500">{bot.language} • {bot.nodes.length} nodes</div>
          </div>
        ))}
      </div>
      {isBotModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="font-bold mb-4">{t.automation.chatbot.newBot}</h3>
            <input className="w-full border p-2 rounded mb-4" placeholder={t.automation.chatbot.botName} value={editingBotMeta.name} onChange={e => setEditingBotMeta({...editingBotMeta, name: e.target.value})} />
            <div className="flex justify-end gap-2"><button onClick={() => setIsBotModalOpen(false)}>{t.common.cancel}</button><button onClick={handleSaveBotMeta} className="bg-green-600 text-white px-4 py-2 rounded">{t.common.create}</button></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-50 relative overflow-hidden">
      <div className="h-14 bg-white border-b flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveBot(null)}><ArrowLeft/></button>
          <span className="font-bold">{activeBot.name}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTool('pointer')} className={`p-1 rounded ${tool === 'pointer' ? 'bg-blue-100' : ''}`}><MousePointer/></button>
          <button onClick={() => setTool('hand')} className={`p-1 rounded ${tool === 'hand' ? 'bg-blue-100' : ''}`}><Hand/></button>
          <button onClick={handleUndo}><Undo/></button>
          <button onClick={handleRedo}><Redo/></button>
          <button onClick={async () => { 
            // Send with active boolean and triggers array (backend model)
            const botToSave = { ...activeBot, active: true, triggers: activeBot.triggers || [] };
            await whatsappService.saveChatFlow(botToSave); 
            alert(t.automation.chatbot.save); 
          }} className="bg-blue-600 text-white px-3 py-1 rounded">{t.automation.chatbot.save}</button>
        </div>
      </div>
      <div className="flex-1 flex relative">
        <div className="w-16 lg:w-64 bg-white border-r z-20 flex flex-col">
           {(['message', 'question', 'list', 'media', 'action'] as const).map(type => (
             <button key={type} onClick={() => addNode(type as FlowNodeType)} className="p-3 border-b hover:bg-gray-50 flex items-center gap-2">
               {type === 'message' && <MessageSquare size={16}/>}{t.automation.chatbot.nodes[type]}
             </button>
           ))}
        </div>
        <div ref={canvasRef} className="flex-1 relative overflow-hidden bg-slate-50" onWheel={handleWheel} onMouseDown={handleCanvasMouseDown}>
           <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', width: '100%', height: '100%' }} className="absolute inset-0">
              <svg className="absolute inset-0 overflow-visible pointer-events-none" style={{ width: '100%', height: '100%' }}>
                {activeBot.edges.map(edge => {
                  const sourcePos = getHandlePosition(edge.source, edge.sourceHandle);
                  const targetPos = getTargetPosition(edge.target);
                  return <path key={edge.id} d={renderPath(sourcePos, targetPos)} stroke="#cbd5e1" strokeWidth="3" fill="none" />;
                })}
                {connectingSource && <path d={renderPath(getHandlePosition(connectingSource.nodeId, connectingSource.handleId), mousePosCanvas)} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" fill="none" />}
              </svg>
              {activeBot.nodes.map(node => (
                <div key={node.id} style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)`, width: NODE_WIDTH }} className={`absolute rounded-lg border-2 z-10 bg-white ${selectedNodeId === node.id ? 'border-blue-500' : 'border-gray-200'} ${getNodeColor(node.type)}`} onMouseDown={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }} onMouseUp={(e) => handleMouseUpNode(e, node.id)}>
                  <div className="p-2 border-b bg-white/50 cursor-move flex justify-between" onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setDraggingNodeId(node.id); dragStartRef.current = { x: e.clientX, y: e.clientY }; }}>
                    <span className="text-xs font-bold uppercase">{node.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}><X size={14}/></button>
                  </div>
                  <div className="p-3 bg-white min-h-[60px] text-sm">{node.data.content || t.automation.chatbot.empty}</div>
                  <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-crosshair" onMouseDown={(e) => handleMouseDownHandle(e, node.id)}/>
                  <div className="absolute top-3 -left-1.5 w-3 h-3 bg-gray-300 rounded-full"/>
                </div>
              ))}
           </div>
        </div>
        {selectedNodeId && (
          <div className="w-80 bg-white border-l z-20 p-4">
            <h3 className="font-bold mb-4">{t.automation.chatbot.properties}</h3>
            {(() => {
              const node = activeBot.nodes.find(n => n.id === selectedNodeId);
              if(!node) return null;
              return (
                <div className="space-y-4">
                  <input value={node.label} onChange={(e) => updateNodeData(node.id, { label: e.target.value })} className="w-full border p-2 rounded" placeholder={t.automation.chatbot.label} />
                  <textarea value={node.data.content} onChange={(e) => updateNodeData(node.id, { content: e.target.value })} className="w-full border p-2 rounded" rows={4} placeholder={t.automation.chatbot.textMessage} />
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotBuilderPage;
