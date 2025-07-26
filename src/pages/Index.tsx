import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceSelector } from "@/components/DeviceSelector";
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
  Zap
} from "lucide-react";

const Index = () => {
  const [selectedDevice, setSelectedDevice] = useState('desktop');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">RhishDesk</h1>
                <p className="text-sm text-muted-foreground">Personal Cloud Workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Device Selector */}
          <DeviceSelector 
            selectedDevice={selectedDevice} 
            onDeviceChange={setSelectedDevice} 
          />

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:inline-flex">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="control" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Control</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">AI Chat</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="overview" className="space-y-6">
              <SystemOverview device={selectedDevice} />
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <SystemDetails device={selectedDevice} />
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <PerformanceMetrics device={selectedDevice} />
            </TabsContent>

            <TabsContent value="control" className="space-y-6">
              <SystemControl device={selectedDevice} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <AIChat device={selectedDevice} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 RhishDesk</span>
              <span>•</span>
              <span>Personal Cloud Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span>API: myspace.rhishav.com</span>
              <span>•</span>
              <span>Powered by Lovable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
