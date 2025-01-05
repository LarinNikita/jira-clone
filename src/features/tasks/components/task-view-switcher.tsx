'use client';

import { Plus } from 'lucide-react';

import { useCreateTaskModal } from '../hooks/use-create-task-modal';

import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TaskViewSwitcher = () => {
    const { open } = useCreateTaskModal();

    return (
        <Tabs className="w-full flex-1 rounded-lg border">
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
                <DottedSeparator className="my-7" />
                Data filters
                <DottedSeparator className="my-7" />
                <>
                    <TabsContent value="table" className="mt-0">
                        Data table
                    </TabsContent>
                    <TabsContent value="kanban" className="mt-0">
                        Data kanban
                    </TabsContent>
                    <TabsContent value="calendar" className="mt-0">
                        Data calendar
                    </TabsContent>
                </>
            </div>
        </Tabs>
    );
};
