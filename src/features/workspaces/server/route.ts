import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import {
    DATABASE_ID,
    IMAGES_BUCKET_ID,
    MEMBERS_ID,
    WORKSPACES_ID,
} from '@/config';

import { getMember } from '@/features/members/utils';
import { MemberRole } from '@/features/members/types';

import { generateInviteCode } from '@/lib/utils';
import { sessionMiddleware } from '@/lib/session-middleware';

import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { z } from 'zod';
import { Workspace } from '../types';

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
                return ctx.json({ error: 'Unauthorized' }, 403);
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
            return ctx.json({ error: 'Unauthorized' }, 403);
        }

        // TODO Delete members, projects and tasks

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
