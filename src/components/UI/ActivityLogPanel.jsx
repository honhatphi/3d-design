import React, { useState } from 'react';
import { useWarehouseStore } from '../../store/warehouseStore';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Activity Log Panel
 * Displays real-time logs of shuttle activities
 */
export default function ActivityLogPanel() {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);
  const logs = useWarehouseStore((state) => state.activityLogs);
  const clearLogs = useWarehouseStore((state) => state.clearLogs);

  const getLogColor = (type) => {
    switch (type) {
      case 'start':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'move':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'action':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={`absolute top-20 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${isMinimized ? 'w-auto h-auto' : 'w-80'}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer gap-4"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-bold text-white">{t('logs.title')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); clearLogs(); }}
            className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
            title={t('logs.clear')}
          >
            {t('logs.clear')}
          </button>
          <button className="text-white hover:bg-white/20 p-0.5 rounded">
            {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Logs Container */}
      {!isMinimized && (
        <>
          <div className="h-80 overflow-y-auto p-2 space-y-1">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            {t('logs.empty')}
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded text-xs font-mono ${getLogColor(log.type)} animate-fadeIn`}
            >
              <div className="flex items-start gap-2">
                <span className="text-[10px] opacity-60 flex-shrink-0 pt-0.5">
                  {log.timestamp}
                </span>
                <span className="flex-1">{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
          {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
