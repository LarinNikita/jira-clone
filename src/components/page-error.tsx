import { AlertTriangle } from 'lucide-react';

interface PageErrorProps {
    message?: string;
}

export const PageError = ({
    message = 'Something went wrong',
}: PageErrorProps) => {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <AlertTriangle className="text-muted-foreground mb-2 size-6" />
            <p className="text-muted-foreground text-sm font-medium">
                {message}
            </p>
        </div>
    );
};
