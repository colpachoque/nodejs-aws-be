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

export const getProductsById = async event => {
  const {productId} = event.pathParameters,
    client = new Client(dbOptions);
  
  console.log('In cget product by id request');
  console.log('product id: ', productId);

  await client.connect();

  try {
    const {rows} = await client.query('select products.*, stocks.count ' +
      'from products join stocks on products.product_id = stocks.product_id ' +
      `where products.product_id=$1`, [productId]);

    if (!rows || !rows.length) {
        return {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: `Product with id ${productId} was not found`
            })
        };
    }
    const product = rows[0];

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(product)
    };
  } catch (e) {
    return {
      statusCode: 500,
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


