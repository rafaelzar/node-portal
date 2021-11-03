import multer from 'multer';

export const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, 'uploads/photos');
    },
    filename: (_req, _file, cb) => {
      cb(null, Date.now() + '-' + _file.originalname);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
}).single('photo');
