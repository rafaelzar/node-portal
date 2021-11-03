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
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
}).single('photo');
