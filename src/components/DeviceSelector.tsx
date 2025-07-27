import { Monitor, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DeviceSelectorProps {
  selectedDevice: string;
  onDeviceChange: (device: string) => void;
}

export const DeviceSelector = ({ selectedDevice, onDeviceChange }: DeviceSelectorProps) => {
  const devices = [
    {
      id: 'desktop',
      name: 'Desktop',
      icon: Monitor,
      color: 'text-primary'
    },
    {
      id: 'laptop',
      name: 'Laptop', 
      icon: Laptop,
      color: 'text-accent'
    }
  ];

  return (
    <Card className="glass-card p-4 touch-interactive">
      {/* <h3 className="text-fluid-lg font-semibold mb-4 text-foreground">Select Device</h3> */}
      <div className="flex gap-3">
        {devices.map((device) => {
          const Icon = device.icon;
          const isSelected = selectedDevice === device.id;
          
          return (
            <Button
              key={device.id}
              variant={isSelected ? "default" : "outline"}
              size="lg"
              onClick={() => onDeviceChange(device.id)}
              className={`flex-1 h-16 flex flex-col gap-2 relative overflow-hidden group touch-target transition-all duration-300 ${
                isSelected 
                  ? 'gradient-primary text-white shadow-glow border-none' 
                  : 'glass-card hover:glass-float touch-interactive'
              }`}
            >
              <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : device.color}`} />
              <span className={`text-fluid-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}>
                {device.name}
              </span>
              {isSelected && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20 animate-shimmer" />
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                </>
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};