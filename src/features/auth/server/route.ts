import { Hono } from 'hono';
import { ID } from 'node-appwrite';
import { deleteCookie, setCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '@/lib/appwrite';

import { AUTH_COOKIE } from '../constants';
import { loginSchema, registerSchema } from '../schemas';

const app = new Hono()
    .post('/login', zValidator('json', loginSchema), async ctx => {
        const { email, password } = ctx.req.valid('json');

        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(
            email,
            password,
        );

        setCookie(ctx, AUTH_COOKIE, session.secret, {
            path: '/',
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: 'strict',
        });

        return ctx.json({ success: true });
    })
    .post('/register', zValidator('json', registerSchema), async ctx => {
        const { name, email, password } = ctx.req.valid('json');

        const { account } = await createAdminClient();
        await account.create(ID.unique(), email, password, name);

        const session = await account.createEmailPasswordSession(
            email,
            password,
        );

        setCookie(ctx, AUTH_COOKIE, session.secret, {
            path: '/',
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: 'strict',
        });

        return ctx.json({ success: true });
    })
    .post('/logout', async ctx => {
        deleteCookie(ctx, AUTH_COOKIE);

        return ctx.json({ success: true });
    });

export default app;
