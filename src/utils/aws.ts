import AWS from 'aws-sdk';
import fs from 'fs';

AWS.config.update({ region: 'us-east-2' });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const DEFAULT_BUCKET = 'eyerate-public';

export function uploadFileToS3(
  fileName: string,
  filePathOrStream: string | NodeJS.ReadStream,
  bucket: string = DEFAULT_BUCKET,
) {
  return s3
    .upload({
      Bucket: bucket,
      Body: typeof filePathOrStream === 'string' ? fs.createReadStream(filePathOrStream) : filePathOrStream,
      Key: fileName,
    })
    .promise();
}

export function deleteFileFromS3(fileName: string, bucket: string = DEFAULT_BUCKET) {
  return s3
    .deleteObject({
      Bucket: bucket,
      Key: fileName,
    })
    .promise();
}
