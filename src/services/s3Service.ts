import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION, 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export const uploadFileToS3 = async (fileBuffer: Buffer, folderNumber: string, fileName: string) => {
  const key = `${folderNumber}/${uuidv4()}-${fileName}`; // create unique filename inside folder

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg', // or dynamic based on file
  };

  await s3.upload(uploadParams).promise();

  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`; // public URL
};
