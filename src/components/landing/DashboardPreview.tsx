'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/** Живой превью-дашборд с анимированным графиком — «liquid glass». */
export function DashboardPreview() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!inView || !chartRef.current) return;
    setMounted(true);
    const chart = echarts.init(chartRef.current, undefined, { renderer: 'svg' });
    const x = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];

    chart.setOption({
      animationDuration: reduce ? 0 : 1400,
      animationEasing: 'cubicOut',
      grid: { left: 8, right: 8, top: 16, bottom: 24 },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(18,20,38,0.95)', borderColor: 'rgba(124,92,255,0.4)', textStyle: { color: '#EDEEF8' } },
      xAxis: {
        type: 'category', data: x, boundaryGap: false,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: '#9A9CB8' }, axisTick: { show: false },
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#9A9CB8' } },
      series: [
        {
          name: 'Выручка', type: 'line', smooth: true, symbol: 'none',
          data: [620, 732, 701, 834, 902, 1290],
          lineStyle: { width: 3, color: '#7C5CFF' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(124,92,255,0.45)' },
              { offset: 1, color: 'rgba(124,92,255,0)' },
            ]),
          },
        },
        {
          name: 'Прибыль', type: 'line', smooth: true, symbol: 'none',
          data: [220, 282, 251, 334, 390, 540],
          lineStyle: { width: 3, color: '#3DD6F5' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(61,214,245,0.3)' },
              { offset: 1, color: 'rgba(61,214,245,0)' },
            ]),
          },
        },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [inView, reduce]);

  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200 }}
      className="card ring-gradient relative overflow-hidden"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="label">Динамика проекта</div>
          <div className="font-display text-xl font-semibold">Кофейня «На углу»</div>
        </div>
        <span className="badge">Полгода</span>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { l: 'Выручка', v: '₽ 5,7М', c: '' },
          { l: 'EBITDA', v: '+ ₽ 1,3М', c: 'text-positive' },
          { l: 'Маржа', v: '23%', c: 'text-cyan' },
        ].map((m) => (
          <div key={m.l} className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted">{m.l}</div>
            <div className={`font-display text-lg font-semibold tnum ${m.c}`}>{m.v}</div>
          </div>
        ))}
      </div>

      <div ref={chartRef} className="h-56 w-full" />
      {!mounted && <div className="skeleton absolute inset-x-6 bottom-6 h-56 rounded-2xl" />}
    </motion.div>
  );
}
