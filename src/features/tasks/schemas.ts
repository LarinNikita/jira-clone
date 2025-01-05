import { z } from 'zod';
import { TaskStatus } from './types';

export const createTaskSchema = z.object({
    name: z.string().trim().min(1, 'Required'),
    description: z
        .string()
        .max(2048, 'Must be at most 2048 characters long')
        .optional(),
    status: z.nativeEnum(TaskStatus, { required_error: 'Required' }),
    workspaceId: z.string().trim().min(1, 'Required'),
    projectId: z.string().trim().min(1, 'Required'),
    assigneeId: z.string().trim().min(1, 'Required'),
    dueDate: z.coerce.date(),
});
