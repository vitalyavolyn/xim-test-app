import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import { join } from 'path';

const uploadsDir = join(__dirname, '..', '..', '/uploads');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix =
      Date.now().toString() + Math.floor(Math.random() * 100000);
    cb(null, uniquePrefix + '-' + file.originalname);
  },
});

export const upload = multer({ storage });
