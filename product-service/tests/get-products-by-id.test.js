'use strict';

import * as getProduct from './../get-products-by-id';
import jestPlugin from 'serverless-jest-plugin';

const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(getProduct, { handler: 'getProductsById' });

describe('Get product by id', () => {
    beforeAll(async () => {
    });

    it('just toBeDefined check', async () => {
        const event = {
                pathParameters: {
                    productId: '1234'
                }
            },
            response = await wrapped.run(event);

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(404);
    });

    it('should return 404 status', async () => {
        const event = {
                pathParameters: {
                    productId: '1234'
                }
            },
            response = await wrapped.run(event);

        expect(response.statusCode).toBe(404);
    });

    it('should return status 200 and corresponding product', async () => {
        const event = {
                pathParameters: {
                    productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa'
                }
            },
            response = await wrapped.run(event);

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).title).toBe('SPLAT Biocalcium Toothpaste');
    });
});