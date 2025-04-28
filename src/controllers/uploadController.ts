import { Request, Response } from 'express';
import { uploadFileToS3 } from '../services/s3Service';
import axios from 'axios';
import FormData from 'form-data';


export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const folderNumber = req.body.number;

    if (!file || !folderNumber) {
      return res.status(400).json({ message: 'File and folder number are required.' });
    }

    // Step 1: Upload file to S3
    const s3Url = await uploadFileToS3(file.buffer, folderNumber, file.originalname);
    console.log('S3 upload successful:', s3Url);

    // Step 2: Create a proper FormData object
    const formData = new FormData();
    
    // Append the file exactly as curl would - this is critical
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    console.log('Sending request to external API...');
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Step 3: Forward to external API using the exact format that works with curl
    try {
      const externalApiResponse = await axios.post(
        'http://DocumentSystemALB-1675435135.us-west-1.elb.amazonaws.com/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'accept': 'application/json'
          },
          // Add timeout and additional debugging
          timeout: 30000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      console.log('External API response:', externalApiResponse.data);
      
      // Step 4: Return combined response
      return res.status(200).json({
        s3Upload: 'File uploaded successfully!',
        // s3Url,
        externalApiResponse: externalApiResponse.data,
      });
    } catch (apiError: any) {
      console.error('External API Error Details:');
      if (apiError.response) {
        // The request was made and the server responded with a status outside 2xx
        console.error('Status:', apiError.response.status);
        console.error('Data:', apiError.response.data);
        console.error('Headers:', apiError.response.headers);
      } else if (apiError.request) {
        // The request was made but no response was received
        console.error('No response received. Request details:', apiError.request);
      } else {
        // Something happened in setting up the request
        console.error('Error message:', apiError.message);
      }
      
      // Return partial success since S3 upload worked
      return res.status(206).json({
        s3Upload: 'File uploaded successfully!',
        s3Url,
        externalApiError: apiError.message || 'External API request failed'
      });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Main error:', error);
      return res.status(500).json({ message: 'Something went wrong.', error: error.message });
    } else {
      console.error('Unknown error:', error);
      return res.status(500).json({ message: 'Something went wrong.' });
    }
  }
};