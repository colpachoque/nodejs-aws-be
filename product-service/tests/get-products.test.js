
'use strict';

import * as getProductsList from './../get-products';
import jestPlugin from 'serverless-jest-plugin';

const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(getProductsList, { handler: 'getProductsList' });

describe('Get all products', () => {
    beforeAll(async() => {
    });

    it('default run', async() => {
        const event = {},
            response = await wrapped.run(event);
        expect(response).toBeDefined();
    });
});