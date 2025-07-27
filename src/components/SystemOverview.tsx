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
    // Clear previous device data immediately when device changes
    setSystemData(null);
    setIsOnline(false);
    setLoading(true);

    const fetchSystemData = async () => {
      try {
        const response = await fetch(`https://myspace.rhishav.com/${device}/system/overview`);
        if (response.ok) {
          const data = await response.json();
          setSystemData(data);
          setIsOnline(true);
        } else {
          setSystemData(null);
          setIsOnline(false);
        }
      } catch (error) {
        setSystemData(null);
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
      <Card className="glass-card p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
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
    <div className="space-y-4">
      {/* Status Header */}
      <Card className="glass-card p-4 touch-interactive">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-primary" />
            <h2 className="text-fluid-xl font-semibold">
              {device === 'desktop' ? 'Desktop' : 'Laptop'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${getStatusColor()}`} />
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
        <p className="ml-8 text-xs font-mono">OS : {device === 'desktop' ? 'Windows-11' : 'Fedora Linux'}</p>
      </Card>

      {/* System Metrics */}
      {isOnline && systemData ? (
        <div className="grid grid-cols-2 gap-3">
          {/* CPU Usage */}
          <Card className="glass-card p-4 touch-interactive">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-fluid-sm font-medium text-muted-foreground">CPU</span>
              </div>
              <div className="space-y-2">
                <span className="text-fluid-xl font-bold">{systemData.cpu.usage_percent}%</span>
                <Progress 
                  value={systemData.cpu.usage_percent} 
                  className="h-2 progress-glow"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{systemData.cpu.total_cores} cores</span>
                  <span>{systemData.cpu.frequency?.current.toFixed(1)} GHz</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Memory Usage */}
          <Card className="glass-card p-4 touch-interactive">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-success" />
                <span className="text-fluid-sm font-medium text-muted-foreground">Memory</span>
              </div>
              <div className="space-y-2">
                <span className="text-fluid-xl font-bold">{systemData.memory.virtual.usage_percent}%</span>
                <Progress 
                  value={systemData.memory.virtual.usage_percent} 
                  className="h-2 progress-glow"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{systemData.memory.virtual.used_gb}GB</span>
                  <span>{systemData.memory.virtual.total_gb}GB total</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Uptime */}
          <Card className="glass-card p-4 touch-interactive">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-fluid-sm font-medium text-muted-foreground">Uptime</span>
              </div>
              <div className="space-y-2">
                <span className="text-fluid-lg font-bold">{systemData.uptime.formatted}</span>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-success animate-pulse" />
                  <span className="text-xs text-muted-foreground">Running</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Battery/Power */}
          {systemData.battery ? (
            <Card className="glass-card p-4 touch-interactive">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-accent" />
                  <span className="text-fluid-sm font-medium text-muted-foreground">Battery</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-fluid-xl font-bold">{systemData.battery.percent}%</span>
                    <Badge variant={systemData.battery.power_plugged ? "default" : "outline"} className="text-xs">
                      {systemData.battery.power_plugged ? 'Charging' : 'Battery'}
                    </Badge>
                  </div>
                  <Progress 
                    value={systemData.battery.percent} 
                    className="h-2 progress-glow"
                  />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="glass-card p-4 touch-interactive">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-destructive" />
                  <span className="text-fluid-sm font-medium text-muted-foreground">Power</span>
                </div>
                <div className="space-y-2">
                  <span className="text-fluid-lg font-bold">AC Power</span>
                  <div className="flex items-center gap-1">
                    <Network className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">No Battery</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : !loading && !isOnline && (
        <Card className="glass-card p-6">
          <div className="text-center py-4">
            <Monitor className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              {device === 'desktop' ? 'Desktop' : 'Laptop'} is offline
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};