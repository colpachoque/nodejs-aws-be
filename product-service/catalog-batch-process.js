import {Client} from 'pg';
import AWS from 'aws-sdk';

const {PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD, SNS_URL} = process.env,
  dbOptions = {
    host: PG_HOST || 'localhost', 
    port: PG_PORT || 5432,
    database: PG_DATABASE,
    user: PG_USERNAME || 'postgres',
    password: PG_PASSWORD,
    ssl:{
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
  };

export const catalogBatchProcess = async (event, context, callback) => {
	const products = event.Records.map(({ body }) => JSON.parse(body)),
		client = new Client(dbOptions),
		sns = new AWS.SNS({ region: 'eu-west-1'})

	console.log(products);

	try {
		await client.connect();
		await client.query('BEGIN');

		for (const product of products) {
			const res_product = await client.query('INSERT INTO products (title, description, price) values($1, $2, $3) RETURNING product_id;',
				[product.title, product.description, product.price]),
			product_id = res_product.rows[0].product_id,
			res_stocks = await client.query('INSERT INTO stocks (product_id, count) values($1, $2);',
				[product_id, parseInt(product.count)]);

			console.log(`Created product ${res_product.rows}, created stocks ${res_stocks}`);
		}

		await client.query('COMMIT');

		sns.publish({
			Subject: 'Products from uploaded file were created in the database',
			Message: 'Hi! There were new products created from csv file. Take a look!',
			TopicArn: SNS_URL
		}, () => {
			console.log('Email was sent to me');
		});
	} catch (err) {
		console.log('Error creating items in table', err);
		await client.query('ROLLBACK');

		throw err;
	} finally {
		await client.end();
	}
};
