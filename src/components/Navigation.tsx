/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalendarDays, Users, FileText, Settings } from 'lucide-react';
import { ActiveTab } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: 'hi' | 'en';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  language,
}) => {
  const t = translations[language];

  const items: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'daily', label: language === 'hi' ? 'दैनिक' : 'Daily', icon: CalendarDays },
    { id: 'customers', label: language === 'hi' ? 'ग्राहक' : 'Customers', icon: Users },
    { id: 'reports', label: language === 'hi' ? 'रिपोर्ट' : 'Reports', icon: FileText },
    { id: 'settings', label: language === 'hi' ? 'सेटिङ्' : 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: ActiveTab) => {
    onTabChange(id);
    if (id === 'daily') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-[52px] bg-white border-t border-slate-200 shadow-md">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`flex flex-1 flex-col items-center justify-center py-1 rounded-lg transition-transform active:scale-95 select-none ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                  isActive
                    ? 'text-emerald-700'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[10px] leading-none text-center truncate max-w-[70px] font-['Noto_Sans_Devanagari','Inter'] mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
