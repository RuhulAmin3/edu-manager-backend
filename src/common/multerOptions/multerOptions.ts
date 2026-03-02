import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
  fileFilter: (req, file, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },

  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = process.env.UPLOAD_PATH;

      if (!existsSync(uploadPath)) {
        //existsSync will check the upload path available or not
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
};
