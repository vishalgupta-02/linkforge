import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    files: 1,
    fileSize: 2 * 1024 * 1024,
  },
});
