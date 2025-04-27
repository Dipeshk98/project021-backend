import { Router } from 'express';
import { uploadDocument } from '../controllers/uploadController';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/upload', upload.single('file'), uploadDocument);

export default router;
