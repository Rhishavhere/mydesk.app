import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Monitor, 
  Maximize, 
  Minimize,
  Settings,
  Wifi,
  WifiOff,
  MousePointer,
  MousePointerClick,
  Info,
  CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL 
  || (window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : `http://${window.location.hostname}:5000`);
const CONTROL_TOKEN = import.meta.env.VITE_CONTROL_TOKEN || "314159";

// Throttle interval for mouse move API calls (ms)
const MOVE_THROTTLE_MS = 50; // 20 updates/sec max

interface StreamInfo {
  screen_width: number;
  screen_height: number;
  default_fps: number;
  default_quality: number;
  default_scale: number;
}

type TouchAction = 'move' | 'tap' | 'doubletap' | 'rightclick';

const LiveControl = () => {
  const navigate = useNavigate();
  const scratchpadRef = useRef<HTMLDivElement>(null);
  const lastMoveTimeRef = useRef<number>(0);
  const accumulatedDeltaRef = useRef<{dx: number, dy: number}>({ dx: 0, dy: 0 });
  const lastTouchRef = useRef<{x: number, y: number} | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 });
  const [lastAction, setLastAction] = useState<string>("");
  
  // Stream settings
  const [fps, setFps] = useState(15);
  const [quality, setQuality] = useState(30);
  const [scale, setScale] = useState(0.4);
  const [cursorStyle, setCursorStyle] = useState<'crosshair' | 'simple' | 'none'>('simple');

  // Fetch stream info on mount
  useEffect(() => {
    const fetchStreamInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/desktop/livestream/info`);
        if (response.ok) {
          const data = await response.json();
          setStreamInfo(data);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to connect to desktop:", error);
        setIsConnected(false);
      }
    };
    
    fetchStreamInfo();
    const interval = setInterval(fetchStreamInfo, 10000);
    return () => {
      clearInterval(interval);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, []);

  // Send input to API (fire and forget, no await blocking UI)
  const sendInputAsync = useCallback((action: TouchAction, x?: number, y?: number, dx?: number, dy?: number) => {
    fetch(`${API_BASE_URL}/desktop/mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTROL_TOKEN}`
      },
      body: JSON.stringify({ action, x, y, dx, dy, normalized: true })
    }).catch(err => console.error("Failed to send input:", err));
  }, []);

  const flushMove = useCallback(() => {
    const { dx, dy } = accumulatedDeltaRef.current;
    if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
      sendInputAsync('move', undefined, undefined, dx, dy);
      accumulatedDeltaRef.current = { dx: 0, dy: 0 };
      lastMoveTimeRef.current = Date.now();
    }
    moveTimeoutRef.current = null;
  }, [sendInputAsync]);

  // Throttled move - accumulates deltas
  const sendMove = useCallback((dx: number, dy: number) => {
    // Accumulate
    accumulatedDeltaRef.current.dx += dx;
    accumulatedDeltaRef.current.dy += dy;

    const now = Date.now();
    const timeSinceLastMove = now - lastMoveTimeRef.current;

    if (!moveTimeoutRef.current) {
      if (timeSinceLastMove >= MOVE_THROTTLE_MS) {
        // Send immediately
        flushMove();
      } else {
        // Schedule
        moveTimeoutRef.current = setTimeout(flushMove, MOVE_THROTTLE_MS - timeSinceLastMove);
      }
    }
  }, [flushMove]);

  // Get normalized position from touch/mouse event
  const getPosition = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!scratchpadRef.current) return { x: 0.5, y: 0.5 };
    
    const rect = scratchpadRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return { x: 0.5, y: 0.5 };
    }
    
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    return { x, y };
  }, []);

  // Touch/Mouse event handlers - relative movement
  const handleMoveStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const pos = getPosition(e);
    setCursorPosition(pos); // Visual feedback only
    lastTouchRef.current = pos;
  }, [getPosition]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const pos = getPosition(e); // Normalized 0-1
    setCursorPosition(pos); // Visual feedback
    
    if (lastTouchRef.current) {
      const dx = pos.x - lastTouchRef.current.x;
      const dy = pos.y - lastTouchRef.current.y;
      
      // Only send if moved significantly (optional threshold, but floating point diff is fine)
      if (dx !== 0 || dy !== 0) {
        sendMove(dx, dy);
        setLastAction('move');
      }
    }
    lastTouchRef.current = pos;
  }, [getPosition, sendMove]);

  const handleMoveEnd = useCallback(() => {
    lastTouchRef.current = null;
    // Ensure any remaining deltas are sent
    if (moveTimeoutRef.current) {
        // We let the timeout finish naturally to preserve throttle rhythm,
        // or we could flush immediately.
        // Let's flush immediately for responsiveness on lift.
        clearTimeout(moveTimeoutRef.current);
        flushMove();
    } else {
        flushMove();
    }
  }, [flushMove]);

  // Click handlers - use current cursor position (undefined x,y)
  const handleLeftClick = useCallback(() => {
    sendInputAsync('tap');
    setLastAction('tap');
  }, [sendInputAsync]);

  const handleDoubleClick = useCallback(() => {
    sendInputAsync('doubletap');
    setLastAction('doubletap');
  }, [sendInputAsync]);

  const handleRightClick = useCallback(() => {
    sendInputAsync('rightclick');
    setLastAction('rightclick');
  }, [sendInputAsync]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const streamUrl = `${API_BASE_URL}/desktop/livestream?fps=${fps}&quality=${quality}&scale=${scale}&cursor=${cursorStyle}`;

  return (
    <div className={`mobile-full-height bg-gradient-background relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Background mesh overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-mesh" />
      
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 safe-area-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl h-10 w-10"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-medium text-foreground">Live Control</h1>
                  <p className="text-[10px] opacity-50">Remote Desktop</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection status */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/30">
                {isConnected ? (
                  <>
                    <div className="h-2 w-2 rounded-full status-online" />
                    <Wifi className="h-3 w-3 text-success" />
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <WifiOff className="h-3 w-3 text-destructive" />
                  </>
                )}
              </div>
              
              {/* Settings */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="glass-card border-l border-white/10">
                  <SheetHeader>
                    <SheetTitle>Stream Settings</SheetTitle>
                    <SheetDescription>
                      Adjust video quality and performance
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">FPS</span>
                        <span className="text-sm font-mono opacity-70">{fps}</span>
                      </div>
                      <Slider
                        value={[fps]}
                        onValueChange={(v) => setFps(v[0])}
                        min={5}
                        max={30}
                        step={5}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Quality</span>
                        <span className="text-sm font-mono opacity-70">{quality}%</span>
                      </div>
                      <Slider
                        value={[quality]}
                        onValueChange={(v) => setQuality(v[0])}
                        min={30}
                        max={100}
                        step={10}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Scale</span>
                        <span className="text-sm font-mono opacity-70">{Math.round(scale * 100)}%</span>
                      </div>
                      <Slider
                        value={[scale * 100]}
                        onValueChange={(v) => setScale(v[0] / 100)}
                        min={20}
                        max={100}
                        step={10}
                      />
                    </div>
                    
                    {/* Cursor Style */}
                    <div className="space-y-3">
                      <span className="text-sm">Cursor Style</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setCursorStyle('crosshair')}
                          className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                            cursorStyle === 'crosshair' 
                              ? 'border-primary bg-primary/20' 
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-red-500 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-1 h-1 rounded-full bg-red-500" />
                            </div>
                          </div>
                          <span>Crosshair</span>
                        </button>
                        <button
                          onClick={() => setCursorStyle('simple')}
                          className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                            cursorStyle === 'simple' 
                              ? 'border-primary bg-primary/20' 
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white border border-black" />
                          <span>Simple</span>
                        </button>
                        <button
                          onClick={() => setCursorStyle('none')}
                          className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                            cursorStyle === 'none' 
                              ? 'border-primary bg-primary/20' 
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full border border-dashed border-white/30" />
                          <span>None</span>
                        </button>
                      </div>
                    </div>
                    
                    {streamInfo && (
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <p className="text-xs opacity-50 flex items-center gap-1">
                          <Info className="h-3 w-3" /> Screen Info
                        </p>
                        <p className="text-sm font-mono">
                          {streamInfo.screen_width} × {streamInfo.screen_height}
                        </p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Fullscreen toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl h-10 w-10"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Video Stream */}
        <div className={`relative bg-black/50 ${isFullscreen ? 'flex-1' : 'aspect-video'}`}>
          {isConnected ? (
            <img 
              src={streamUrl}
              alt="Desktop Stream"
              className="w-full h-full object-contain"
              onError={() => setIsConnected(false)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Monitor className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm opacity-50">Connecting to desktop...</p>
                <p className="text-xs opacity-30">Make sure the server is running</p>
              </div>
            </div>
          )}
          
        </div>

        {/* Stream overlay info */}
        <div className="flex items-center justify-center gap-2 w-full mt-2">
          <div className="px-2 py-1 rounded-md bg-black/60 text-[10px] font-mono">
           FPS: {fps} • Quality: {quality}% • Scale: {Math.round(scale * 100)}%
          </div>
        </div>

        {/* Scratchpad / Touchpad - MOVEMENT ONLY, SMOOTH UI */}
        <div className="flex-1 p-2 px-4 pb-2">
          <div 
            ref={scratchpadRef}
            className="w-full h-full min-h-[160px] rounded-2xl glass-card relative overflow-hidden cursor-crosshair touch-none select-none"
            onTouchStart={handleMoveStart}
            onTouchMove={handleMove}
            onTouchEnd={handleMoveEnd}
            onMouseDown={handleMoveStart}
            onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
            onMouseUp={handleMoveEnd}
            onMouseLeave={handleMoveEnd}
          >
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/40" />
              </div>
            </div>
            
            {/* Cursor indicator - NO TRANSITION for instant feedback */}
            <div 
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${cursorPosition.x * 100}%`,
                top: `${cursorPosition.y * 100}%`
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-primary bg-primary/30" />
            </div>
            
            {/* Action indicator */}
            {lastAction && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 flex items-center gap-2">
                {lastAction === 'move' && <MousePointer className="h-3 w-3" />}
                {lastAction === 'tap' && <MousePointerClick className="h-3 w-3" />}
                {lastAction === 'doubletap' && <MousePointerClick className="h-3 w-3" />}
                {lastAction === 'rightclick' && <CircleDot className="h-3 w-3" />}
                <span className="text-[10px] font-mono uppercase">{lastAction}</span>
              </div>
            )}
            
            {/* Instructions */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-[10px] opacity-50">
              Drag to move cursor
            </div>
          </div>
        </div>

        {/* Click Buttons */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Left Click */}
            <button
              onClick={handleLeftClick}
              className="h-14 rounded-xl glass-card flex flex-col items-center justify-center gap-1 touch-interactive active:scale-95 active:bg-primary/20 transition-all"
            >
              <MousePointerClick className="h-5 w-5 text-primary" />
              <span className="text-[10px] opacity-70">Left Click</span>
            </button>
            
            {/* Double Click */}
            <button
              onClick={handleDoubleClick}
              className="h-14 rounded-xl glass-card flex flex-col items-center justify-center gap-1 touch-interactive active:scale-95 active:bg-secondary/20 transition-all"
            >
              <div className="flex -space-x-1">
                <MousePointerClick className="h-4 w-4 text-secondary" />
                <MousePointerClick className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-[10px] opacity-70">Double Click</span>
            </button>
            
            {/* Right Click */}
            <button
              onClick={handleRightClick}
              className="h-14 rounded-xl glass-card flex flex-col items-center justify-center gap-1 touch-interactive active:scale-95 active:bg-accent/20 transition-all"
            >
              <CircleDot className="h-5 w-5 text-accent" />
              <span className="text-[10px] opacity-70">Right Click</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom safe area */}
      <div className="safe-area-bottom h-2" />
    </div>
  );
};

export default LiveControl;
