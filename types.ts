
// Import React to resolve React namespace error
import React from 'react';

export type AppView = 'home' | 'generate' | 'resize' | 'logo' | 'mascot' | 'collage' | 'remove-object' | 'graduation' | 'thumbnail' | 'watermark' | 'age';

export enum ImageStyle {
  REALISTIC = 'Realistis',
  CARTOON = 'Kartun',
  ANIME = 'Anime',
  ILLUSTRATION = 'Ilustrasi',
  FLAT_DESIGN = 'Flat Design'
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  THREE_FOUR = '3:4',
  FOUR_THREE = '4:3'
}

export interface PlatformConfig {
  id: string;
  name: string;
  ratio: AspectRatio;
  icon: string;
}

export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K'
}

export interface Feature {
  id: AppView;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export interface GenerationResult {
  url: string;
  timestamp: number;
}
