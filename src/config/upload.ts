import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const tmpPath = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpPath,

  storage: multer.diskStorage({
    destination: tmpPath,
    filename: (_, file, callback) => {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const filename = `${fileHash}-${file.originalname}`;

      return callback(null, filename);
    },
  }),
};
