'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

const ErrorPage = () => {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-y-2">
            <AlertTriangle className="size-6" />
            <p className="text-sm">Something went wrong</p>
            <Button variant="secondary" size="sm" asChild>
                <Link href="/">Back to home</Link>
            </Button>
        </div>
    );
};

export default ErrorPage;
