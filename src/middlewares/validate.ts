import { Validator } from 'express-json-validator-middleware';

const validator = new Validator({});

export const validate = validator.validate;
