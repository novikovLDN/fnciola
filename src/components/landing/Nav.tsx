'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3"
    >
      <div
        className={`flex w-full max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 ${
          scrolled ? 'glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]' : 'border border-transparent'
        }`}
      >
        <Link href="/" className="pl-2"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          <a href="#features" className="btn btn-ghost">Возможности</a>
          <a href="#pricing" className="btn btn-ghost">Тарифы</a>
          <a href="#faq" className="btn btn-ghost">Вопросы</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">Войти</Link>
          <Link href="/register" className="btn btn-primary">Начать</Link>
        </div>
      </div>
    </motion.header>
  );
}
