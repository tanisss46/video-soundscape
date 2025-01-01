export interface Video {
  id: string;
  title: string;
  video_url: string;
  audio_url?: string;
  created_at: string;
}

export interface AdvancedSettingsValues {
  seed: number;
  duration: number;
  numSteps: number;
  cfgStrength: number;
  negativePrompt: string;
}