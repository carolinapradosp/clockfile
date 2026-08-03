// components/layout/Sidebar.tsx

'use client';

import {
    BriefcaseBusiness,
    ChevronLeft,
    ChevronRight,
    FileClock,
    FileText,
    Settings,
    LayoutDashboard,
    Menu,
    X,
} from 'lucide-react';

import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

import Logo from '@/components/layout/Logo';
import LogoutButton from '@/components/auth/LogoutButton';

type NavigationItem = {
    label: string;
    href: string;

    icon: React.ComponentType<{
        size?: number;
        className?: string;
    }>;
};

const navigationItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Projetos',
        href: '/projetos',
        icon: BriefcaseBusiness,
    },
    {
        label: 'Relatórios',
        href: '/relatorios',
        icon: FileClock,
    },
    {
        label: 'Faturas',
        href: '/faturas',
        icon: FileText,
    },
    {
        label: 'Configurações',
        href: '/configuracoes',
        icon: Settings,
    },
];

function isActiveRoute(
    pathname: string,
    href: string
): boolean {
    if (href === '/dashboard') {
        return pathname === href;
    }

    return (
        pathname === href ||
        pathname.startsWith(`${href}/`)
    );
}

function getInitials(name: string): string {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return 'U';
    }

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]
        }`.toUpperCase();
}

type SidebarProps = {
    collapsed: boolean;

    onCollapsedChange: (
        collapsed: boolean
    ) => void;

    user: {
        name: string;
        email: string;
    };
};

export default function Sidebar({
    collapsed,
    onCollapsedChange,
    user,
}: SidebarProps) {
    const pathname = usePathname();

    const [
        mobileMenuOpenPath,
        setMobileMenuOpenPath,
    ] = useState<string | null>(null);

    const mobileMenuOpen =
        mobileMenuOpenPath === pathname;

    function closeMobileMenu() {
        setMobileMenuOpenPath(null);
    }

    return (
        <>
            {/* Botão mobile */}
            <button
                type="button"
                onClick={() => {
                    setMobileMenuOpenPath(pathname);
                }}
                aria-label="Abrir menu"
                aria-expanded={mobileMenuOpen}
                className="
          fixed left-4 top-4 z-40
          flex h-11 w-11
          items-center justify-center
          rounded-xl
          border border-slate-200
          bg-white
          text-slate-700
          shadow-sm
          transition-colors
          hover:bg-slate-100
          lg:hidden
        "
            >
                <Menu size={21} />
            </button>

            {/* Overlay mobile */}
            {mobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={closeMobileMenu}
                    className="
            fixed inset-0 z-40
            bg-slate-950/40
            backdrop-blur-sm
            lg:hidden
          "
                />
            )}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          border-r border-slate-200
          bg-white
          transition-all duration-300

          ${mobileMenuOpen
                        ? 'translate-x-0'
                        : '-translate-x-full'
                    }

          ${collapsed
                        ? 'lg:w-20'
                        : 'lg:w-72'
                    }

          lg:translate-x-0
        `}
            >
                {/* Logo */}
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-5">
                    <div
                        className={
                            collapsed
                                ? 'hidden lg:block lg:overflow-hidden'
                                : ''
                        }
                    >
                        <Link
                            href="/dashboard"
                            aria-label="Clockfile Dashboard"
                            onClick={closeMobileMenu}
                        >
                            <Logo />
                        </Link>
                    </div>

                    {collapsed && (
                        <Link
                            href="/dashboard"
                            aria-label="Clockfile Dashboard"
                            className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white lg:flex"
                        >
                            C
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={closeMobileMenu}
                        aria-label="Fechar menu"
                        className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-slate-500
              transition-colors
              hover:bg-slate-100
              lg:hidden
            "
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navegação */}
                <nav
                    aria-label="Navegação principal"
                    className="flex-1 overflow-y-auto px-3 py-6"
                >
                    <p
                        className={`
              mb-3 px-3
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-400

              ${collapsed
                                ? 'lg:hidden'
                                : ''
                            }
            `}
                    >
                        Menu
                    </p>

                    <ul className="space-y-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;

                            const active = isActiveRoute(
                                pathname,
                                item.href
                            );

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={closeMobileMenu}
                                        title={
                                            collapsed
                                                ? item.label
                                                : undefined
                                        }
                                        className={`
                      flex h-12 items-center
                      rounded-xl px-3
                      text-sm font-medium
                      transition-colors

                      ${active
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }

                      ${collapsed
                                                ? 'lg:justify-center'
                                                : 'gap-3'
                                            }
                    `}
                                    >
                                        <Icon
                                            size={20}
                                            className="shrink-0"
                                        />

                                        <span
                                            className={
                                                collapsed
                                                    ? 'lg:hidden'
                                                    : ''
                                            }
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Usuário e logout */}
                <div className="border-t border-slate-100 p-3">
                    <div
                        className={`
              mb-2
              rounded-xl
              bg-slate-50
              p-3

              ${collapsed
                                ? 'lg:flex lg:justify-center lg:p-2'
                                : ''
                            }
            `}
                    >
                        <div
                            className={`
                flex items-center

                ${collapsed
                                    ? 'lg:justify-center'
                                    : 'gap-3'
                                }
              `}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                                {getInitials(user.name)}
                            </div>

                            <div
                                className={`min-w-0 ${collapsed
                                    ? 'lg:hidden'
                                    : ''
                                    }`}
                            >
                                <p className="truncate text-sm font-semibold text-slate-800">
                                    {user.name}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            collapsed
                                ? 'lg:flex lg:justify-center'
                                : ''
                        }
                    >
                        <LogoutButton
                            collapsed={collapsed}
                        />
                    </div>

                    {/* Recolher menu no desktop */}
                    <button
                        type="button"
                        onClick={() => {
                            onCollapsedChange(!collapsed);
                        }}
                        aria-label={
                            collapsed
                                ? 'Expandir menu'
                                : 'Recolher menu'
                        }
                        title={
                            collapsed
                                ? 'Expandir menu'
                                : 'Recolher menu'
                        }
                        className="
              mt-3 hidden h-10 w-full
              items-center justify-center
              rounded-xl
              border border-slate-200
              text-slate-500
              transition-colors
              hover:bg-slate-100
              lg:flex
            "
                    >
                        {collapsed ? (
                            <ChevronRight size={18} />
                        ) : (
                            <ChevronLeft size={18} />
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}