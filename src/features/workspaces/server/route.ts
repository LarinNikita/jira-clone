import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import {
    DATABASE_ID,
    IMAGES_BUCKET_ID,
    MEMBERS_ID,
    PROJECTS_ID,
    TASKS_ID,
    WORKSPACES_ID,
} from '@/config';

import { getMember } from '@/features/members/utils';
import { MemberRole } from '@/features/members/types';

import { generateInviteCode } from '@/lib/utils';
import { sessionMiddleware } from '@/lib/session-middleware';

import { Workspace } from '../types';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
    .get('/', sessionMiddleware, async ctx => {
        const user = ctx.get('user');
        const databases = ctx.get('databases');

        const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
            Query.equal('userId', user.$id),
        ]);

        if (members.total === 0) {
            return ctx.json({
                data: {
                    documents: [],
                    total: 0,
                },
            });
        }

        const workspaceIds = members.documents.map(
            member => member.workspaceId,
        );

        const workspace = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.contains('$id', workspaceIds),
            ],
        );

        return ctx.json({ data: workspace });
    })
    .get('/:workspaceId', sessionMiddleware, async ctx => {
        const user = ctx.get('user');
        const databases = ctx.get('databases');

        const { workspaceId } = ctx.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return ctx.json({ error: 'Unauthorized' }, 401);
        }

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
        );

        return ctx.json({ data: workspace });
    })
    .get('/:workspaceId/info', sessionMiddleware, async ctx => {
        const databases = ctx.get('databases');

        const { workspaceId } = ctx.req.param();

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
        );

        return ctx.json({
            data: {
                $id: workspace.$id,
                name: workspace.name,
                imageUrl: workspace.imageUrl,
            },
        });
    })
    .get('/:workspaceId/analytics', sessionMiddleware, async ctx => {
        const user = ctx.get('user');
        const databases = ctx.get('databases');

        const { workspaceId } = ctx.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return ctx.json({ error: 'Unauthorized' }, 401);
        }

        const now = new Date();
        const thisMothStart = startOfMonth(now);
        const thisMothEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const thisMouthTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.greaterThanEqual(
                    '$createdAt',
                    thisMothStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', thisMothEnd.toISOString()),
            ],
        );

        const lastMouthTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.greaterThanEqual(
                    '$createdAt',
                    lastMonthStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
            ],
        );

        const taskCount = thisMouthTasks.total;
        const taskDifference = taskCount - lastMouthTasks.total;

        const thisMouthAssignedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.equal('assigneeId', member.$id),
                Query.greaterThanEqual(
                    '$createdAt',
                    thisMothStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', thisMothEnd.toISOString()),
            ],
        );

        const lastMouthAssignedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.equal('assigneeId', member.$id),
                Query.greaterThanEqual(
                    '$createdAt',
                    lastMonthStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
            ],
        );

        const assignedTaskCount = thisMouthAssignedTasks.total;
        const assignedTaskDifference =
            assignedTaskCount - lastMouthAssignedTasks.total;

        const thisMouthIncompleteTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.notEqual('status', TaskStatus.DONE),
                Query.greaterThanEqual(
                    '$createdAt',
                    thisMothStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', thisMothEnd.toISOString()),
            ],
        );

        const lastMouthIncompleteTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.notEqual('status', TaskStatus.DONE),
                Query.greaterThanEqual(
                    '$createdAt',
                    lastMonthStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
            ],
        );

        const incompleteTaskCount = thisMouthIncompleteTasks.total;
        const incompleteTaskDifference =
            incompleteTaskCount - lastMouthIncompleteTasks.total;

        const thisMouthCompletedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.equal('status', TaskStatus.DONE),
                Query.greaterThanEqual(
                    '$createdAt',
                    thisMothStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', thisMothEnd.toISOString()),
            ],
        );

        const lastMouthCompletedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.equal('status', TaskStatus.DONE),
                Query.greaterThanEqual(
                    '$createdAt',
                    lastMonthStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
            ],
        );

        const completedTaskCount = thisMouthCompletedTasks.total;
        const completedTaskDifference =
            completedTaskCount - lastMouthCompletedTasks.total;

        const thisMouthOverdueTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.notEqual('status', TaskStatus.DONE),
                Query.lessThan('dueDate', now.toISOString()),
                Query.greaterThanEqual(
                    '$createdAt',
                    thisMothStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', thisMothEnd.toISOString()),
            ],
        );

        const lastMouthOverdueTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal('workspaceId', workspaceId),
                Query.notEqual('status', TaskStatus.DONE),
                Query.lessThan('dueDate', now.toISOString()),
                Query.greaterThanEqual(
                    '$createdAt',
                    lastMonthStart.toISOString(),
                ),
                Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
            ],
        );

        const overdueTaskCount = thisMouthOverdueTasks.total;
        const overdueTaskDifference =
            overdueTaskCount - lastMouthOverdueTasks.total;

        return ctx.json({
            data: {
                taskCount,
                taskDifference,
                assignedTaskCount,
                assignedTaskDifference,
                incompleteTaskCount,
                incompleteTaskDifference,
                completedTaskCount,
                completedTaskDifference,
                overdueTaskCount,
                overdueTaskDifference,
            },
        });
    })
    .post(
        '/',
        sessionMiddleware,
        zValidator('form', createWorkspaceSchema),
        async ctx => {
            const databases = ctx.get('databases');
            const storage = ctx.get('storage');
            const user = ctx.get('user');

            const { name, image } = ctx.req.valid('form');

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image,
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );

                uploadedImageUrl = `data:image/pgn;base64,${Buffer.from(
                    arrayBuffer,
                ).toString('base64')}`;
            }

            const workspace = await databases.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadedImageUrl,
                    inviteCode: generateInviteCode(10),
                },
            );

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN,
                },
            );

            return ctx.json({ data: workspace });
        },
    )
    .patch(
        '/:workspaceId',
        sessionMiddleware,
        zValidator('form', updateWorkspaceSchema),
        async ctx => {
            const databases = ctx.get('databases');
            const storage = ctx.get('storage');
            const user = ctx.get('user');

            const { workspaceId } = ctx.req.param();
            const { name, image } = ctx.req.valid('form');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image,
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );

                uploadedImageUrl = `data:image/pgn;base64,${Buffer.from(
                    arrayBuffer,
                ).toString('base64')}`;
            } else {
                uploadedImageUrl = image; // Assuming it's a valid URL
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadedImageUrl,
                },
            );

            return ctx.json({ data: workspace });
        },
    )
    .delete('/:workspaceId', sessionMiddleware, async ctx => {
        const databases = ctx.get('databases');
        const user = ctx.get('user');

        const { workspaceId } = ctx.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member || member.role !== MemberRole.ADMIN) {
            return ctx.json({ error: 'Unauthorized' }, 401);
        }

        const tasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal('workspaceId', workspaceId),
        ]);

        for (const task of tasks.documents) {
            await databases.deleteDocument(DATABASE_ID, TASKS_ID, task.$id);
        }

        const projects = await databases.listDocuments(
            DATABASE_ID,
            PROJECTS_ID,
            [Query.equal('workspaceId', workspaceId)],
        );

        for (const project of projects.documents) {
            await databases.deleteDocument(
                DATABASE_ID,
                PROJECTS_ID,
                project.$id,
            );
        }

        const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
            Query.equal('workspaceId', workspaceId),
        ]);

        for (const member of members.documents) {
            await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, member.$id);
        }

        await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

        return ctx.json({ data: { $id: workspaceId } });
    })
    .post('/:workspaceId/reset-invite-code', sessionMiddleware, async ctx => {
        const databases = ctx.get('databases');
        const user = ctx.get('user');

        const { workspaceId } = ctx.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member || member.role !== MemberRole.ADMIN) {
            return ctx.json({ error: 'Unauthorized' }, 403);
        }

        const workspace = await databases.updateDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
            {
                inviteCode: generateInviteCode(10),
            },
        );

        return ctx.json({ data: workspace });
    })
    .post(
        '/:workspaceId/join',
        sessionMiddleware,
        zValidator('json', z.object({ code: z.string() })),
        async ctx => {
            const { workspaceId } = ctx.req.param();
            const { code } = ctx.req.valid('json');

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (member) {
                return ctx.json({ error: 'Already a member' }, 400);
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
            );

            if (workspace.inviteCode !== code) {
                return ctx.json({ error: 'Invalid invite code' }, 400);
            }

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMBER,
                },
            );

            return ctx.json({ data: workspace });
        },
    );

export default app;
