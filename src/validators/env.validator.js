import z from 'zod';

const portSchema = z.coerce.number().int().min(1).max(65535).default(3000);
const { success, data, error } = portSchema.safeParse(process.env.PORT);

export const PORT = success ? data : 3000;
