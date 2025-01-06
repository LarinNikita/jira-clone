import { Loader } from 'lucide-react';

export const PageLoader = () => {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader className="text-muted-foreground size-6 animate-spin" />
        </div>
    );
};
