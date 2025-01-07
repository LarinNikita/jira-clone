import { useState } from 'react';

import { PencilIcon, XIcon } from 'lucide-react';

import { useUpdateTask } from '../api/use-update-task';

import { Task } from '../types';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DottedSeparator } from '@/components/dotted-separator';

interface TaskDescriptionProps {
    task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description);

    const { mutate, isPending } = useUpdateTask();

    const handleSave = () => {
        mutate(
            {
                json: { description: value },
                param: { taskId: task.$id },
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                },
            },
        );
    };

    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Overview</p>
                <Button
                    onClick={() => setIsEditing(prev => !prev)}
                    size="sm"
                    variant="secondary"
                >
                    {isEditing ? (
                        <XIcon className="mr-2 size-4" />
                    ) : (
                        <PencilIcon className="mr-2 size-4" />
                    )}
                    {isEditing ? 'Cancel' : 'Edit'}
                </Button>
            </div>
            <DottedSeparator className="my-4" />
            {isEditing ? (
                <div className="flex flex-col gap-y-4">
                    <Textarea
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="Add a description..."
                        rows={4}
                        disabled={isPending}
                    />
                    <Button
                        size="sm"
                        className="ml-auto w-fit"
                        onClick={handleSave}
                        disabled={!value || isPending}
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            ) : (
                <div className="">
                    {task.description || (
                        <span className="text-muted-foreground">
                            No description set
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
