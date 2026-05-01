'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Download,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  Newspaper,
  Settings,
  Users,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Cases',
    items: [
      { name: 'All Cases', href: '/dashboard/cases', icon: FileText },
      { name: 'Case Statistics', href: '/dashboard/cases/stats', icon: BarChart3 },
    ],
  },
  {
    label: 'News',
    items: [
      { name: 'News Articles', href: '/dashboard/news', icon: Newspaper },
      { name: 'News Statistics', href: '/dashboard/news/stats', icon: BarChart3 },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'User Management', href: '/dashboard/users', icon: Users },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { name: 'Export Data', href: '/dashboard/export', icon: Download },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen = true,
  onClose,
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }

    if (href === '/dashboard/cases') {
      return pathname === href || /^\/dashboard\/cases\/[^/]+(\/edit)?$/.test(pathname);
    }

    if (href === '/dashboard/news') {
      return pathname === href || /^\/dashboard\/news\/[^/]+$/.test(pathname);
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className={`flex min-h-screen flex-col border-r border-slate-200 bg-white ${isOpen ? 'w-72' : 'w-0'} overflow-hidden transition-all duration-300 ease-in-out`}>
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Link
          href="/dashboard"
          className="group flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onClose}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm group-hover:bg-blue-700">
            <HeartHandshake className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-slate-950">Refugee Support</p>
            <p className="text-xs font-medium text-slate-500">Admin workspace</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {navigationSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-900">Admin User</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">admin@gmail.com</p>
        </div>
      </div>
    </aside>
  );
};

function SidebarLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        active
          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
        active ? 'bg-white text-blue-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
      }`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

export default DashboardSidebar;
