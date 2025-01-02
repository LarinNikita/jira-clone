'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SettingsIcon, UserIcon } from 'lucide-react';
import {
    GoCheckCircle,
    GoCheckCircleFill,
    GoHome,
    GoHomeFill,
} from 'react-icons/go';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import { cn } from '@/lib/utils';

const routes = [
    {
        label: 'Home',
        href: '',
        icon: GoHome,
        activeIcon: GoHomeFill,
    },
    {
        label: 'My Tasks',
        href: '/tasks',
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
    },
    {
        label: 'Settings',
        href: '/settings',
        icon: SettingsIcon,
        activeIcon: SettingsIcon,
    },
    {
        label: 'Members',
        href: '/members',
        icon: UserIcon,
        activeIcon: UserIcon,
    },
];

export const Navigation = () => {
    const pathname = usePathname();
    const workspaceId = useWorkspaceId();

    return (
        <ul>
            {routes.map(item => {
                const fullHref = `/workspaces/${workspaceId}${item.href}`;
                const isActive = pathname === fullHref;
                const Icon = isActive ? item.activeIcon : item.icon;

                return (
                    <Link key={item.href} href={fullHref}>
                        <div
                            className={cn(
                                'hover:text-primary flex items-center gap-2.5 rounded-md p-2.5 font-medium text-neutral-500 transition',
                                isActive &&
                                    'text-primary bg-white shadow-sm hover:opacity-100',
                            )}
                        >
                            <Icon className="size-5 text-neutral-500" />
                            {item.label}
                        </div>
                    </Link>
                );
            })}
        </ul>
    );
};
