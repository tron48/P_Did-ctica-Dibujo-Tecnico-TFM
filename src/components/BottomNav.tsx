import React from 'react';
import { NavTab } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Inicio', icon: 'dashboard' },
    { id: 'situaciones-aprendizaje', label: 'S.A.', icon: 'architecture' },
    { id: 'mapa-curricular', label: 'Mapa', icon: 'account_tree' },
    { id: 'calendario-temporizacion', label: 'Agenda', icon: 'calendar_today' },
    { id: 'evaluacion-rubricas', label: 'Rúbricas', icon: 'rule' },
    { id: 'banco-actividades', label: 'Banco', icon: 'folder_copy' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl border-t border-surface-container shadow-[0_-2px_12px_rgba(15,41,66,0.06)]">
      <div className="max-w-md md:max-w-xl mx-auto flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] py-1 transition-all rounded-lg ${
                isActive
                  ? 'text-secondary font-semibold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface opacity-80 hover:opacity-100'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'font-bold' : ''}`}>
                {item.icon}
              </span>
              <span className={`font-label-badge text-label-badge tracking-tight ${isActive ? 'text-secondary font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
