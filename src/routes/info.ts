import express from 'express';

export const infoRouter = express.Router();

infoRouter.get('/', async (req, res) => {
  res.json({ userId: req.userId });
});
