import { Hono } from 'hono';
import { ID } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { DATABASE_ID, WORKSPACES_ID } from '@/config';

import { sessionMiddleware } from '@/lib/session-middleware';

import { createWorkspaceSchema } from '../schemas';

const app = new Hono().post(
    '/',
    zValidator('json', createWorkspaceSchema),
    sessionMiddleware,
    async ctx => {
        const databases = ctx.get('databases');
        const user = ctx.get('user');

        const { name } = ctx.req.valid('json');

        const workspace = await databases.createDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            ID.unique(),
            {
                name,
                userId: user.$id,
            },
        );

        return ctx.json({ data: workspace });
    },
);

export default app;
