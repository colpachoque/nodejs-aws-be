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

export const getProductsList = async event => {
  const client = new Client(dbOptions);
  await client.connect();

  console.log('In get all products request');

  try {
    const result = await client.query(`select products.*, stocks.count
      from products left join stocks on products.product_id = stocks.product_id;`),
      data = [...result.rows];

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(data)
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
