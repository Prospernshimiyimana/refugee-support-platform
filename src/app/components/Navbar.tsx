'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { notificationService, Notification } from '../../lib/notificationService';
import { persistLanguage, getStoredLanguage } from '../../lib/translations';
import {
  Bell,
  ChevronDown,
  HeartHandshake,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  ShieldCheck,
  UserCircle,
  X,
} from 'lucide-react';

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, userDoc, loading, logout, isAdmin } = useAuth();
  
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationSubscriptionRef = useRef<(() => void) | null>(null);

  // Initialize language from localStorage on mount
  useEffect(() => {
    const storedLanguage = getStoredLanguage();
    if (storedLanguage !== language) {
      setLanguage(storedLanguage);
    }
  }, [language, setLanguage]);

  // Persist language changes to localStorage
  useEffect(() => {
    persistLanguage(language);
  }, [language]);

  // Subscribe to notifications only when user is authenticated
  useEffect(() => {
    // Clean up previous subscription
    if (notificationSubscriptionRef.current) {
      notificationSubscriptionRef.current();
      notificationSubscriptionRef.current = null;
    }

    // Only subscribe if user is authenticated and not loading
    if (user && !loading) {
      const unsubscribe = notificationService.subscribe((notificationList) => {
        setNotifications(notificationList);
        setUnreadCount(notificationService.getUnreadCount());
      });
      
      notificationSubscriptionRef.current = unsubscribe;
    } else {
      // Clear notifications when user is not authenticated - use setTimeout to avoid synchronous setState
      const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
      };
      const timeoutId = setTimeout(clearNotifications, 0);
      
      return () => clearTimeout(timeoutId);
    }

    return () => {
      if (notificationSubscriptionRef.current) {
        notificationSubscriptionRef.current();
        notificationSubscriptionRef.current = null;
      }
    };
  }, [user, loading]);

  const navLinks: NavLink[] = [
    { href: '/', label: t('navbar.home'), icon: Home },
    { href: '/news', label: t('navbar.news'), icon: Newspaper },
  ];

  const adminNavLinks: NavLink[] = [
    { href: '/dashboard', label: t('navbar.dashboard'), icon: LayoutDashboard },
  ];

  const allNavLinks = [...navLinks, ...(isAdmin ? adminNavLinks : [])];
  const userName = userDoc?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User';
  const userInitial = userDoc?.email?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

  const isActive = (href: string) => (
    href === '/' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
  );

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotificationDropdownOpen(false);
  };

  const getLatestNotifications = () => {
    return notifications.slice(0, 3);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-all group-hover:bg-blue-700 group-hover:shadow-md">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-base font-semibold text-slate-950 group-hover:text-blue-700 sm:text-lg">
                {language === 'rw' ? 'Gukunda Impunzi' : 'Refugee Support'}
              </span>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">
                {language === 'rw' ? 'Platforme' : 'Platform'}
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1 md:flex">
            {allNavLinks.map((link) => (
              <NavItem
                key={link.href}
                link={link}
                active={isActive(link.href)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('rw')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  language === 'rw'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                RW
              </button>
            </div>

            {user && !loading && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationDropdownOpen((open) => !open)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={notificationDropdownOpen}
                  aria-haspopup="menu"
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" role="menu">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-950">{language === 'rw' ? 'Amatangazo' : 'Notifications'}</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            {language === 'rw' ? 'Emeza byose byasomye' : 'Mark all as read'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {getLatestNotifications().length > 0 ? (
                        getLatestNotifications().map((notification) => (
                          <div
                            key={notification.id}
                            className={`border-b border-slate-50 px-4 py-3 hover:bg-slate-50 ${
                              !notification.read ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 h-2 w-2 rounded-full ${
                                !notification.read ? 'bg-blue-600' : 'bg-transparent'
                              }`} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-950">
                                  {notification.title}
                                </p>
                                {notification.message && (
                                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                    {notification.message}
                                  </p>
                                )}
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                              </div>
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                            {notification.actionUrl && (
                              <Link
                                href={notification.actionUrl}
                                className="mt-2 block text-xs font-medium text-blue-600 hover:text-blue-700"
                                onClick={() => setNotificationDropdownOpen(false)}
                              >
                                View →
                              </Link>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-slate-500">{language === 'rw' ? 'Nta amatangazo' : 'No notifications'}</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="border-t border-slate-100 px-4 py-2">
                        <Link
                          href="/notifications"
                          className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                          onClick={() => setNotificationDropdownOpen(false)}
                        >
                          {language === 'rw' ? 'Reba amatangazo yose' : 'View all notifications'}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {user && !loading ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-left shadow-xs hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-3"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-sm font-semibold text-white">
                    {userInitial}
                  </span>
                  <span className="hidden min-w-0 md:block">
                    <span className="block max-w-28 truncate text-sm font-semibold text-slate-900">
                      {userName}
                    </span>
                    <span className="block text-xs font-medium text-slate-500">
                      {isAdmin ? t('navbar.admin') : t('navbar.member')}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" role="menu">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                          <UserCircle className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{userName}</p>
                          <p className="truncate text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        onClick={() => setUserDropdownOpen(false)}
                        role="menuitem"
                      >
                        <ShieldCheck className="h-4 w-4 text-blue-700" aria-hidden="true" />
                        {t('navbar.dashboard')}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      {t('navbar.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:inline-flex"
              >
                {t('navbar.login')}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white py-3 md:hidden">
            <div className="space-y-1">
              {allNavLinks.map((link) => (
                <MobileNavItem
                  key={link.href}
                  link={link}
                  active={isActive(link.href)}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
              {!user && !loading && (
                <Link
                  href="/login"
                  className="hidden rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:inline-flex"
                >
                  {language === 'rw' ? 'Injira muri sisteme' : 'Sign in'}
                </Link>
              )}
              {user && !loading && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {language === 'rw' ? 'Tangira sisteme' : 'Sign out'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      className={`group relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        active
          ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
          : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-700'}`} aria-hidden="true" />
      {link.label}
      {active && <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-blue-700" />}
    </Link>
  );
}

function MobileNavItem({
  link,
  active,
  onClick,
}: {
  link: NavLink;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
        active
          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
      }`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      {link.label}
    </Link>
  );
}
