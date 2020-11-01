'use strict';
// import productList from "./productList.json";
const productList = require('./productList.json')

module.exports.getProductsById = async event => {
  const {productId} = event.pathParameters,
    product = productList.find(p => p.id === productId);

  if (!product) {
    return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            error: `Product with id ${productId} has not been found)`
        })
    };
  }
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(product)
  };
};
