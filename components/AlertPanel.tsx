'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, X, Info, CheckCircle } from 'lucide-react';
import { Alert } from '@/lib/types';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: number) => void;
}

const severityStyles = {
  critical: {
    bg: 'bg-danger-500/20',
    border: 'border-danger-500',
    text: 'text-danger-500',
    icon: AlertTriangle,
  },
  high: {
    bg: 'bg-warning-500/20',
    border: 'border-warning-500',
    text: 'text-warning-500',
    icon: AlertTriangle,
  },
  medium: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500',
    text: 'text-yellow-500',
    icon: Info,
  },
  low: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    text: 'text-blue-500',
    icon: Info,
  },
};

export default function AlertPanel({ alerts, onAcknowledge }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-success-500/20 border border-success-500/50 rounded-xl p-4 flex items-center gap-3"
      >
        <CheckCircle className="w-6 h-6 text-success-500" />
        <span className="text-success-500">All systems normal - No active alerts</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-danger-500" />
        Active Alerts ({alerts.length})
      </h3>
      {alerts.map((alert, index) => {
        const style = severityStyles[alert.severity] || severityStyles.low;
        const Icon = style.icon;

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              ${style.bg} ${style.border} border rounded-xl p-4
              ${alert.severity === 'critical' ? 'animate-pulse-glow' : ''}
            `}
            style={{ color: style.text.replace('text-', '') }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 ${style.text}`} />
                <div>
                  <div className={`font-medium capitalize ${style.text}`}>
                    {alert.type} Alert - {alert.severity}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {alert.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}