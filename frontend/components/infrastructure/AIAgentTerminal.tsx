'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { generateTerminalLogs } from '@/lib/mockData';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export function AIAgentTerminal() {
  const logs = generateTerminalLogs();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-green-400">AI Agent Terminal</h3>
        <p className="text-sm text-gray-400 mt-1">System operations log</p>
      </div>

      <div
        ref={scrollRef}
        className="bg-black rounded-lg p-4 h-80 overflow-y-auto space-y-2 border border-gray-800"
      >
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 text-sm"
          >
            {getLogIcon(log.type)}
            <div className="flex-1">
              <span className="text-gray-500">[{log.timestamp}]</span>
              <span className="text-gray-300 ml-2">{log.message}</span>
            </div>
          </motion.div>
        ))}

        {/* Cursor blink effect */}
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
