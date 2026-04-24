'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface Insight {
  message: string;
  type: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  aiInsights?: {
    title: string;
    description: string;
    severity: string;
    recommendation: string;
  }[];
  aiAvailable: boolean;
}

export default function InsightsPanel({ insights, aiInsights, aiAvailable }: InsightsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-blue-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-500/20 border-success-500/50 text-success-500';
      case 'warning':
        return 'bg-warning-500/20 border-warning-500/50 text-warning-500';
      case 'recommendation':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default:
        return 'bg-white/10 border-white/20 text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Safety Insights
        </h3>
        {aiAvailable && (
          <div className="flex items-center gap-1 text-xs text-purple-400">
            <Sparkles className="w-4 h-4" />
            AI Enhanced
          </div>
        )}
      </div>

      <div className="space-y-3">
        {insights.length === 0 && !aiInsights?.length && (
          <div className="text-gray-400 text-sm">No insights available yet</div>
        )}

        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-xl border ${getStyle(insight.type)}`}
          >
            {getIcon(insight.type)}
            <span className="text-sm">{insight.message}</span>
          </motion.div>
        ))}

        {aiInsights?.map((aiInsight, index) => (
          <motion.div
            key={`ai-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (insights.length + index) * 0.1 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-purple-400">{aiInsight.title}</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{aiInsight.description}</p>
            <p className="text-xs text-gray-400 italic">Recommendation: {aiInsight.recommendation}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}