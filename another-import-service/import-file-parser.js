import AWS from 'aws-sdk';
import csv from 'csv-parser';

import config from './config.js';

const s3 = new AWS.S3({ region: config.aws.region });

export const importSecondFileParser = async event => {
    console.log('In import second file parser')
    for (const record of event.Records) {
        console.log(record.s3.object.key);
        await new Promise ((res, rej) => {
            s3.getObject({
            Bucket: config.aws.s3.bucket,
            Key: record.s3.object.key
        }).createReadStream()
            .on('error', e => {
                console.log(e);
                rej(e);
            })
            .pipe(csv())
            .on('error', e => {
                console.log(e);
                rej(e);
            })
            .on('data', data => console.log(data))
            .on('end', async () => {
                console.log(`Copy from ${config.aws.s3.bucket}/${record.s3.object.key}`);

                await s3.copyObject({
                    Bucket: config.aws.s3.bucket,
                    CopySource: `${config.aws.s3.bucket}/${record.s3.object.key}`,
                    Key: record.s3.object.key.replace(config.aws.s3.uploadFolderName, config.aws.s3.parsedFolderName)
                }).promise();

                console.log(`Copied to ${config.aws.s3.bucket}/${config.aws.s3.parsedFolderName}`);

                res();
            });
        });
    }
};