'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Поповер в портале (document.body) с fixed-позиционированием от триггера.
 * Никакой ancestor с overflow:hidden не может его обрезать. Сам прижимается
 * в пределах вьюпорта и переворачивается вверх, если снизу нет места.
 */
export function Popover({
  open,
  anchorEl,
  onClose,
  children,
  width,
  matchAnchorWidth = false,
  align = 'start',
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  matchAnchorWidth?: boolean;
  align?: 'start' | 'end';
}) {
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width?: number; placement: 'top' | 'bottom' } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !anchorEl) return;
    const compute = () => {
      const r = anchorEl.getBoundingClientRect();
      const margin = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = matchAnchorWidth ? r.width : Math.min(width ?? 304, vw - margin * 2);
      let left = align === 'end' ? r.right - w : r.left;
      left = Math.max(margin, Math.min(left, vw - w - margin));

      const popH = popRef.current?.offsetHeight ?? 320;
      const spaceBelow = vh - r.bottom;
      const placement: 'top' | 'bottom' = spaceBelow < popH + margin && r.top > spaceBelow ? 'top' : 'bottom';
      const top = placement === 'bottom' ? r.bottom + 6 : r.top - popH - 6;
      setPos({ top, left, width: w, placement });
    };
    compute();
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [open, anchorEl, width, matchAnchorWidth, align]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || anchorEl?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, anchorEl, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popRef}
          initial={{ opacity: 0, y: pos?.placement === 'top' ? 6 : -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: pos?.placement === 'top' ? 6 : -6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: pos?.width }}
          className="z-[100]"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
