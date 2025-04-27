import { Request, Response } from 'express';
import { uploadFileToS3 } from '../services/s3Service';
import axios from 'axios'; // for external API call

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const folderNumber = req.body.number;

    if (!file || !folderNumber) {
      return res.status(400).json({ message: 'File and folder number are required.' });
    }

    // Step 1: Upload file to S3
    const s3Url = await uploadFileToS3(file.buffer, folderNumber, file.originalname);

    // Step 2: Forward file to External API (assuming it takes files as form-data)
    const externalApiResponse = await axios.post('https://external-api-url.com/endpoint', file.buffer, {
      headers: {
        'Content-Type': file.mimetype,
      },
    });

    // Step 3: Return combined response
    return res.status(200).json({
      s3Upload: 'File uploaded successfully!',
      s3Url,
      externalApiResponse: externalApiResponse.data,
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ message: 'Something went wrong.', error: error.message });
    } else {
      console.error(error);
      return res.status(500).json({ message: 'Something went wrong.' });
    }
  } 
};
