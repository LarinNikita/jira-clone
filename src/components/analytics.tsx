import { ProjectAnalyticsResponseType } from '@/features/projects/api/use-get-project-analytics';

import { AnalyticsCard } from './analytics-card';
import { DottedSeparator } from './dotted-separator';

import { ScrollArea, ScrollBar } from './ui/scroll-area';

export const Analytics = ({ data }: ProjectAnalyticsResponseType) => {
    if (!data) return null;

    return (
        <ScrollArea className="w-full shrink-0 whitespace-nowrap rounded-lg border">
            <div className="flex w-full flex-row">
                <div className="flex flex-1 items-center">
                    <AnalyticsCard
                        title="Total Tasks"
                        value={data.taskCount}
                        variant={data.taskDifference > 0 ? 'up' : 'down'}
                        increaseValue={data.taskDifference}
                    />
                    <DottedSeparator orientation="vertical" />
                </div>
                <div className="flex flex-1 items-center">
                    <AnalyticsCard
                        title="Assigned tasks"
                        value={data.assignedTaskCount}
                        variant={
                            data.assignedTaskDifference > 0 ? 'up' : 'down'
                        }
                        increaseValue={data.assignedTaskDifference}
                    />
                    <DottedSeparator orientation="vertical" />
                </div>
                <div className="flex flex-1 items-center">
                    <AnalyticsCard
                        title="Completed Tasks"
                        value={data.completedTaskCount}
                        variant={
                            data.completedTaskDifference > 0 ? 'up' : 'down'
                        }
                        increaseValue={data.completedTaskDifference}
                    />
                    <DottedSeparator orientation="vertical" />
                </div>
                <div className="flex flex-1 items-center">
                    <AnalyticsCard
                        title="Overdue Tasks"
                        value={data.overdueTaskCount}
                        variant={data.overdueTaskDifference > 0 ? 'up' : 'down'}
                        increaseValue={data.overdueTaskDifference}
                    />
                    <DottedSeparator orientation="vertical" />
                </div>
                <div className="flex flex-1 items-center">
                    <AnalyticsCard
                        title="Incomplete Tasks"
                        value={data.incompleteTaskCount}
                        variant={
                            data.incompleteTaskDifference > 0 ? 'up' : 'down'
                        }
                        increaseValue={data.incompleteTaskDifference}
                    />
                </div>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
};
