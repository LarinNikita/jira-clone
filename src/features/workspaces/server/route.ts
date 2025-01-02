import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import {
    DATABASE_ID,
    IMAGES_BUCKET_ID,
    MEMBERS_ID,
    WORKSPACES_ID,
} from '@/config';

import { MemberRole } from '@/features/members/types';

import { generateInviteCode } from '@/lib/utils';
import { sessionMiddleware } from '@/lib/session-middleware';

import { createWorkspaceSchema } from '../schemas';

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
        zValidator('form', createWorkspaceSchema),
        sessionMiddleware,
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
    );

export default app;