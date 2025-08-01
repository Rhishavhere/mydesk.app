import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Activity,
  Thermometer,
  Users,
  Settings,
  RefreshCw,
  Monitor
} from "lucide-react";

interface SystemDetailsProps {
  device: string;
}

interface ProcessInfo {
  pid: number;
  name: string;
  username: string;
  cpu_percent: number;
  memory_mb: number;
  memory_percent: number;
  status: string;
}

interface DiskInfo {
  device: string;
  mountpoint: string;
  filesystem_type: string;
  total_gb: number;
  used_gb: number;
  free_gb: number;
  usage_percent: number;
}

export const SystemDetails = ({ device }: SystemDetailsProps) => {
  const [cpuData, setCpuData] = useState<any>(null);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [diskData, setDiskData] = useState<any>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [processData, setProcessData] = useState<any>(null);
  const [temperatureData, setTemperatureData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const clearData = () => {
    setCpuData(null);
    setMemoryData(null);
    setDiskData(null);
    setNetworkData(null);
    setProcessData(null);
    setTemperatureData(null);
    setIsOnline(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cpu, memory, disk, network, temperature] = await Promise.all([
        fetch(`https://myspace.rhishav.com/${device}/system/cpu`).then(r => {
          if (!r.ok) throw new Error(`CPU fetch failed: ${r.status}`);
          return r.json();
        }),
        fetch(`https://myspace.rhishav.com/${device}/system/memory`).then(r => {
          if (!r.ok) throw new Error(`Memory fetch failed: ${r.status}`);
          return r.json();
        }),
        fetch(`https://myspace.rhishav.com/${device}/system/disk`).then(r => {
          if (!r.ok) throw new Error(`Disk fetch failed: ${r.status}`);
          return r.json();
        }),
        fetch(`https://myspace.rhishav.com/${device}/system/network`).then(r => {
          if (!r.ok) throw new Error(`Network fetch failed: ${r.status}`);
          return r.json();
        }),
        fetch(`https://myspace.rhishav.com/${device}/system/temperature`).then(r => r.ok ? r.json() : null)
      ]);

      setCpuData(cpu);
      setMemoryData(memory);
      setDiskData(disk);
      setNetworkData(network);
      setTemperatureData(temperature);
      setIsOnline(true);
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      clearData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearData(); // Clear previous device data immediately
    setLoading(true);
    fetchData();
  }, [device]);

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (!isOnline) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center py-8">
          <Monitor className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Device Offline</h3>
          <p className="text-sm text-muted-foreground">
            {device === 'desktop' ? 'Desktop' : 'Laptop'} is currently offline or unreachable.
          </p>
          <Button variant="outline" size="sm" onClick={fetchData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">System Details</h2>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="cpu" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-full">
          <TabsTrigger value="cpu" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            CPU
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2">
            <MemoryStick className="h-4 w-4" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="disk" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Processes
          </TabsTrigger>
          <TabsTrigger value="temperature" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Sensors
          </TabsTrigger>
        </TabsList>

        {/* CPU Tab */}
        <TabsContent value="cpu" className="space-y-4">
          {cpuData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
                  <h3 className="font-semibold mb-3">CPU Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Physical Cores:</span>
                      <span className="font-mono">{cpuData.physical_cores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cores:</span>
                      <span className="font-mono">{cpuData.total_cores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Freq:</span>
                      <span className="font-mono">{cpuData.frequency?.current?.toFixed(2)} GHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Freq:</span>
                      <span className="font-mono">{cpuData.frequency?.max?.toFixed(2)} GHz</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
                  <h3 className="font-semibold mb-3">Per-Core Usage</h3>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {cpuData.usage_per_core?.map((usage: number, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-sm font-mono w-12">Core {index}</span>
                          <Progress value={usage} className="flex-1 h-2" />
                          <span className="text-sm font-mono w-12">{usage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-4">
          {memoryData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
                <h3 className="font-semibold mb-3">Virtual Memory</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Usage</span>
                    <span className="font-mono">{memoryData.virtual.usage_percent}%</span>
                  </div>
                  <Progress value={memoryData.virtual.usage_percent} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Used:</span>
                      <span className="font-mono">{memoryData.virtual.used_gb} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Free:</span>
                      <span className="font-mono">{memoryData.virtual.free_gb} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-mono">{memoryData.virtual.total_gb} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available:</span>
                      <span className="font-mono">{memoryData.virtual.available_gb} GB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
                <h3 className="font-semibold mb-3">Swap Memory</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Usage</span>
                    <span className="font-mono">{memoryData.swap.usage_percent}%</span>
                  </div>
                  <Progress value={memoryData.swap.usage_percent} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Used:</span>
                      <span className="font-mono">{memoryData.swap.used_gb} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Free:</span>
                      <span className="font-mono">{memoryData.swap.free_gb} GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Disk Tab */}
        <TabsContent value="disk" className="space-y-4">
          {diskData && (
            <div className="space-y-4">
              {diskData.partitions?.map((disk: DiskInfo, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-card border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{disk.device}</h3>
                    <Badge variant="outline">{disk.filesystem_type}</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Usage</span>
                      <span className="font-mono">{disk.usage_percent}%</span>
                    </div>
                    <Progress value={disk.usage_percent} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Used:</span>
                        <span className="font-mono">{disk.used_gb} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Free:</span>
                        <span className="font-mono">{disk.free_gb} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-mono">{disk.total_gb} GB</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mounted at: {disk.mountpoint}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-4">
          {networkData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
                <h3 className="font-semibold mb-3">Network I/O</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bytes Sent:</span>
                    <span className="font-mono">{(networkData.io_counters.bytes_sent / 1024**3).toFixed(2)} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bytes Received:</span>
                    <span className="font-mono">{(networkData.io_counters.bytes_recv / 1024**3).toFixed(2)} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Packets Sent:</span>
                    <span className="font-mono">{networkData.io_counters.packets_sent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Packets Received:</span>
                    <span className="font-mono">{networkData.io_counters.packets_recv.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
                <h3 className="font-semibold mb-3">Active Connections</h3>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {networkData.connections?.slice(0, 10).map((conn: any, index: number) => (
                      <div key={index} className="text-xs font-mono p-2 bg-muted rounded">
                        <div className="flex justify-between">
                          <span>{conn.laddr}</span>
                          <Badge variant="outline" className="text-xs">
                            {conn.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processes" className="space-y-4">
          {processData && (
            <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
              <h3 className="font-semibold mb-3">Top Processes ({processData.total_processes} total)</h3>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {processData.processes?.map((process: ProcessInfo) => (
                    <div key={process.pid} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{process.name}</span>
                          <Badge variant="outline" className="text-xs">
                            PID {process.pid}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          User: {process.username} | Status: {process.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="font-mono">{process.cpu_percent}%</div>
                          <div className="text-xs text-muted-foreground">CPU</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">{process.memory_mb} MB</div>
                          <div className="text-xs text-muted-foreground">RAM</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        {/* Temperature Tab */}
        <TabsContent value="temperature" className="space-y-4">
          {temperatureData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(temperatureData).map(([sensor, readings]: [string, any]) => (
                <div key={sensor} className="p-4 rounded-lg bg-gradient-card border border-border/50">
                  <h3 className="font-semibold mb-3 capitalize">{sensor} Sensor</h3>
                  <div className="space-y-2">
                    {Array.isArray(readings) ? readings.map((reading: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{reading.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{reading.current}°C</span>
                          {reading.current > 70 && (
                            <Badge variant="destructive" className="text-xs">Hot</Badge>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">Sensor error: {readings}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Thermometer className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No temperature sensors available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};