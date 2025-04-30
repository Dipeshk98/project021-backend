import multer from 'multer';

const storage = multer.memoryStorage(); // we will upload directly from memory

export const upload = multer({ storage });
