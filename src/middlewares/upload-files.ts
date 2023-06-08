import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req: Request, file, cb) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    const ext = path.extname(file.originalname);
    const filename = file.originalname.replace(ext, '');
    cb(null, filename + '-' + Date.now() + ext);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // 유효한 파일 형식인 경우 허용
  } else {
    cb(null, false); // 유효하지 않은 파일 형식인 경우 거부
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export default upload;
