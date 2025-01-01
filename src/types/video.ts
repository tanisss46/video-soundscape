export interface Video {
  id: string;
  title: string;
  video_url: string;
  audio_url?: string;
  created_at: string;
  user_generations?: {
    id: number;
    prompt: string;
    audio_url: string;
    status: string;
  }[];
}

export interface AdvancedSettingsValues {
  seed: number;
  duration: number;
  numSteps: number;
  cfgStrength: number;
  negativePrompt: string;
}