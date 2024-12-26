import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface AdvancedSettingsValues {
  seed: number;
  duration: number;
  numSteps: number;
  cfgStrength: number;
  negativePrompt: string;
}

interface AdvancedSettingsProps {
  settings: AdvancedSettingsValues;
  onSettingsChange: (settings: AdvancedSettingsValues) => void;
}

export const AdvancedSettings = ({ settings, onSettingsChange }: AdvancedSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field: keyof AdvancedSettingsValues, value: string) => {
    onSettingsChange({
      ...settings,
      [field]: field === 'negativePrompt' ? value : Number(value),
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 w-full">
          Advanced Settings
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seed">Seed (-1 for random)</Label>
            <Input
              id="seed"
              type="number"
              value={settings.seed}
              onChange={(e) => handleChange('seed', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="30"
              value={settings.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numSteps">Number of Steps</Label>
            <Input
              id="numSteps"
              type="number"
              min="1"
              max="50"
              value={settings.numSteps}
              onChange={(e) => handleChange('numSteps', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cfgStrength">CFG Strength</Label>
            <Input
              id="cfgStrength"
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={settings.cfgStrength}
              onChange={(e) => handleChange('cfgStrength', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="negativePrompt">Negative Prompt</Label>
          <Input
            id="negativePrompt"
            value={settings.negativePrompt}
            onChange={(e) => handleChange('negativePrompt', e.target.value)}
            placeholder="Enter terms to avoid in generation"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};