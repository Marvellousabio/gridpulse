'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { generateTerminalLogs } from '@/lib/mockData';
import { apiClient } from '@/lib/api';
import type { TerminalLog } from '@/lib/types';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const POLL_MS = 4000;

export function AIAgentTerminal() {
  const [logs, setLogs] = useState<TerminalLog[]>(generateTerminalLogs());
  const [live, setLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await apiClient.getTerminalLogs();
        if (!cancelled) {
          setLogs(next);
          setLive(true);
        }
      } catch {
        if (!cancelled) setLive(false);
      }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const displayLogs = [...logs].reverse();

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-800 font-mono">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-green-400">GridPulse Autonomous Agent Activity</h3>
          <p className="text-sm text-gray-400 mt-1">LangGraph balancer — live operations log</p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
            live
              ? 'text-green-400 border-green-800 bg-green-950'
              : 'text-amber-400 border-amber-800 bg-amber-950'
          }`}
        >
          {live ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {live ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="bg-black rounded-lg p-4 h-80 overflow-y-auto space-y-2 border border-gray-800"
      >
        {displayLogs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 text-sm"
          >
            {getLogIcon(log.type)}
            <div className="flex-1 min-w-0">
              <span className="text-gray-500">[{log.timestamp}]</span>
              <span className="text-gray-300 ml-2 break-words">{log.message}</span>
            </div>
          </motion.div>
        ))}

        <div className="flex items-center gap-2 text-green-400">
          <span>$</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-green-400"
          />
        </div>
      </div>
    </div>
  );
}
