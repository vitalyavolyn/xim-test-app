import express from 'express';
import { PrismaClient } from '@prisma/client';

export const logoutRouter = express.Router();
const prisma = new PrismaClient();

logoutRouter.get('/', async (req, res) => {
  await prisma.revokedToken.create({
    data: {
      tokenId: req.keyId,
      userId: req.userId,
    },
  });

  res.status(200).json({ success: true });
});
