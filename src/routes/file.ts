import { PrismaClient } from '@prisma/client';
import express from 'express';
import { upload } from '../middlewares/storage';
import { unlink } from 'fs/promises';

export const fileRouter = express.Router();
const prisma = new PrismaClient();

fileRouter.get('/list', async (req, res) => {
  let listSize = Number(req.query.listSize);
  if (Number.isNaN(listSize)) listSize = 10;

  let page = Number(req.query.page);
  if (Number.isNaN(page)) page = 1;

  const files = await prisma.file.findMany({
    where: {
      userId: req.userId,
    },
    select: {
      id: true,
      name: true,
      mimetype: true,
      size: true,
      extension: true,
      createdAt: true,
    },
    take: listSize,
    skip: (page - 1) * listSize,
  });

  res.json(files);
});

fileRouter.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file provided' });
    return;
  }

  await prisma.file.create({
    data: {
      userId: req.userId,
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      extension: req.file.originalname?.split('.').pop() || '',
      path: req.file.path,
    },
  });

  res.json({ success: true });
});

fileRouter.delete('/delete/:id', async (req, res) => {
  const id = Number(req.params.id);

  const file = await prisma.file.findUnique({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!file) {
    res.status(404).json({ message: 'File not found' });
    return;
  }

  await unlink(file.path);

  await prisma.file.delete({
    where: {
      id,
    },
  });

  res.json({ success: true });
});

fileRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const file = await prisma.file.findUnique({
    where: {
      id,
      userId: req.userId,
    },
    select: {
      id: true,
      name: true,
      mimetype: true,
      size: true,
      extension: true,
      createdAt: true,
    },
  });

  if (!file) {
    res.status(404).json({ message: 'File not found' });
    return;
  }

  res.json(file);
});

fileRouter.get('/download/:id', async (req, res) => {
  const id = Number(req.params.id);

  const file = await prisma.file.findUnique({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!file) {
    res.status(404).json({ message: 'File not found' });
    return;
  }

  res.download(file.path);
});

fileRouter.put('/update/:id', upload.single('file'), async (req, res) => {
  const id = Number(req.params.id);

  if (!req.file) {
    res.status(400).json({ message: 'No file provided' });
    return;
  }

  const file = await prisma.file.findUnique({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!file) {
    res.status(404).json({ message: 'File not found' });
    return;
  }

  await prisma.file.update({
    where: {
      id,
    },
    data: {
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      extension: req.file.originalname?.split('.').at(-1) || '',
      path: req.file.path,
    },
  });

  res.json({ success: true });
});
