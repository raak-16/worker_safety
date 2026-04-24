'use client';

import { motion } from 'framer-motion';
import { Activity, Clock, Database, Shield } from 'lucide-react';

export default function StatusBar({ connected, lastUpdate, readingCount }: { 
  connected: boolean;
  lastUpdate: string | null;
  readingCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10"
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-300">
            {connected ? 'Live Monitoring' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Activity className="w-4 h-4" />
          <span className="text-sm">{readingCount} readings</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {lastUpdate && (
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Last: {lastUpdate}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-gray-400">
          <Database className="w-4 h-4" />
          <span className="text-sm">PostgreSQL</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Shield className="w-4 h-4" />
          <span className="text-sm">Secured</span>
        </div>
      </div>
    </motion.div>
  );
}