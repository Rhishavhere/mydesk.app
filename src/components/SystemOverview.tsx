import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network, 
  Battery,
  Thermometer,
  Clock,
  Monitor
} from "lucide-react";

interface SystemOverviewProps {
  device: string;
}

interface SystemData {
  cpu: {
    usage_percent: number;
    total_cores: number;
    frequency: {
      current: number;
    };
  };
  memory: {
    virtual: {
      usage_percent: number;
      used_gb: number;
      total_gb: number;
    };
  };
  uptime: {
    formatted: string;
  };
  battery?: {
    percent: number;
    power_plugged: boolean;
  };
}

export const SystemOverview = ({ device }: SystemOverviewProps) => {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const response = await fetch(`https://myspace.rhishav.com/${device}/system/overview`);
        if (response.ok) {
          const data = await response.json();
          setSystemData(data);
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        setIsOnline(false);
        console.error('Error fetching system data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();
    const interval = setInterval(fetchSystemData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [device]);

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (!isOnline) return 'status-error';
    if (systemData?.cpu.usage_percent > 80 || systemData?.memory.virtual.usage_percent > 85) {
      return 'status-warning';
    }
    return 'status-online';
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="glass-card p-6 hover-lift">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">
              {device === 'desktop' ? 'Win11-Desktop' : 'Fedora-Laptop'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${getStatusColor()} pulse-primary`} />
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* System Metrics */}
      {systemData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU Usage */}
          <Card className="glass-card p-6 hover-lift">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">CPU Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{systemData.cpu.usage_percent}%</span>
                  <span className="text-sm text-muted-foreground">
                    {systemData.cpu.total_cores} cores
                  </span>
                </div>
                <Progress 
                  value={systemData.cpu.usage_percent} 
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground">
                  {systemData.cpu.frequency?.current.toFixed(2)} GHz
                </span>
              </div>
            </div>
          </Card>

          {/* Memory Usage */}
          <Card className="glass-card p-6 hover-lift">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-muted-foreground">Memory</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{systemData.memory.virtual.usage_percent}%</span>
                  <span className="text-sm text-muted-foreground">
                    {systemData.memory.virtual.used_gb}GB
                  </span>
                </div>
                <Progress 
                  value={systemData.memory.virtual.usage_percent} 
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground">
                  {systemData.memory.virtual.total_gb}GB total
                </span>
              </div>
            </div>
          </Card>

          {/* Uptime */}
          <Card className="glass-card p-6 hover-lift">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium text-muted-foreground">Uptime</span>
              </div>
              <div className="space-y-2">
                <span className="text-lg font-bold">{systemData.uptime.formatted}</span>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-success animate-pulse" />
                  <span className="text-xs text-muted-foreground">Running</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Battery (if available) */}
          {systemData.battery ? (
            <Card className="glass-card p-6 hover-lift">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Battery className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-muted-foreground">Battery</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{systemData.battery.percent}%</span>
                    <Badge variant={systemData.battery.power_plugged ? "default" : "outline"}>
                      {systemData.battery.power_plugged ? 'Charging' : 'Battery'}
                    </Badge>
                  </div>
                  <Progress 
                    value={systemData.battery.percent} 
                    className="h-2"
                  />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="glass-card p-6 hover-lift">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-medium text-muted-foreground">Desktop PC</span>
                </div>
                <div className="space-y-2">
                  <span className="text-lg font-bold">No Battery</span>
                  <div className="flex items-center gap-1">
                    <Network className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">AC Powered</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};