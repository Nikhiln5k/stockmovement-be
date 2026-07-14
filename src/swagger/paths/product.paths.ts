import { badRequest, wrapper, forbidden, schemas, serverError, unauthorized } from '../definitions';

export const productPaths = {
  '/api/products': {
    get: {
      tags: ['Products'],
      summary: 'List all products',
      description: 'Returns every product, sorted alphabetically by name. You just need to be logged in to see this.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: wrapper({ type: 'array', items: schemas.Product }, 'Products retrieved successfully'),
        401: unauthorized,
        500: serverError,
      },
    },
    post: {
      tags: ['Products'],
      summary: 'Create a product',
      description: 'Adds a new product to the catalogue. Admins only. The SKU must be unique and is stored uppercased.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'sku'],
              properties: {
                name: { type: 'string', example: 'Wireless Mouse' },
                sku: { type: 'string', example: 'WM-1001' },
              },
            },
          },
        },
      },
      responses: {
        201: wrapper(schemas.Product, 'Product created successfully'),
        400: badRequest("Product with SKU 'WM-1001' already exists"),
        401: unauthorized,
        403: forbidden,
        500: serverError,
      },
    },
  },
};
