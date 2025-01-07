import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from '@/config';

import { getMember } from '@/features/members/utils';

import { sessionMiddleware } from '@/lib/session-middleware';

import { createProjectSchema, updateProjectSchema } from '../schemas';
import { Project } from '../types';

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
    .get('/:projectId', sessionMiddleware, async ctx => {
        const user = ctx.get('user');
        const databases = ctx.get('databases');

        const { projectId } = ctx.req.param();

        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
        );

        const member = await getMember({
            databases,
            workspaceId: project.workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return ctx.json({ error: 'Unauthorized' }, 401);
        }

        return ctx.json({ data: project });
    })
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
    .patch(
        '/:projectId',
        sessionMiddleware,
        zValidator('form', updateProjectSchema),
        async ctx => {
            const databases = ctx.get('databases');
            const storage = ctx.get('storage');
            const user = ctx.get('user');

            const { projectId } = ctx.req.param();
            const { name, image } = ctx.req.valid('form');

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            );

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
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
            } else {
                uploadedImageUrl = image; // Assuming it's a valid URL
            }

            const project = await databases.updateDocument(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
                {
                    name,
                    imageUrl: uploadedImageUrl,
                },
            );

            return ctx.json({ data: project });
        },
    )
    .delete('/:projectId', sessionMiddleware, async ctx => {
        const databases = ctx.get('databases');
        const user = ctx.get('user');

        const { projectId } = ctx.req.param();

        const existingProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
        );

        const member = await getMember({
            databases,
            workspaceId: existingProject.workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return ctx.json({ error: 'Unauthorized' }, 401);
        }

        //TODO Delete tasks

        await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);

        return ctx.json({ data: { $id: existingProject.$id } });
    });

export default app;
