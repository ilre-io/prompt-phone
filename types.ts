// Fix: Added React import to resolve the "Cannot find namespace 'React'" error on line 25
import React from 'react';

export interface PromptItem {
  id: string;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  negativePrompt?: string;
  outputMediaUrl?: string;
  inputMediaUrl?: string;
  isVideo?: boolean;
  createdAt: string;
  userId?: string;
  _dirty?: boolean;
}

export interface Category {
  id: string;
  label: string;
}

export interface SubCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export interface CategoryColor {
  hex: string;
  bg: string;
  light: string;
}