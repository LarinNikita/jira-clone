import { Loader } from 'lucide-react';

const DashboardLoading = () => {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader className="text-muted-foreground size-6 animate-spin" />
        </div>
    );
};

export default DashboardLoading;
