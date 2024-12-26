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
import { Slider } from "@/components/ui/slider";

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

  const handleChange = (field: keyof AdvancedSettingsValues, value: string | number) => {
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
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="seed">Seed (-1 for random)</Label>
            <Input
              id="seed"
              type="number"
              value={settings.seed}
              onChange={(e) => handleChange('seed', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Use a specific seed to get consistent results, or -1 for random generation
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cfgStrength">
              Guidance Strength (CFG): {settings.cfgStrength.toFixed(1)}
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  id="cfgStrength"
                  min={1}
                  max={10}
                  step={0.1}
                  value={[settings.cfgStrength]}
                  onValueChange={(value) => handleChange('cfgStrength', value[0])}
                />
              </div>
              <Input
                type="number"
                min={1}
                max={10}
                step={0.1}
                value={settings.cfgStrength}
                onChange={(e) => handleChange('cfgStrength', e.target.value)}
                className="w-20"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Lower values (1-4) allow more creativity, higher values (5-10) match the prompt more closely
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numSteps">
              Number of Steps: {settings.numSteps}
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  id="numSteps"
                  min={10}
                  max={100} // Increased max steps
                  step={1}
                  value={[settings.numSteps]}
                  onValueChange={(value) => handleChange('numSteps', value[0])}
                />
              </div>
              <Input
                type="number"
                min={10}
                max={100}
                step={1}
                value={settings.numSteps}
                onChange={(e) => handleChange('numSteps', e.target.value)}
                className="w-20"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              More steps (50-100) produce better quality but take longer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds): {settings.duration}</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  id="duration"
                  min={1}
                  max={60} // Increased max duration
                  step={1}
                  value={[settings.duration]}
                  onValueChange={(value) => handleChange('duration', value[0])}
                />
              </div>
              <Input
                type="number"
                min={1}
                max={60}
                step={1}
                value={settings.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="w-20"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Longer durations allow for more complete soundscapes
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="negativePrompt">Negative Prompt</Label>
            <Input
              id="negativePrompt"
              value={settings.negativePrompt}
              onChange={(e) => handleChange('negativePrompt', e.target.value)}
              placeholder="Sounds to avoid (e.g., 'background noise, static, distortion')"
            />
            <p className="text-sm text-muted-foreground">
              Specify sounds you want to avoid in the generation
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};