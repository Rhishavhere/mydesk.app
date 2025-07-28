import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Palette, Waves, Sun, Zap, Play, Pause } from "lucide-react";

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  isAutomatic: boolean;
  onAutomaticChange: (auto: boolean) => void;
}

const themes = [
  {
    id: 'aurora',
    name: 'Aurora',
    icon: Zap,
    description: 'Purple & cyan gradients',
    preview: 'from-purple-500 to-cyan-400'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: Sun,
    description: 'Orange & pink warmth',
    preview: 'from-orange-500 to-pink-400'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: Waves,
    description: 'Blue & teal depths',
    preview: 'from-blue-500 to-teal-400'
  }
];

export const ThemeSelector = ({ selectedTheme, onThemeChange, isAutomatic, onAutomaticChange }: ThemeSelectorProps) => {
  return (
    <Card className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Theme</h3>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-theme" className="text-sm flex items-center gap-1">
            {isAutomatic ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            Auto
          </Label>
          <Switch 
            id="auto-theme"
            checked={isAutomatic}
            onCheckedChange={onAutomaticChange}
          />
        </div>
      </div>
      
      {isAutomatic && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-center text-primary font-medium">
            🎨 Auto-cycling through themes...
          </p>
        </div>
      )}
      
      <div className={`grid grid-cols-3 gap-3 transition-opacity duration-500 ${isAutomatic ? 'opacity-50' : 'opacity-100'}`}>
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;
          
          return (
            <Button
              key={theme.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => !isAutomatic && onThemeChange(theme.id)}
              disabled={isAutomatic}
              className={`
                flex flex-col items-center gap-2 p-3 h-auto relative overflow-hidden
                ${isSelected ? 'ring-2 ring-primary/50' : ''}
              `}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.preview} opacity-80`} />
              <div className="text-center">
                <div className="font-medium text-xs">{theme.name}</div>
                <div className="text-xs opacity-70">{theme.description}</div>
              </div>
              {isSelected && (
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};