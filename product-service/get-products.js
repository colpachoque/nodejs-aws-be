'use strict';
// import productList from "./productList.json";
const productList = require('./productList.json');

module.exports.getProductsList = async event => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(productList)
  };
};
