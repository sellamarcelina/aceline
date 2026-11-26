import React from 'react';
import { Shield, User } from 'lucide-react';
import { UserRole } from '../types/library';
import { ADMIN_AVATAR_URL, MEMBER_AVATAR_URL } from '../data/seedData';

export type ActiveTab =
  | 'discover'
  | 'catalog'
  | 'shelf'
  | 'dashboard'
  | 'circulation'
  | 'reports';

interface TopNavProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  memberName: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  role,
  onRoleChange,
  activeTab,
  onTabChange,
  memberName,
}) => {
  const navItems: { id: ActiveTab; label: string }[] =
    role === 'admin'
      ? [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'catalog', label: 'Catalog' },
          { id: 'circulation', label: 'Circulation' },
          { id: 'reports', label: 'Reports' },
        ]
      : [
          { id: 'discover', label: 'Discover' },
          { id: 'catalog', label: 'Catalog' },
          { id: 'shelf', label: 'My Shelf' },
        ];

  const avatarSrc = role === 'admin' ? ADMIN_AVATAR_URL : MEMBER_AVATAR_URL;
  const profileLabel = role === 'admin' ? 'Claire Moreau' : memberName;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[#F1D4E3] bg-[#FDF2F8]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onTabChange(role === 'admin' ? 'dashboard' : 'discover')}
          className="font-editorial text-2xl sm:text-[26px] font-semibold tracking-tight text-[#5C0017] hover:text-[#800020] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800020] rounded"
        >
          Acelivre
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800020] rounded ${
                  isActive
                    ? 'text-[#800020] font-semibold'
                    : 'text-[#6E4A56] hover:text-[#2A0A14]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[#800020]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Role Switcher & Active Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            role="group"
            aria-label="Switch view role"
            className="inline-flex items-center rounded-lg border border-[#EBC6D8] bg-white p-0.5"
          >
            <button
              type="button"
              onClick={() => onRoleChange('member')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                role === 'member'
                  ? 'bg-[#800020] text-white'
                  : 'text-[#6E4A56] hover:text-[#2A0A14]'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Member</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('admin')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                role === 'admin'
                  ? 'bg-[#800020] text-white'
                  : 'text-[#6E4A56] hover:text-[#2A0A14]'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 pl-1">
            <img
              src={avatarSrc}
              alt={profileLabel}
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full object-cover border border-[#EBC6D8]"
            />
            <span className="text-xs font-medium text-[#2A0A14] whitespace-nowrap max-w-[120px] truncate">
              {profileLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Mobile Navigation"
        className="flex md:hidden items-center gap-1 overflow-x-auto border-t border-[#F1D4E3] bg-white/80 px-4 py-1.5 scrollbar-hide"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#800020] text-white'
                  : 'text-[#6E4A56] hover:text-[#2A0A14]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
