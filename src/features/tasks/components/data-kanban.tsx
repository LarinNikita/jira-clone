import React, { useEffect, useState, useCallback } from 'react';

import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from '@hello-pangea/dnd';

import { KanbanCard } from './kanban-card';
import { Task, TaskStatus } from '../types';
import { KanbanColumnHeader } from './kanban-column-header';

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
];

type TasksState = {
    [key in TaskStatus]: Task[];
};

interface DataKanbanProps {
    data: Task[];
    onChange: (
        tasks: { $id: string; status: TaskStatus; position: number }[],
    ) => void;
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach(task => {
            initialTasks[task.status].push(task);
        });

        Object.keys(initialTasks).forEach(status => {
            initialTasks[status as TaskStatus].sort(
                (a, b) => a.position - b.position,
            );
        });

        return initialTasks;
    });

    useEffect(() => {
        const newTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach(task => {
            newTasks[task.status].push(task);
        });

        Object.keys(newTasks).forEach(status => {
            newTasks[status as TaskStatus].sort(
                (a, b) => a.position - b.position,
            );
        });

        setTasks(newTasks);
    }, [data]);

    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination) return;
            const { source, destination } = result;
            const sourceStatus = source.droppableId as TaskStatus;
            const destinationStatus = destination.droppableId as TaskStatus;

            let updatesPayload: {
                $id: string;
                status: TaskStatus;
                position: number;
            }[] = [];

            setTasks(prevState => {
                const newTasks = { ...prevState };

                // Safely remove the task from the source column
                const sourceColumn = [...newTasks[sourceStatus]];
                const [movedTask] = sourceColumn.splice(source.index, 1);

                // If there`s no moved task (shouldn't happen, but just case), return the previous state
                if (!movedTask) {
                    console.error('No task found at source index');
                    return prevState;
                }

                // Create a new task object with potential updated status
                const updatedMovedTask =
                    sourceStatus !== destinationStatus
                        ? { ...movedTask, status: destinationStatus }
                        : movedTask;

                // Update the source column
                newTasks[sourceStatus] = sourceColumn;

                // Add the task to the destination column
                const destColumn = [...newTasks[destinationStatus]];
                destColumn.splice(destination.index, 0, updatedMovedTask);
                newTasks[destinationStatus] = destColumn;

                // Prepare minimal updates payload
                updatesPayload = [];

                // Always update the moved task
                updatesPayload.push({
                    $id: updatedMovedTask.$id,
                    status: destinationStatus,
                    position: Math.min(
                        (destination.index + 1) * 1000,
                        1_000_000,
                    ),
                });

                // Update positions for affected tasks in the destination column
                newTasks[destinationStatus].forEach((task, index) => {
                    if (task && task.$id !== updatedMovedTask.$id) {
                        const newPosition = Math.min(
                            (index + 1) * 1000,
                            1_000_000,
                        );
                        if (task.position !== newPosition) {
                            updatesPayload.push({
                                $id: task.$id,
                                status: destinationStatus,
                                position: newPosition,
                            });
                        }
                    }
                });

                // If the task moved between columns, update positions in the source column
                if (sourceStatus !== destinationStatus) {
                    newTasks[sourceStatus].forEach((task, index) => {
                        if (task) {
                            const newPosition = Math.min(
                                (index + 1) * 1000,
                                1_000_000,
                            );
                            if (task.position !== newPosition) {
                                updatesPayload.push({
                                    $id: task.$id,
                                    status: sourceStatus,
                                    position: newPosition,
                                });
                            }
                        }
                    });
                }

                return newTasks;
            });

            onChange(updatesPayload);
        },
        [onChange],
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map(board => {
                    return (
                        <div
                            key={board}
                            className="bg-muted mx-2 min-w-[200px] flex-1 rounded-md p-1.5"
                        >
                            <KanbanColumnHeader
                                board={board}
                                taskCount={tasks[board].length}
                            />
                            <Droppable droppableId={board}>
                                {provided => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[200px] py-1.5"
                                    >
                                        {tasks[board].map((task, index) => (
                                            <Draggable
                                                key={task.$id}
                                                draggableId={task.$id}
                                                index={index}
                                            >
                                                {provided => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <KanbanCard
                                                            task={task}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};