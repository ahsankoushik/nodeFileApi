// prisma singleton implementation 
import { PrismaClient } from '@prisma/client';
import {  NODE_ENV } from "./env.js"

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

// to stop initialztio when using hot realoding
if (NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
