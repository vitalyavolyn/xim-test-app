import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ValidationError } from 'express-json-validator-middleware';

import { validateJwt } from './middlewares/jwt';
import {
  fileRouter,
  signinRouter,
  signupRouter,
  infoRouter,
  logoutRouter,
} from './routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.use('/file', validateJwt, fileRouter);
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/info', validateJwt, infoRouter);
app.use('/logout', validateJwt, logoutRouter);

app.use(
  (
    error: Error,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ): void => {
    if (error instanceof ValidationError) {
      response.status(400).send(error.validationErrors);
      next();
    } else {
      response.status(500).json({
        message: 'Unknown error',
      });
      console.error(error);
      next();
    }
  }
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
