import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, TrendingUp, RefreshCw, Clock } from "lucide-react";

interface PerformanceMetricsProps {
  device: string;
}

interface MetricsData {
  timestamps: string[];
  cpu: number[];
  memory: number[];
  network: Array<{
    bytes_sent: number;
    bytes_recv: number;
  }>;
  data_points: number;
}

export const PerformanceMetrics = ({ device }: PerformanceMetricsProps) => {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://myspace.rhishav.com/${device}/system/metrics/history`);
      if (response.ok) {
        const data = await response.json();
        setMetricsData(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [device]);

  if (loading && !metricsData) {
    return (
      <Card className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  // Transform data for charts
  const chartData = metricsData?.timestamps.map((timestamp, index) => ({
    time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: metricsData.cpu[index] || 0,
    memory: metricsData.memory[index] || 0,
    networkSent: metricsData.network[index]?.bytes_sent ? (metricsData.network[index].bytes_sent / 1024 / 1024).toFixed(2) : 0,
    networkRecv: metricsData.network[index]?.bytes_recv ? (metricsData.network[index].bytes_recv / 1024 / 1024).toFixed(2) : 0,
    timestamp
  })) || [];

  // Get recent averages
  const recentData = chartData.slice(-20); // Last 20 data points
  const avgCpu = recentData.reduce((sum, d) => sum + d.cpu, 0) / recentData.length || 0;
  const avgMemory = recentData.reduce((sum, d) => sum + d.memory, 0) / recentData.length || 0;

  const getPerformanceStatus = () => {
    if (avgCpu > 80 || avgMemory > 85) return { status: 'High', color: 'text-destructive' };
    if (avgCpu > 60 || avgMemory > 70) return { status: 'Medium', color: 'text-warning' };
    return { status: 'Good', color: 'text-success' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Performance Metrics</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={performanceStatus.color}>
              {performanceStatus.status} Performance
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg CPU Usage</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2">
              <span className="text-2xl font-bold">{avgCpu.toFixed(1)}%</span>
              <Progress value={avgCpu} className="h-2" />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Memory Usage</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="space-y-2">
              <span className="text-2xl font-bold">{avgMemory.toFixed(1)}%</span>
              <Progress value={avgMemory} className="h-2" />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gradient-card border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Data Points</span>
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold">{metricsData?.data_points || 0}</span>
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory Chart */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">CPU & Memory Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                  name="CPU %"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="hsl(var(--success))"
                  fill="hsl(var(--success) / 0.2)"
                  strokeWidth={2}
                  name="Memory %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>CPU Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Memory Usage</span>
            </div>
          </div>
        </Card>

        {/* Network Activity Chart */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Network Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value} MB`, name]}
                />
                <Line
                  type="monotone"
                  dataKey="networkSent"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={false}
                  name="Sent"
                />
                <Line
                  type="monotone"
                  dataKey="networkRecv"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={false}
                  name="Received"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span>Data Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span>Data Received</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <h4 className="font-semibold mb-2">CPU Trends</h4>
            <p className="text-sm text-muted-foreground">
              {avgCpu > 80 
                ? "High CPU usage detected. Consider checking running processes."
                : avgCpu > 60
                ? "Moderate CPU usage. System running normally."
                : "Low CPU usage. System is running efficiently."
              }
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <h4 className="font-semibold mb-2">Memory Status</h4>
            <p className="text-sm text-muted-foreground">
              {avgMemory > 85 
                ? "High memory usage. Consider closing unused applications."
                : avgMemory > 70
                ? "Moderate memory usage. Monitor for memory leaks."
                : "Memory usage is within normal range."
              }
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <h4 className="font-semibold mb-2">Data Collection</h4>
            <p className="text-sm text-muted-foreground">
              Collecting metrics every 5 seconds. Currently storing the last {metricsData?.data_points || 0} data points 
              for real-time analysis.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};