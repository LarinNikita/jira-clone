import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from '@/config';

import { getMember } from '@/features/members/utils';

import { sessionMiddleware } from '@/lib/session-middleware';

import { createProjectSchema } from '../schemas';

const app = new Hono()
    .get(
        '/',
        sessionMiddleware,
        zValidator('query', z.object({ workspaceId: z.string() })),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { workspaceId } = ctx.req.valid('query');

            if (!workspaceId) {
                return ctx.json({ error: 'Missing workspaceId' }, 400);
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const projects = await databases.listDocuments(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal('workspaceId', workspaceId),
                    Query.orderDesc('$createdAt'),
                ],
            );

            return ctx.json({ data: projects });
        },
    )
    .post(
        '/',
        sessionMiddleware,
        zValidator('form', createProjectSchema),
        async ctx => {
            const databases = ctx.get('databases');
            const storage = ctx.get('storage');
            const user = ctx.get('user');

            const { name, image, workspaceId } = ctx.req.valid('form');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
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
            }

            const project = await databases.createDocument(
                DATABASE_ID,
                PROJECTS_ID,
                ID.unique(),
                {
                    name,
                    imageUrl: uploadedImageUrl,
                    workspaceId,
                },
            );

            return ctx.json({ data: project });
        },
    )
    .patch('/', async ctx => {})
    .delete('/', async ctx => {});

export default app;
