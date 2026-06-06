'use client';

import { useEffect, useState } from 'react';

interface CountUpProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function CountUp({ value, decimals = 0, suffix = '', className = '' }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (display === value) return;
    setFlash(true);
    setDisplay(value);
    const t = setTimeout(() => setFlash(false), 400);
    return () => clearTimeout(t);
  }, [value, display]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return (
    <span
      className={`mono-num transition-colors duration-300 ${flash ? 'text-hydrogen' : ''} ${className}`}
    >
      {formatted}
      {suffix}
    </span>
  );
}
