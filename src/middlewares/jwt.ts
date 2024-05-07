import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

if (!process.env.REFRESH_JWT_SECRET) {
  throw new Error('REFRESH_JWT_SECRET is not set');
}

const secret = process.env.JWT_SECRET;
const refreshSecret = process.env.REFRESH_JWT_SECRET;

interface JWTPayload {
  id: number;
}

const prisma = new PrismaClient();

export const validateJwt = createTokenValidator(secret);
export const validateRefreshJwt = createTokenValidator(refreshSecret);

function createTokenValidator(secret: string): RequestHandler {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).send({ message: 'Unauthorized' });

    jwt.verify(
      token,
      secret,
      { complete: true },
      async (err, decoded): Promise<void> => {
        if (err || !decoded) {
          res.status(403).send({ message: 'Forbidden: invalid token' });
          return;
        }

        const { id } = decoded.payload as JWTPayload;
        req.userId = id;

        const keyId = decoded.header.kid;
        if (!keyId) {
          res.status(401).send({ message: 'Unauthorized' });
          return;
        }
        req.keyId = keyId;

        const isRevoked = await prisma.revokedToken.findFirst({
          where: {
            tokenId: keyId,
            userId: id,
          },
        });

        if (isRevoked) {
          res.status(403).send({ message: 'Forbidden: token is revoked' });
          return;
        }

        next();
      }
    );
  };
}

export function createTokens(payload: JWTPayload) {
  const keyId = Date.now().toString();

  return {
    accessToken: createJwt(payload, keyId),
    refreshToken: createRefreshJwt(payload, keyId),
  };
}

function createJwt(payload: JWTPayload, keyid: string): string {
  return jwt.sign(payload, secret, { expiresIn: '10m', keyid });
}

function createRefreshJwt(payload: JWTPayload, keyid: string): string {
  return jwt.sign(payload, refreshSecret, { expiresIn: '1d', keyid });
}
