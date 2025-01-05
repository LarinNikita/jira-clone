import { Loader } from 'lucide-react';

import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import { Card, CardContent } from '@/components/ui/card';
import { EditTaskForm } from './edit-task-form';
import { useGetTask } from '../api/use-get-task';

interface EditTaskFormWrapperProps {
    id: string;
    onCancel: () => void;
}

export const EditTaskFormWrapper = ({
    id,
    onCancel,
}: EditTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId();

    const { data: initialValues, isLoading: isLoadingTask } = useGetTask({
        taskId: id,
    });

    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
        workspaceId,
    });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({
        workspaceId,
    });

    const projectOptions = projects?.documents.map(project => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl,
    }));

    const memberOptions = members?.documents.map(member => ({
        id: member.$id,
        name: member.name,
    }));

    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask;

    if (isLoading) {
        return (
            <Card className="h-[714px] w-full border-none shadow-none">
                <CardContent className="flex h-full items-center justify-center">
                    <Loader className="text-muted-foreground size-5 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!initialValues) return null;

    return (
        <EditTaskForm
            initialValues={initialValues}
            projectOptions={projectOptions ?? []}
            memberOptions={memberOptions ?? []}
            onCancel={onCancel}
        />
    );
};
