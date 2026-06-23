'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * Тонкая обёртка над Apache ECharts (§4). Пастельная палитра категорий (§14.3),
 * уважение к prefers-reduced-motion.
 */
export function EChart({ option, height = 280, ariaLabel }: { option: echarts.EChartsOption; height?: number; ariaLabel?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    chartRef.current = echarts.init(ref.current, undefined, { renderer: 'svg' });
    chartRef.current.setOption({ animation: !reduceMotion, ...option });

    const onResize = () => chartRef.current?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chartRef.current?.dispose();
    };
  }, [option]);

  return <div ref={ref} role="img" aria-label={ariaLabel} style={{ height, width: '100%' }} />;
}

/** Неоновая палитра категорий (тёмная тема). */
export const CHART_PALETTE = ['#F24E1E', '#1C1C1E', '#15A35B', '#7B8AFF', '#F4A63A', '#E2403C', '#9CA3AF'];
