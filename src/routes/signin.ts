import { PrismaClient } from '@prisma/client';
import express from 'express';
import { AllowedSchema } from 'express-json-validator-middleware';
import bcrypt from 'bcrypt';

import { validate } from '../middlewares/validate';
import { createTokens, validateRefreshJwt } from '../middlewares/jwt';

export const signinRouter = express.Router();
const prisma = new PrismaClient();

const signinBodySchema: AllowedSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 6,
    },
  },
  required: ['id', 'password'],
};

signinRouter.post(
  '/',
  validate({ body: signinBodySchema }),
  async (req, res) => {
    const { id, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        identifier: id,
      },
    });

    if (!user) {
      res.status(401).json({
        message: 'User not found',
      });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      res.status(401).json({
        message: 'Invalid password',
      });
      return;
    }

    const { accessToken, refreshToken } = createTokens({ id: user.id });

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  }
);

signinRouter.post('/new_token', validateRefreshJwt, async (req, res) => {
  const { accessToken, refreshToken } = createTokens({ id: req.userId });

  res.status(200).json({
    accessToken,
    refreshToken,
  });
});
