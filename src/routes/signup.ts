import { PrismaClient, User } from '@prisma/client';
import express from 'express';
import { AllowedSchema } from 'express-json-validator-middleware';
import bcrypt from 'bcrypt';

import { validate } from '../middlewares/validate';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { createTokens } from '../middlewares/jwt';

export const signupRouter = express.Router();
const prisma = new PrismaClient();

const signupBodySchema: AllowedSchema = {
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

signupRouter.post(
  '/',
  validate({ body: signupBodySchema }),
  async (req, res) => {
    const { id, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    let user: User | undefined;
    try {
      user = await prisma.user.create({
        data: {
          identifier: id,
          passwordHash,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        res.status(400).json({
          message: 'User already exists',
        });
        return;
      } else {
        throw error;
      }
    }

    const { accessToken, refreshToken } = createTokens({ id: user.id });

    res.status(201).json({
      accessToken,
      refreshToken,
    });
  }
);
