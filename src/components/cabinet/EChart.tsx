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

/** Пастельная палитра категорий на основе акцента (§14.3). */
export const CHART_PALETTE = ['#6C4DF5', '#9B86F8', '#10B981', '#FF6B5A', '#F5A623', '#4DA6F5', '#C4B5FD'];
