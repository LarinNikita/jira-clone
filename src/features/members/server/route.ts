import { z } from 'zod';
import { Hono } from 'hono';
import { Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { DATABASE_ID, MEMBERS_ID } from '@/config';

import { createAdminClient } from '@/lib/appwrite';
import { sessionMiddleware } from '@/lib/session-middleware';

import { getMember } from '../utils';
import { Member, MemberRole } from '../types';

const app = new Hono()
    .get(
        '/',
        sessionMiddleware,
        zValidator(
            'query',
            z.object({
                workspaceId: z.string(),
            }),
        ),
        async ctx => {
            const { users } = await createAdminClient();
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const { workspaceId } = ctx.req.valid('query');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const members = await databases.listDocuments<Member>(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal('workspaceId', workspaceId)],
            );

            const populateMembers = await Promise.all(
                members.documents.map(async member => {
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    };
                }),
            );

            return ctx.json({
                data: {
                    ...member,
                    documents: populateMembers,
                    total: members.total,
                },
            });
        },
    )
    .patch(
        '/:memberId',
        sessionMiddleware,
        zValidator(
            'json',
            z.object({
                role: z.nativeEnum(MemberRole),
            }),
        ),
        async ctx => {
            const { memberId } = ctx.req.param();
            const { role } = ctx.req.valid('json');
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const memberToUpdate = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
            );

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal('workspaceId', memberToUpdate.workspaceId)],
            );

            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            if (member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            if (allMembersInWorkspace.total === 1) {
                return ctx.json({ error: 'Cannot downgrade last member' }, 400);
            }

            await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
                role,
            });

            return ctx.json({ data: { $id: memberToUpdate.$id } });
        },
    )
    .delete('/:memberId', sessionMiddleware, async ctx => {
        const { memberId } = ctx.req.param();
        const user = ctx.get('user');
        const databases = ctx.get('databases');

        const memberToDelete = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
        );

        const allMembersInWorkspace = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal('workspaceId', memberToDelete.workspaceId)],
        );

        const member = await getMember({
            databases,
            workspaceId: memberToDelete.workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return ctx.json({ error: 'Unauthorized' }, 401);
        }

        if (
            member.$id !== memberToDelete.$id &&
            member.role !== MemberRole.ADMIN
        ) {
            return ctx.json({ error: 'Unauthorized' }, 401);
        }

        if (allMembersInWorkspace.total === 1) {
            return ctx.json({ error: 'Cannot delete last member' }, 400);
        }

        await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

        return ctx.json({ data: { $id: memberId } });
    });

export default app;
