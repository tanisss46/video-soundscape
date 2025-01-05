import { useState } from "react";
import { AdvancedSettingsValues } from "@/types/video";

const DEFAULT_SETTINGS: AdvancedSettingsValues = {
  seed: 0,
  duration: 10,
  numSteps: 25,
  cfgStrength: 4.5,
  negativePrompt: "",
};

export const useVideoSettings = () => {
  const [settings, setSettings] = useState<AdvancedSettingsValues>(DEFAULT_SETTINGS);

  const handleSettingsChange = (newSettings: AdvancedSettingsValues) => {
    setSettings(newSettings);
  };

  return {
    settings,
    handleSettingsChange,
  };
};