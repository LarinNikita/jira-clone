'use client';

import { Loader } from 'lucide-react';

const LoadingPage = () => {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-y-2">
            <Loader className="size-6 animate-spin" />
        </div>
    );
};

export default LoadingPage;
