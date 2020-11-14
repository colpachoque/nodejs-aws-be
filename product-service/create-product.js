import {Client} from 'pg';

const {PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD} = process.env,
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

export const createProduct = async event => {
    const client = new Client(dbOptions);

    await client.connect();

    try {
        const {title, description, price, count} = JSON.parse(event.body);
        
        console.log('In create new product request');
        console.log(title, description, price, count);
        
        await client.query('BEGIN')
        const res_product = await client.query('INSERT INTO products (title, description, price) values($1, $2, $3) RETURNING product_id;',
                [title, description, price]),
            product_id = res_product.rows[0].product_id,
            res_stocks = await client.query('INSERT INTO stocks (product_id, count) values($1, $2);',
                [product_id, parseInt(count)]);

        await client.query('COMMIT')

        if (!res_stocks || res_stocks.rowCount < 1) {
            throw new Error('Something went wrong');
        }

        return {
            statusCode: 201,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(product_id)
        };
    } catch (e) {
        await client.query('ROLLBACK')
        return {
            statusCode: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(e.message)
        };
    } finally {
        await client.end();
    }
};
