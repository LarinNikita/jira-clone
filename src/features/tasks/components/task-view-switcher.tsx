'use client';

import { useCallback } from 'react';

import { useQueryState } from 'nuqs';
import { Loader, Plus } from 'lucide-react';

import { useGetTasks } from '../api/use-get-tasks';
import { useBulkUpdateTasks } from '../api/use-bulk-update-tasks';

import { useProjectId } from '@/features/projects/hooks/use-project-id';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import { useTaskFilters } from '../hooks/use-task-filters';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';

import { columns } from './columns';
import { TaskStatus } from '../types';
import { DataTable } from './data-table';
import { DataKanban } from './data-kanban';
import { DataFilters } from './data-filters';
import { DataCalendar } from './data-calendar';

import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaskViewSwitcherProps {
    hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({
    hideProjectFilter,
}: TaskViewSwitcherProps) => {
    const [view, setView] = useQueryState('task-view', {
        defaultValue: 'table',
    });

    const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();

    const workspaceId = useWorkspaceId();
    const paramProjectId = useProjectId();

    const { open } = useCreateTaskModal();

    const { mutate: bulkUpdate } = useBulkUpdateTasks();

    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
        workspaceId,
        status,
        assigneeId,
        projectId: projectId ?? paramProjectId,
        dueDate,
    });

    const onKanbanChange = useCallback(
        (tasks: { $id: string; status: TaskStatus; position: number }[]) => {
            bulkUpdate({ json: { tasks } });
        },
        [bulkUpdate],
    );

    return (
        <Tabs
            defaultValue={view}
            onValueChange={setView}
            className="w-full flex-1 rounded-lg border"
        >
            <div className="flex h-full flex-col overflow-auto p-4">
                <div className="flex flex-col items-center justify-between gap-y-2 lg:flex-row">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="table"
                        >
                            Table
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="kanban"
                        >
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="calendar"
                        >
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                    <Button
                        className="w-full lg:w-auto"
                        size="sm"
                        onClick={open}
                    >
                        <Plus className="mr-2 size-4" />
                        New
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <DataFilters hideProjectFilter={hideProjectFilter} />
                <DottedSeparator className="my-4" />
                {isLoadingTasks ? (
                    <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border">
                        <Loader className="text-muted-foreground size-5 animate-spin" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="table" className="mt-0">
                            <DataTable
                                columns={columns}
                                data={tasks?.documents ?? []}
                            />
                        </TabsContent>
                        <TabsContent value="kanban" className="mt-0">
                            <DataKanban
                                data={tasks?.documents ?? []}
                                onChange={onKanbanChange}
                            />
                        </TabsContent>
                        <TabsContent
                            value="calendar"
                            className="mt-0 h-full pb-4"
                        >
                            <DataCalendar data={tasks?.documents ?? []} />
                        </TabsContent>
                    </>
                )}
            </div>
        </Tabs>
    );
};
