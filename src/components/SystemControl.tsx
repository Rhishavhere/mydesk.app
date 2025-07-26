import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Power, 
  RotateCcw, 
  X, 
  Camera,
  AlertTriangle,
  Shield,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemControlProps {
  device: string;
}

export const SystemControl = ({ device }: SystemControlProps) => {
  const [delay, setDelay] = useState(10);
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { toast } = useToast();

  const executeControlAction = async (action: string) => {
    if (!authToken.trim()) {
      toast({
        title: "Authentication Required",
        description: "Please enter your control token to execute system commands.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPendingAction(action);

    try {
      const response = await fetch(`https://myspace.rhishav.com/${device}/system/control/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ delay })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Command Executed",
          description: data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Command Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to communicate with the device",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const cancelShutdown = async () => {
    if (!authToken.trim()) {
      toast({
        title: "Authentication Required",
        description: "Please enter your control token first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://myspace.rhishav.com/${device}/system/control/cancel-shutdown`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Operation Cancelled",
          description: data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Cancel Failed",
          description: data.error || "Failed to cancel operation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to communicate with the device",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const takeScreenshot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://myspace.rhishav.com/${device}/system/screenshot?quality=85`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${device}-screenshot-${new Date().toISOString().slice(0, 19)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Screenshot Captured",
          description: "Screenshot has been downloaded successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Screenshot Failed",
          description: "Failed to capture screenshot",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to capture screenshot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-warning" />
        <h2 className="text-xl font-semibold">System Control</h2>
        <Badge variant="outline" className="text-xs">
          {device === 'desktop' ? 'Win11-Desktop' : 'Fedora-Laptop'}
        </Badge>
      </div>

      <Alert className="border-warning/50 bg-warning/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          These controls require authentication and can affect system availability. Use with caution.
        </AlertDescription>
      </Alert>

      {/* Authentication */}
      <div className="space-y-4 p-4 rounded-lg bg-gradient-card border border-border/50">
        <h3 className="font-semibold">Authentication</h3>
        <div className="space-y-2">
          <Label htmlFor="token">Control Token</Label>
          <Input
            id="token"
            type="password"
            placeholder="Enter your control token"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            This token is required for all system control operations
          </p>
        </div>
      </div>

      {/* Delay Configuration */}
      <div className="space-y-4 p-4 rounded-lg bg-gradient-card border border-border/50">
        <h3 className="font-semibold">Delay Configuration</h3>
        <div className="space-y-2">
          <Label htmlFor="delay">Delay (seconds)</Label>
          <Input
            id="delay"
            type="number"
            min="1"
            max="300"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value) || 10)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Time before the system action takes effect
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power Controls */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Power Management
          </h3>
          
          <Button
            variant="destructive"
            className="w-full h-12 justify-start gap-3"
            onClick={() => executeControlAction('shutdown')}
            disabled={loading || !authToken.trim()}
          >
            <Power className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Shutdown System</div>
              <div className="text-xs opacity-90">Power off in {delay}s</div>
            </div>
            {pendingAction === 'shutdown' && loading && (
              <div className="ml-auto">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
            onClick={() => executeControlAction('reboot')}
            disabled={loading || !authToken.trim()}
          >
            <RotateCcw className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Restart System</div>
              <div className="text-xs opacity-70">Reboot in {delay}s</div>
            </div>
            {pendingAction === 'reboot' && loading && (
              <div className="ml-auto">
                <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              </div>
            )}
          </Button>

          <Button
            variant="secondary"
            className="w-full h-12 justify-start gap-3"
            onClick={cancelShutdown}
            disabled={loading || !authToken.trim()}
          >
            <X className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Cancel Operation</div>
              <div className="text-xs opacity-70">Stop pending actions</div>
            </div>
          </Button>
        </div>

        {/* Utility Controls */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            System Utilities
          </h3>
          
          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 hover:glow-border"
            onClick={takeScreenshot}
            disabled={loading}
          >
            <Camera className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Take Screenshot</div>
              <div className="text-xs opacity-70">Capture current display</div>
            </div>
            {loading && pendingAction === null && (
              <div className="ml-auto">
                <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 hover:glow-border"
            onClick={() => window.open(`https://myspace.rhishav.com/${device}/health`, '_blank')}
          >
            <Download className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Health Check</div>
              <div className="text-xs opacity-70">View API status</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Status Information */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
        <h4 className="font-semibold mb-2">Security Notice</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• All control operations require valid authentication</li>
          <li>• Actions are logged and can be audited</li>
          <li>• Shutdown/restart operations can be cancelled before execution</li>
          <li>• Screenshots are captured in PNG format with 85% quality</li>
        </ul>
      </div>
    </Card>
  );
};