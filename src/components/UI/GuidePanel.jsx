import React, { useState } from 'react';
import { Download, Upload, RefreshCw, Maximize, Camera, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

export default function GuidePanel() {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`absolute top-20 left-4 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg max-w-xs backdrop-blur-sm border border-gray-200 dark:border-gray-700 select-none transition-all duration-300 ${isMinimized ? 'w-auto' : 'w-80'}`}>
      <div
        className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="font-bold text-gray-900 dark:text-white">
          📋 {t('guide.title')}
        </h3>
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!isMinimized && (
      <div className="p-4 space-y-4 text-sm">
        {/* Inbound Guide */}
        <div>
          <div className="flex items-center gap-2 font-semibold text-emerald-600 mb-1">
            <Download size={16} /> <span>{t('guide.inbound.title')}</span>
          </div>
          <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1 pl-1">
            <li><Trans i18nKey="guide.inbound.step1" components={{ 1: <span className="font-medium" /> }} /></li>
            <li><Trans i18nKey="guide.inbound.step2" components={{ 1: <span className="font-medium" /> }} /></li>
            <li>{t('guide.inbound.step3')}</li>
          </ol>
        </div>

        {/* Outbound Guide */}
        <div>
          <div className="flex items-center gap-2 font-semibold text-red-600 mb-1">
            <Upload size={16} /> <span>{t('guide.outbound.title')}</span>
          </div>
          <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1 pl-1">
            <li><Trans i18nKey="guide.outbound.step1" components={{ 1: <span className="font-medium" /> }} /></li>
            <li><Trans i18nKey="guide.outbound.step2" components={{ 1: <span className="font-medium" /> }} /></li>
            <li>{t('guide.outbound.step3')}</li>
          </ol>
        </div>

        {/* Transfer Guide */}
        <div>
          <div className="flex items-center gap-2 font-semibold text-purple-600 mb-1">
            <RefreshCw size={16} /> <span>{t('guide.transfer.title')}</span>
          </div>
          <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1 pl-1">
            <li><Trans i18nKey="guide.transfer.step1" components={{ 1: <span className="font-medium" /> }} /></li>
            <li><Trans i18nKey="guide.transfer.step2" components={{ 1: <span className="font-medium" /> }} /></li>
            <li>{t('guide.transfer.step3')}</li>
          </ol>
        </div>

        {/* Camera Guide */}
        <div>
          <div className="font-semibold text-blue-600 mb-1 border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <span>🎥 {t('guide.camera.title')}</span>
          </div>
          <ul className="text-gray-600 dark:text-gray-300 space-y-1 pl-1">
            <li className="flex items-center gap-2">
              <Maximize size={14} className="text-gray-500" />
              <span><Trans i18nKey="guide.camera.overview" components={{ 1: <span className="font-medium" /> }} /></span>
            </li>
            <li className="flex items-center gap-2">
              <Camera size={14} className="text-gray-500" />
              <span><Trans i18nKey="guide.camera.follow" components={{ 1: <span className="font-medium" /> }} /></span>
            </li>
            <li className="flex items-center gap-2">
              <Eye size={14} className="text-gray-500" />
              <span><Trans i18nKey="guide.camera.free" components={{ 1: <span className="font-medium" /> }} /></span>
            </li>
          </ul>
        </div>
      </div>
      )}
    </div>
  );
}
