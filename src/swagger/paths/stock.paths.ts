import { badRequest, wrapper, forbidden, notFound, schemas, serverError, unauthorized } from '../definitions';

export const stockPaths = {
  '/api/stocks': {
    get: {
      tags: ['Stocks'],
      summary: 'List stock levels',
      description:
        'Returns how many units of each product are sitting in each store. ' +
        'Pass "threshold" to only see stock at or below a certain quantity (handy for a low-stock report).',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'threshold',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 0 },
          description: 'Only return stock rows with quantity less than or equal to this number.',
          example: 5,
        },
      ],
      responses: {
        200: wrapper({ type: 'array', items: schemas.Stock }, 'Stocks retrieved successfully'),
        400: badRequest('Threshold must be a non-negative integer'),
        401: unauthorized,
        500: serverError,
      },
    },
  },

  '/api/stocks/adjust': {
    post: {
      tags: ['Stocks'],
      summary: 'Adjust stock for a product at a store',
      description:
        'Increases or decreases how much of a product is available at a store. ' +
        'Use a positive number to add stock, a negative number to remove stock. Admins only. ' +
        'You cannot remove more stock than currently exists.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['productId', 'storeId', 'quantityChange'],
              properties: {
                productId: { type: 'string', example: '665f1a2b8c9d4e0012a3b111' },
                storeId: { type: 'string', example: '665f1a2b8c9d4e0012a3b222' },
                quantityChange: {
                  type: 'integer',
                  example: 10,
                  description: 'Positive to add stock, negative to remove stock.',
                },
              },
            },
          },
        },
      },
      responses: {
        200: wrapper(schemas.Stock, 'Stock adjusted successfully'),
        400: badRequest(
          'Insufficient stock. Cannot decrease stock by 10 when current stock is lower or does not exist.'
        ),
        401: unauthorized,
        403: forbidden,
        404: notFound('Product not found'),
        500: serverError,
      },
    },
  },

  '/api/stocks/transfer': {
    post: {
      tags: ['Stocks'],
      summary: 'Move stock between two stores',
      description:
        'Moves a quantity of a product from one store to another in a single, safe operation. ' +
        "If the source store doesn't have enough stock, nothing is moved. Admins only.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['productId', 'sourceStoreId', 'targetStoreId', 'quantity'],
              properties: {
                productId: { type: 'string', example: '665f1a2b8c9d4e0012a3b111' },
                sourceStoreId: { type: 'string', example: '665f1a2b8c9d4e0012a3b222' },
                targetStoreId: { type: 'string', example: '665f1a2b8c9d4e0012a3b333' },
                quantity: { type: 'integer', minimum: 1, example: 5 },
              },
            },
          },
        },
      },
      responses: {
        200: wrapper(
          {
            type: 'object',
            properties: {
              source: schemas.Stock,
              target: schemas.Stock,
            },
          },
          'Stock transfer completed successfully'
        ),
        400: badRequest('Insufficient stock at source store. Available: 2, Required: 5'),
        401: unauthorized,
        403: forbidden,
        404: notFound('Source store not found'),
        500: serverError,
      },
    },
  },
};
