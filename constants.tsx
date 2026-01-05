
import React from 'react';
import { Layers, Monitor, PenTool, Image as ImageIcon, Box } from 'lucide-react';
import { Category, SubCategory, CategoryColor } from './types';

export const APP_CONFIG = {
  url: "https://reqphazxpnnzchihougw.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXBoYXp4cG5uemNoaWhvdWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMjU5MjksImV4cCI6MjA4MjkwMTkyOX0.xEC1NzE0JHAfG4x_ahd8gNLUT2N41zmrbkWpYIy3Ke8",
  pin: "661112"
};

export const CATEGORIES: Category[] = [
  { id: 'txt2img', label: '文生图片' },
  { id: 'img2img', label: '图生图片' },
  { id: 'img2vid', label: '图生视频' },
  { id: 'txt2vid', label: '文生视频' },
  { id: 'general', label: '通用提示词' },
];

export const GENERAL_SUB_CATS: SubCategory[] = [
  { id: 'all', label: '全部', icon: <Layers size={14}/>, color: '#78716c' },
  { id: 'system', label: '系统', icon: <Monitor size={14}/>, color: '#0ea5e9' },
  { id: 'tools', label: '工具', icon: <PenTool size={14}/>, color: '#d97706' },
  { id: 'visual', label: '视觉', icon: <ImageIcon size={14}/>, color: '#db2777' },
  { id: 'other', label: '其他', icon: <Box size={14}/>, color: '#64748b' },
];

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  'txt2img': { hex: '#be185d', bg: 'bg-rose-700', light: '#fbcfe8' },
  'img2img': { hex: '#059669', bg: 'bg-emerald-600', light: '#a7f3d0' },
  'img2vid': { hex: '#d97706', bg: 'bg-amber-600', light: '#fde68a' },
  'txt2vid': { hex: '#7c3aed', bg: 'bg-violet-600', light: '#ddd6fe' },
  'general': { hex: '#44403c', bg: 'bg-stone-600', light: '#e7e5e4' },
};
