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
            <Label htmlFor="cfgStrength">Guidance Strength (CFG)</Label>
            <div className="pt-2">
              <Slider
                id="cfgStrength"
                min={1}
                max={10}
                step={0.1}
                value={[settings.cfgStrength]}
                onValueChange={(value) => handleChange('cfgStrength', value[0])}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Higher values (4-7) make the sound more closely match the prompt. Lower values allow more creativity.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numSteps">Number of Steps</Label>
            <div className="pt-2">
              <Slider
                id="numSteps"
                min={10}
                max={50}
                step={1}
                value={[settings.numSteps]}
                onValueChange={(value) => handleChange('numSteps', value[0])}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              More steps (25-50) generally produce better quality but take longer
            </p>
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
            <p className="text-sm text-muted-foreground">
              Note: The final duration will be limited by your video length
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="negativePrompt">Negative Prompt</Label>
            <Input
              id="negativePrompt"
              value={settings.negativePrompt}
              onChange={(e) => handleChange('negativePrompt', e.target.value)}
              placeholder="Sounds to avoid (e.g., 'music, talking, background noise')"
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