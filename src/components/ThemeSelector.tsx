import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, Waves, Sun, Zap } from "lucide-react";

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
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

export const ThemeSelector = ({ selectedTheme, onThemeChange }: ThemeSelectorProps) => {
  return (
    <Card className="glass-card bg-transparent px-4 py-2">
      {/* <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <p className="font-sans text-sm">Theme</p>
      </div> */}
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;
          
          return (
            <Button
              key={theme.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onThemeChange(theme.id)}
              className={`
                flex flex-col items-center gap-2 p-3 h-auto relative overflow-hidden
                ${isSelected ? 'ring-2 ring-primary/50 bg-primary/0' : 'bg-black/50'}
              `}
            >
              <div className={`w-8 h-4 rounded-full bg-gradient-to-r ${theme.preview} opacity-80`} />
              {/* <div className="text-center">
                <div className="font-normal opacity-70 text-xs">{theme.name}</div>
                <div className="text-xs opacity-70">{theme.description}</div>
              </div> */}
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