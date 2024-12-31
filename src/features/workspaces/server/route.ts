import { Hono } from 'hono';
import { ID } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { DATABASE_ID, IMAGES_BUCKET_ID, WORKSPACES_ID } from '@/config';

import { sessionMiddleware } from '@/lib/session-middleware';

import { createWorkspaceSchema } from '../schemas';

const app = new Hono().post(
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
            },
        );

        return ctx.json(workspace);
    },
);

export default app;
