
import AWS from 'aws-sdk';
import config from './config.js';

const s3 = new AWS.S3({ region: config.aws.region });

export const importProductsFile = async event => {
  let result;

  try {
    const { name } = event.queryStringParameters;

    const params = {
        Bucket: config.aws.s3.bucket,
        Key: `${config.aws.s3.uploadFolderName}/${name}`,
        Expires: 60,
        ContentType: 'text/csv',
    };

    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    result = {
        statusCode: 200,
        body: JSON.stringify({
            url: signedUrl,
        })
    };
  } catch (err) {
      result = {
          body: JSON.stringify({ message: err.message }),
          statusCode: err.name === 'ValidationError' ? 400 : 500
      }
  }

  return ({
    ...result,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
}