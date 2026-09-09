import { useState, useEffect } from "react";

export type ColorMode = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'oklch';

export interface ColorControlState {
  colorMode: ColorMode;
  enableAlpha: boolean;
  alpha: number;
}

const STORAGE_KEY = 'color-control-state';

const defaultState: ColorControlState = {
  colorMode: 'hex',
  enableAlpha: false,
  alpha: 1,
};

export function useColorControl() {
  const [state, setState] = useState<ColorControlState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...defaultState, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.warn('Failed to load color control state from localStorage:', error);
      }
    }
    return defaultState;
  });

  // 自动调整alpha值：当enableAlpha状态变化时
  useEffect(() => {
    setState(prev => {
      // 如果启用透明度且当前alpha为1，则设置为默认的半透明值
      if (prev.enableAlpha && prev.alpha === 1) {
        return { ...prev, alpha: 0.5 };
      }
      // 如果禁用透明度，则强制alpha为1
      if (!prev.enableAlpha) {
        return { ...prev, alpha: 1 };
      }
      return prev;
    });
  }, [state.enableAlpha]);

  // 持久化到localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save color control state to localStorage:', error);
    }
  }, [state]);

  const setColorMode = (mode: ColorMode) => {
    setState(prev => ({ ...prev, colorMode: mode }));
  };

  const setEnableAlpha = (enable: boolean) => {
    setState(prev => ({ ...prev, enableAlpha: enable }));
  };

  const setAlpha = (alpha: number) => {
    setState(prev => ({ ...prev, alpha: Math.max(0, Math.min(1, alpha)) }));
  };

  return {
    ...state,
    setColorMode,
    setEnableAlpha,
    setAlpha,
  };
}