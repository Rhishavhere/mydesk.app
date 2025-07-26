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
      name: 'Win11-Desktop',
      icon: Monitor,
      color: 'text-primary'
    },
    {
      id: 'laptop',
      name: 'Fedora-Laptop', 
      icon: Laptop,
      color: 'text-accent'
    }
  ];

  return (
    <Card className="glass-card p-6 hover-lift">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Select Device</h3>
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
              className={`flex-1 h-16 flex flex-col gap-2 relative overflow-hidden group ${
                isSelected 
                  ? 'gradient-primary text-primary-foreground shadow-glow' 
                  : 'glass-card hover:glow-border'
              }`}
            >
              <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : device.color}`} />
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}>
                {device.name}
              </span>
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-glow opacity-20 animate-pulse" />
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};