import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clear tokens revoked more than a day ago,
// since tokens can't live longer than that
export const clearRevokedTokens = async () => {
  const dayAgo = Date.now() - 1000 * 60 * 60 * 24;

  const { count } = await prisma.revokedToken.deleteMany({
    where: {
      createdAt: {
        lt: new Date(dayAgo),
      },
    },
  });

  console.log(
    `[clear-revoked-tokens]: Deleted ${count} old tokens from blacklist`
  );
};
