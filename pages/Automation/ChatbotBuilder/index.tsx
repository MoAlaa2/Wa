
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  Bot, MessageSquare, HelpCircle, Zap, Plus, X, ArrowLeft, Settings, 
  Trash2, Save, Play, Image as ImageIcon, FileText, 
  ZoomIn, ZoomOut, Maximize, MousePointer, Hand, Undo, Redo, 
  MoreVertical, Link, Video, Music, List, Grid, Layers, CornerDownRight, Clock, UserCheck, Tag, Layout
} from 'lucide-react';
import { FlowNode, ChatFlow, FlowEdge, FlowNodeOption, FlowNodeType, BotTrigger } from '../../../types';
import { whatsappService } from '../../../services/whatsappService';

const GRID_SIZE = 20;
const NODE_WIDTH = 280;

// --- Helper Components ---

const MiniMap = ({ nodes, viewport }: { nodes: FlowNode[], viewport: { x: number, y: number, scale: number } }) => {
  return (
    <div className="absolute bottom-4 right-4 w-48 h-32 bg-white/90 border border-gray-200 shadow-md rounded-lg overflow-hidden z-20 pointer-events-none hidden sm:block">
      <div className="relative w-full h-full bg-slate-50">
        {nodes.map(n => (
          <div 
            key={n.id} 
            className="absolute bg-blue-400 rounded-sm"
            style={{ 
              left: (n.position.x / 5000) * 100 + '%', 
              top: (n.position.y / 5000) * 100 + '%',
              width: '4px', height: '3px'
            }}
          />
        ))}
        {/* Viewport Rect */}
        <div 
          className="absolute border-2 border-red-500/50 bg-red-100/10"
          style={{
            left: (-viewport.x / 5000) * 100 + '%',
            top: (-viewport.y / 5000) * 100 + '%',
            width: (100 / viewport.scale) + '%', 
            height: (100 / viewport.scale) + '%' 
          }}
        />
      </div>
    </div>
  );
};

const ChatbotBuilderPage = () => {
  const { t, dir } = useLanguage();
  const [bots, setBots] = useState<ChatFlow[]>([]);
  const [activeBot, setActiveBot] = useState<ChatFlow | null>(null);
  
  // Bot Manager State
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [editingBotMeta, setEditingBotMeta] = useState<Partial<ChatFlow>>({});

  // Canvas State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [tool, setTool] = useState<'pointer' | 'hand'>('pointer');

  // Node Editing State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectingSource, setConnectingSource] = useState<{ nodeId: string, handleId?: string } | null>(null);
  const [mousePosCanvas, setMousePosCanvas] = useState({ x: 0, y: 0 });
  
  // History for Undo/Redo
  const [history, setHistory] = useState<ChatFlow[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs for Drag Logic (to avoid closure staleness in event listeners)
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 }); 
  const transformRef = useRef(transform);
  const activeBotRef = useRef(activeBot);

  // Sync refs
  useEffect(() => { transformRef.current = transform; }, [transform]);
  useEffect(() => { activeBotRef.current = activeBot; }, [activeBot]);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    const data = await whatsappService.getChatFlows();
    setBots(data);
  };

  // --- GLOBAL DRAG HANDLERS ---
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      // 1. Canvas Pan
      if (isDraggingCanvas) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // 2. Node Drag
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

      // 3. Connection Line Update
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        const canvasX = (rawX - transformRef.current.x) / transformRef.current.scale;
        const canvasY = (rawY - transformRef.current.y) / transformRef.current.scale;
        setMousePosCanvas({ x: canvasX, y: canvasY });
      }
    };

    const handleWindowMouseUp = () => {
      // End Pan
      if (isDraggingCanvas) setIsDraggingCanvas(false);
      
      // End Node Drag
      if (draggingNodeId) {
        // Snap to grid logic can be applied here
        if (activeBotRef.current) {
           const bot = activeBotRef.current;
           const snappedNodes = bot.nodes.map(n => {
             if (n.id === draggingNodeId) {
               return { 
                 ...n, 
                 position: { 
                   x: Math.round(n.position.x / GRID_SIZE) * GRID_SIZE, 
                   y: Math.round(n.position.y / GRID_SIZE) * GRID_SIZE 
                 } 
               };
             }
             return n;
           });
           setActiveBot({ ...bot, nodes: snappedNodes });
           pushHistory({ ...bot, nodes: snappedNodes });
        }
        setDraggingNodeId(null);
      }

      // End Connection (Cancel if dropped in empty space)
      if (connectingSource) {
        setConnectingSource(null);
      }
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

  // --- HISTORY MANAGEMENT ---
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

  // --- EVENT HANDLERS ---

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom with Ctrl/Meta + Scroll
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
      // Pan with Scroll
      if (e.shiftKey) {
        setTransform(prev => ({ ...prev, x: prev.x - e.deltaY }));
      } else {
        setTransform(prev => ({ ...prev, y: prev.y - e.deltaY }));
      }
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

  // --- NODE & EDGE LOGIC ---

  const addNode = (type: FlowNodeType) => {
    if (!activeBot) return;
    const id = `node_${Date.now()}`;
    const viewCenterX = (-transform.x + (canvasRef.current?.clientWidth || 800) / 2) / transform.scale;
    const viewCenterY = (-transform.y + (canvasRef.current?.clientHeight || 600) / 2) / transform.scale;

    const newNode: FlowNode = {
      id,
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      data: {
        content: '',
        options: type === 'question' ? [{ id: `opt_${Date.now()}_1`, label: 'Option 1' }] : undefined,
        actionType: type === 'action' ? 'assign_agent' : undefined
      },
      position: { x: viewCenterX - NODE_WIDTH/2, y: viewCenterY }
    };
    
    const newBotState = { ...activeBot, nodes: [...activeBot.nodes, newNode] };
    setActiveBot(newBotState);
    pushHistory(newBotState);
    setSelectedNodeId(id);
  };

  const updateNodeData = (id: string, data: any) => {
    if (!activeBot) return;
    setActiveBot({
      ...activeBot,
      nodes: activeBot.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
    });
  };

  const deleteNode = (id: string) => {
    if (!activeBot) return;
    const newState = {
      ...activeBot,
      nodes: activeBot.nodes.filter(n => n.id !== id),
      edges: activeBot.edges.filter(e => e.source !== id && e.target !== id)
    };
    setActiveBot(newState);
    pushHistory(newState);
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleMouseDownHandle = (e: React.MouseEvent, nodeId: string, handleId?: string) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    if (tool !== 'pointer') return;
    setConnectingSource({ nodeId, handleId });
  };

  const handleMouseUpNode = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (connectingSource && connectingSource.nodeId !== targetNodeId && activeBot) {
      const newEdge: FlowEdge = {
        id: `e_${Date.now()}`,
        source: connectingSource.nodeId,
        sourceHandle: connectingSource.handleId,
        target: targetNodeId
      };
      
      const filteredEdges = activeBot.edges.filter(e => 
        !(e.source === connectingSource.nodeId && e.sourceHandle === connectingSource.handleId)
      );

      const newState = { ...activeBot, edges: [...filteredEdges, newEdge] };
      setActiveBot(newState);
      pushHistory(newState);
    }
    setConnectingSource(null);
  };

  const deleteEdge = (edgeId: string) => {
    if (!activeBot) return;
    const newState = { ...activeBot, edges: activeBot.edges.filter(e => e.id !== edgeId) };
    setActiveBot(newState);
    pushHistory(newState);
  };

  // --- RENDERING ---

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

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} className="text-blue-600" />;
      case 'question': return <HelpCircle size={16} className="text-purple-600" />;
      case 'action': return <Zap size={16} className="text-orange-600" />;
      case 'media': return <ImageIcon size={16} className="text-pink-600" />;
      case 'list': return <List size={16} className="text-indigo-600" />;
      default: return <Bot size={16} />;
    }
  };

  // --- BOT MANAGEMENT ---
  const handleSaveBotMeta = async () => {
    if (!editingBotMeta.name) return;
    const botToSave = {
      ...editingBotMeta,
      id: editingBotMeta.id || `flow_${Date.now()}`,
      nodes: editingBotMeta.nodes || [],
      edges: editingBotMeta.edges || [],
      lastModified: new Date().toISOString(),
      status: editingBotMeta.status || 'draft'
    } as ChatFlow;

    const saved = await whatsappService.saveChatFlow(botToSave);
    if (editingBotMeta.id) {
      setBots(prev => prev.map(b => b.id === saved.id ? saved : b));
    } else {
      setBots(prev => [...prev, saved]);
    }
    setIsBotModalOpen(false);
  };

  const openBuilder = (bot: ChatFlow) => {
    setActiveBot(JSON.parse(JSON.stringify(bot)));
    setHistory([JSON.parse(JSON.stringify(bot))]);
    setHistoryIndex(0);
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const saveBuilder = async () => {
    if (!activeBot) return;
    await whatsappService.saveChatFlow(activeBot);
    setBots(prev => prev.map(b => b.id === activeBot.id ? activeBot : b));
    alert("Bot saved successfully!");
  };

  const handleCreateBot = () => {
    setEditingBotMeta({ name: 'New Bot', language: 'en', priority: 0, triggers: [], status: 'draft' });
    setIsBotModalOpen(true);
  };

  const handleDeleteBot = async (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      await whatsappService.deleteChatFlow(id);
      setBots(prev => prev.filter(b => b.id !== id));
      if (activeBot?.id === id) setActiveBot(null);
    }
  };

  // --- MAIN RENDER ---
  if (activeBot) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-50 relative overflow-hidden">
        
        {/* TOOLBAR */}
        <div className="h-14 bg-white border-b flex items-center justify-between px-4 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveBot(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <ArrowLeft size={20}/>
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {activeBot.name}
                <span className={`w-2 h-2 rounded-full ${activeBot.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
              </h1>
              <span className="text-xs text-gray-500">{activeBot.language?.toUpperCase()} • {activeBot.nodes.length} nodes</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
             <button onClick={() => setTool('pointer')} className={`p-1.5 rounded ${tool === 'pointer' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} title="Pointer"><MousePointer size={18} /></button>
             <button onClick={() => setTool('hand')} className={`p-1.5 rounded ${tool === 'hand' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} title="Pan"><Hand size={18} /></button>
             <div className="w-px h-4 bg-gray-300 mx-1" />
             <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1.5 rounded hover:bg-white disabled:opacity-50 text-gray-600"><Undo size={18} /></button>
             <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded hover:bg-white disabled:opacity-50 text-gray-600"><Redo size={18} /></button>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs font-mono">
               <button onClick={() => setTransform(p => ({ ...p, scale: p.scale - 0.1 }))}><ZoomOut size={14}/></button>
               <span className="w-8 text-center">{Math.round(transform.scale * 100)}%</span>
               <button onClick={() => setTransform(p => ({ ...p, scale: p.scale + 0.1 }))}><ZoomIn size={14}/></button>
               <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} title="Reset"><Maximize size={14}/></button>
             </div>
             <button onClick={saveBuilder} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
               <Save size={16} /> Save
             </button>
          </div>
        </div>

        <div className="flex-1 flex relative overflow-hidden">
          {/* SIDEBAR */}
          <div className="w-16 lg:w-64 bg-white border-r border-gray-200 flex flex-col z-20 shadow-lg">
            <div className="p-4 border-b border-gray-100 hidden lg:block">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.pages.chatbot.toolbox}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
               {['message', 'question', 'list', 'media', 'action'].map(type => (
                 <button key={type} onClick={() => addNode(type as FlowNodeType)} className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group">
                   <div className={`p-2 rounded bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600`}>
                     {getNodeIcon(type)}
                   </div>
                   <span className="text-sm font-medium text-gray-700 hidden lg:block capitalize">{type}</span>
                 </button>
               ))}
            </div>
          </div>

          {/* CANVAS */}
          <div 
            ref={canvasRef}
            className={`flex-1 relative overflow-hidden bg-slate-50 ${tool === 'hand' || isDraggingCanvas ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
          >
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 canvas-bg"
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: `${GRID_SIZE * transform.scale}px ${GRID_SIZE * transform.scale}px`,
                backgroundPosition: `${transform.x}px ${transform.y}px`
              }}
            />

            <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', width: '100%', height: '100%' }} className="absolute inset-0">
              <svg className="absolute inset-0 overflow-visible pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
                {activeBot.edges.map(edge => {
                  const sourcePos = getHandlePosition(edge.source, edge.sourceHandle);
                  const targetPos = getTargetPosition(edge.target);
                  return (
                    <g key={edge.id} className="pointer-events-auto group">
                      <path d={renderPath(sourcePos, targetPos)} stroke="#cbd5e1" strokeWidth="3" fill="none" className="group-hover:stroke-blue-300 transition-colors" />
                      <path d={renderPath(sourcePos, targetPos)} stroke="transparent" strokeWidth="15" fill="none" className="cursor-pointer" onDoubleClick={() => deleteEdge(edge.id)} />
                      <circle cx={targetPos.x} cy={targetPos.y} r="3" fill="#94a3b8" />
                    </g>
                  );
                })}
                {connectingSource && <path d={renderPath(getHandlePosition(connectingSource.nodeId, connectingSource.handleId), mousePosCanvas)} stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="5,5" />}
              </svg>

              {activeBot.nodes.map(node => (
                <div
                  key={node.id}
                  style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)`, width: NODE_WIDTH }}
                  className={`absolute rounded-lg shadow-sm border-2 z-10 flex flex-col bg-white ${selectedNodeId === node.id ? 'ring-2 ring-offset-2 ring-blue-400 border-blue-400' : 'border-gray-200'} ${getNodeColor(node.type)}`}
                  onMouseDown={(e) => { if (tool === 'pointer') { e.stopPropagation(); setSelectedNodeId(node.id); } }}
                  onMouseUp={(e) => handleMouseUpNode(e, node.id)}
                >
                  <div 
                    className="p-2 border-b border-gray-100 flex items-center justify-between bg-white/50 rounded-t-lg cursor-move"
                    onMouseDown={(e) => { if (tool === 'pointer') { e.stopPropagation(); setDraggingNodeId(node.id); dragStartRef.current = { x: e.clientX, y: e.clientY }; } }}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-gray-800 uppercase tracking-wide">
                      {getNodeIcon(node.type)} {node.label}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} className="text-gray-400 hover:text-red-500 rounded p-1 hover:bg-red-50"><X size={14} /></button>
                  </div>

                  <div className="p-3 bg-white min-h-[60px] text-sm text-gray-600 rounded-b-lg">
                    {/* Content Preview */}
                    {node.type === 'action' ? (
                      <div className="flex items-center gap-2 font-medium text-orange-700">
                        {node.data.actionType === 'delay' && <Clock size={14}/>}
                        {node.data.actionType === 'assign_agent' && <UserCheck size={14}/>}
                        {node.data.actionType === 'add_tag' && <Tag size={14}/>}
                        {node.data.actionType?.replace('_', ' ').toUpperCase()} 
                        {node.data.actionValue && <span className="text-gray-500 text-xs">({node.data.actionValue})</span>}
                      </div>
                    ) : (
                      <div className="line-clamp-2 mb-2">{node.data.content || <span className="italic text-gray-300">Empty...</span>}</div>
                    )}
                    
                    {node.type === 'question' && (
                      <div className="space-y-1">
                        {node.data.options?.map(opt => (
                          <div key={opt.id} className="relative flex items-center justify-between bg-purple-50 px-2 py-1 rounded text-xs text-purple-700 border border-purple-100">
                            <span>{opt.label}</span>
                            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full cursor-crosshair absolute -right-4 border border-white hover:scale-125" onMouseDown={(e) => handleMouseDownHandle(e, node.id, opt.id)} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="absolute top-3 -left-1.5 w-3 h-3 bg-gray-300 rounded-full border-2 border-white" />
                  {node.type !== 'question' && node.type !== 'action' && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-crosshair border-2 border-white hover:scale-125 transition-transform" onMouseDown={(e) => handleMouseDownHandle(e, node.id)} />}
                  {node.type === 'action' && node.data.actionType !== 'end_chat' && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full cursor-crosshair border-2 border-white hover:scale-125" onMouseDown={(e) => handleMouseDownHandle(e, node.id)} />}
                </div>
              ))}
            </div>
            <MiniMap nodes={activeBot.nodes} viewport={transform} />
          </div>

          {/* PROPERTIES PANEL */}
          {selectedNodeId && (
            <div className="w-80 bg-white border-l border-gray-200 z-20 shadow-xl flex flex-col animate-slideLeft">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 text-sm">Node Properties</h3>
                <button onClick={() => setSelectedNodeId(null)}><X size={18} className="text-gray-400"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {(() => {
                  const node = activeBot.nodes.find(n => n.id === selectedNodeId);
                  if (!node) return null;
                  
                  return (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label</label>
                        <input value={node.label} onChange={(e) => { const newNodes = activeBot.nodes.map(n => n.id === node.id ? { ...n, label: e.target.value } : n); setActiveBot({ ...activeBot, nodes: newNodes }); }} className="w-full border border-gray-300 rounded p-2 text-sm" />
                      </div>

                      {(['message', 'question', 'list', 'media'].includes(node.type)) && (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Text Message</label>
                          <textarea value={node.data.content} onChange={(e) => updateNodeData(node.id, { content: e.target.value })} rows={4} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="Enter text..." />
                        </div>
                      )}

                      {node.type === 'media' && (
                        <div className="bg-pink-50 p-3 rounded border border-pink-100">
                          <label className="block text-xs font-bold text-pink-700 uppercase mb-1">Media Config</label>
                          <select value={node.data.mediaType || 'image'} onChange={(e) => updateNodeData(node.id, { mediaType: e.target.value })} className="w-full border border-pink-200 rounded p-2 text-sm mb-2">
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                          </select>
                          <input value={node.data.mediaUrl || ''} onChange={(e) => updateNodeData(node.id, { mediaUrl: e.target.value })} className="w-full border border-pink-200 rounded p-2 text-sm" placeholder="Media URL (https://...)" />
                        </div>
                      )}

                      {node.type === 'question' && (
                        <div>
                          <label className="block text-xs font-bold text-purple-700 uppercase mb-2">Buttons</label>
                          <div className="space-y-2">
                            {node.data.options?.map((opt, idx) => (
                              <div key={opt.id} className="flex gap-2">
                                <input value={opt.label} onChange={(e) => { const newOpts = [...(node.data.options || [])]; newOpts[idx].label = e.target.value; updateNodeData(node.id, { options: newOpts }); }} className="flex-1 border border-gray-300 rounded p-1.5 text-sm" />
                                <button onClick={() => { const newOpts = node.data.options?.filter(o => o.id !== opt.id); updateNodeData(node.id, { options: newOpts }); setActiveBot(prev => prev ? ({ ...prev, edges: prev.edges.filter(e => e.sourceHandle !== opt.id) }) : null); }} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                              </div>
                            ))}
                            {(!node.data.options || node.data.options.length < 3) && (
                              <button onClick={() => { const newOpt: FlowNodeOption = { id: `opt_${Date.now()}`, label: 'New Option' }; updateNodeData(node.id, { options: [...(node.data.options || []), newOpt] }); }} className="text-xs text-blue-600 font-medium flex items-center mt-2"><Plus size={12} className="mr-1"/> Add Button</button>
                            )}
                          </div>
                        </div>
                      )}

                      {node.type === 'action' && (
                        <div className="bg-orange-50 p-3 rounded border border-orange-100">
                          <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Action Type</label>
                          <select value={node.data.actionType || 'assign_agent'} onChange={(e) => updateNodeData(node.id, { actionType: e.target.value })} className="w-full border border-orange-200 rounded p-2 text-sm mb-3">
                            <option value="assign_agent">Assign Agent</option>
                            <option value="add_tag">Add Tag</option>
                            <option value="delay">Wait Delay</option>
                            <option value="end_chat">End Chat</option>
                          </select>
                          
                          {node.data.actionType === 'assign_agent' && (
                            <input placeholder="Agent ID or Name" value={node.data.actionValue || ''} onChange={(e) => updateNodeData(node.id, { actionValue: e.target.value })} className="w-full border border-orange-200 rounded p-2 text-sm" />
                          )}
                          {node.data.actionType === 'add_tag' && (
                            <input placeholder="Tag Name" value={node.data.actionValue || ''} onChange={(e) => updateNodeData(node.id, { actionValue: e.target.value })} className="w-full border border-orange-200 rounded p-2 text-sm" />
                          )}
                          {node.data.actionType === 'delay' && (
                            <div className="flex items-center gap-2">
                              <input type="number" placeholder="Milliseconds" value={node.data.actionValue || ''} onChange={(e) => updateNodeData(node.id, { actionValue: e.target.value })} className="w-full border border-orange-200 rounded p-2 text-sm" />
                              <span className="text-xs text-orange-700">ms</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- BOT LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.pages.chatbot.title}</h1>
          <p className="text-gray-500 mt-1">Advanced multi-bot flow builder.</p>
        </div>
        <button onClick={handleCreateBot} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
          <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" /> New Chatbot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map(bot => (
          <div key={bot.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openBuilder(bot)}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bot.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{bot.name}</h3>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span className="uppercase bg-gray-100 px-1 rounded">{bot.language}</span>
                    <span>{bot.nodes.length} nodes</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                 <button onClick={(e) => { e.stopPropagation(); setEditingBotMeta(bot); setIsBotModalOpen(true); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><Settings size={16}/></button>
                 <button onClick={(e) => { e.stopPropagation(); handleDeleteBot(bot.id); }} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {bot.triggers?.map(trig => (
                <span key={trig} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{trig.replace('_', ' ')}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{bot.description || 'No description'}</p>
          </div>
        ))}
      </div>

      {isBotModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingBotMeta.id ? 'Edit Bot Settings' : 'Create New Bot'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
                <input type="text" value={editingBotMeta.name || ''} onChange={e => setEditingBotMeta({...editingBotMeta, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select value={editingBotMeta.language || 'en'} onChange={e => setEditingBotMeta({...editingBotMeta, language: e.target.value as any})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white">
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="mixed">Mixed</option>
                    <option value="auto">Auto-Detect</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input type="number" value={editingBotMeta.priority || 0} onChange={e => setEditingBotMeta({...editingBotMeta, priority: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Triggers</label>
                <div className="flex flex-wrap gap-2">
                  {['first_message', 'new_session', 'keyword', 'manual'].map(t => (
                    <label key={t} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={editingBotMeta.triggers?.includes(t as BotTrigger)} onChange={e => { const current = editingBotMeta.triggers || []; if (e.target.checked) setEditingBotMeta({...editingBotMeta, triggers: [...current, t as BotTrigger]}); else setEditingBotMeta({...editingBotMeta, triggers: current.filter(x => x !== t)}); }} />
                      <span className="text-sm capitalize">{t.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsBotModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSaveBotMeta} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{editingBotMeta.id ? 'Save' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotBuilderPage;
