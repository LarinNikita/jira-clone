import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { cn } from '@/lib/utils';

import './globals.css';

import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Jira Clone',
    description:
        'The only project management tool you need to plan and track work across every team.',
    icons: '/favicon.svg',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(inter.className, 'min-h-screen antialiased')}>
                <NuqsAdapter>
                    <QueryProvider>
                        <Toaster />
                        {children}
                    </QueryProvider>
                </NuqsAdapter>
            </body>
        </html>
    );
}
