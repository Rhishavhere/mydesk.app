import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceSelector } from "@/components/DeviceSelector";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/useTheme";
import { SystemOverview } from "@/components/SystemOverview";
import { SystemDetails } from "@/components/SystemDetails";
import { SystemControl } from "@/components/SystemControl";
import { AIChat } from "@/components/AIChat";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { 
  Monitor, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  Activity,
  Zap,
  Wifi,
  Tv2
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const { theme, setTheme } = useTheme();

  return (
    <div className="mobile-full-height bg-gradient-background relative">
      {/* Background mesh overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-mesh" />
      
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 safe-area-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center animate-float-mobile">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="mobile-subtitle opacity-50 font-sans italic text-xs">@mydesk</p>
                <h1 className="mobile-title text-foreground font-sans text-lg font-medium">oncloud.<span className="opacity-50">rhishav</span></h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/live-control')}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all touch-interactive"
                title="Live Control"
              >
                <Tv2 className="h-4 w-4 text-primary" />
              </button>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full status-online"></div>
                <Wifi className="h-4 w-4 text-success" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 relative z-10 space-y-6 pb-safe">
        {/* Theme Selector */}
        <div className="animate-slide-up">
          <ThemeSelector 
            selectedTheme={theme} 
            onThemeChange={setTheme} 
          />
        </div>
        {/* Device Selector */}
        <div className="animate-slide-up">
          <DeviceSelector 
            selectedDevice={selectedDevice} 
            onDeviceChange={setSelectedDevice} 
          />
        </div>


        {/* Mobile Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Floating tab navigation */}
          <div className="sticky top-20 z-40 -mx-4 px-4">
            <TabsList className="mobile-nav grid grid-cols-5 w-full h-16 p-1 rounded-2xl bg-black/50">
              <TabsTrigger 
                value="overview" 
                className="flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-xs touch-target"
              >
                <Monitor className="h-4 w-4" />
                <span className="text-[10px]">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-xs touch-target"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-[10px]">Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="metrics" 
                className="flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-xs touch-target"
              >
                <Activity className="h-4 w-4" />
                <span className="text-[10px]">Metrics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="control" 
                className="flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-xs touch-target"
              >
                <Settings className="h-4 w-4" />
                <span className="text-[10px]">Control</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-xs touch-target"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-[10px]">AI</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="space-y-6 min-h-0">
            <TabsContent value="overview" className="mt-0 animate-slide-up">
              <SystemOverview device={selectedDevice} />
            </TabsContent>

            <TabsContent value="details" className="mt-0 animate-slide-up">
              <SystemDetails device={selectedDevice} />
            </TabsContent>

            <TabsContent value="metrics" className="mt-0 animate-slide-up">
              <PerformanceMetrics device={selectedDevice} />
            </TabsContent>

            <TabsContent value="control" className="mt-0 animate-slide-up">
              <SystemControl device={selectedDevice} />
            </TabsContent>

            <TabsContent value="ai" className="mt-0 animate-slide-up">
              <AIChat device={selectedDevice} />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Bottom safe area */}
      <div className="safe-area-bottom h-4" />
    </div>
  );
};

export default Index;
