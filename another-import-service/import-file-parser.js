import AWS from 'aws-sdk';
import csv from 'csv-parser';

import config from './config.js';

const s3 = new AWS.S3({ region: config.aws.region }),
    collectDataForLogging = objKey => {
        return new Promise((res, rej) => {
            const results = [];

            s3.getObject({
                Bucket: config.aws.s3.bucket,
                Key: objKey
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
                .on('data', data => results.push(data))
                .on('end', async () => res(results));
            });
    }

export const importSecondFileParser = async event => {
    console.log('In import second file parser')
    for (const record of event.Records) {
        console.log(record.s3.object.key);

        const data = await collectDataForLogging(record.s3.object.key),
            sqs = new AWS.SQS();


        for (const product of data) {
            try {
                const res = await sqs.sendMessage({
                    QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/517465834650/catalogItemsQueue',
                    MessageBody: JSON.stringify(product)
                }).promise();
        
                console.log(res);
            } catch(e) {
                console.log('error from sqs send msg', e);
            }
        }

        console.log('data ', data);
        
        /* Copy */
        const initialPath = record.s3.object.key;
        console.log(`Copy from ${config.aws.s3.bucket}/${record.s3.object.key}`);
        await s3.copyObject({
            Bucket: config.aws.s3.bucket,
            CopySource: `${config.aws.s3.bucket}/${record.s3.object.key}`,
            Key: record.s3.object.key.replace(config.aws.s3.uploadFolderName, config.aws.s3.parsedFolderName)
        }).promise();
        console.log(`Copied to ${config.aws.s3.bucket}/${config.aws.s3.parsedFolderName}`);

        /* Delete */
        console.log(`Delete from ${config.aws.s3.bucket}/${record.s3.object.key}`);
        await s3.deleteObject({
            Bucket: config.aws.s3.bucket,
            Key: initialPath
        }).promise();
        console.log(`Deleted from uploaded`);
    }
};