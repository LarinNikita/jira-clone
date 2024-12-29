import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { loginSchema, registerSchema } from '../schemas';

const app = new Hono()
    .post('/login', zValidator('json', loginSchema), async ctx => {
        const { email, password } = ctx.req.valid('json');

        console.log({ email, password });

        return ctx.json({ email, password });
    })
    .post('/register', zValidator('json', registerSchema), async ctx => {
        const { name, email, password } = ctx.req.valid('json');

        console.log({ name, email, password });

        return ctx.json({ name, email, password });
    });

export default app;
