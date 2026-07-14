import { badRequest, wrapper, forbidden, schemas, serverError, unauthorized } from '../definitions';

export const storePaths = {
  '/api/stores': {
    get: {
      tags: ['Stores'],
      summary: 'List all stores',
      description: 'Returns every store, sorted alphabetically by name. You just need to be logged in to see this.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: wrapper({ type: 'array', items: schemas.Store }, 'Stores retrieved successfully'),
        401: unauthorized,
        500: serverError,
      },
    },
    post: {
      tags: ['Stores'],
      summary: 'Create a store',
      description: 'Adds a new store/warehouse location. Admins only. Store names must be unique.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'Downtown Warehouse' },
              },
            },
          },
        },
      },
      responses: {
        201: wrapper(schemas.Store, 'Store created successfully'),
        400: badRequest("Store with name 'Downtown Warehouse' already exists"),
        401: unauthorized,
        403: forbidden,
        500: serverError,
      },
    },
  },
};
