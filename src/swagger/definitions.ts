
export const wrapper = (dataSchema: object, description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          status: { type: 'integer', example: 200 },
          message: { type: 'string', example: description },
          data: dataSchema,
        },
      },
    },
  },
});

// error response
export const thrownErrorResponse = (description: string, example: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example },
        },
      },
    },
  },
});

export const badRequest = (example: string) =>
  wrapper({ type: 'array', items: {}, example: [] }, example);

export const notFound = (example: string) =>
  wrapper({ type: 'array', items: {}, example: [] }, example);

export const unauthorized = wrapper(
  { type: 'array', items: {}, example: [] },
  'Not authorized'
);

export const forbidden = wrapper(
  { type: 'array', items: {}, example: [] },
  'Access denied: Admin role required'
);

export const serverError = wrapper(
  { type: 'array', items: {}, example: [] },
  'Internal server error'
);

// ---------------------------------------------------------------------------
// Data models
// Written the way the API actually returns them (Mongo documents, with
// "_id" and timestamps).
// ---------------------------------------------------------------------------
export const schemas = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '665f1a2b8c9d4e0012a3b456' },
      username: { type: 'string', example: 'john_doe' },
      role: { type: 'string', enum: ['admin', 'shopper'], example: 'admin' },
    },
  },

  Product: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '665f1a2b8c9d4e0012a3b111' },
      name: { type: 'string', example: 'Wireless Mouse' },
      sku: { type: 'string', example: 'WM-1001' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  Store: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '665f1a2b8c9d4e0012a3b222' },
      name: { type: 'string', example: 'Downtown Warehouse' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  Stock: {
    type: 'object',
    description: 'Stock keeps track of how many units of a product sit in a store.',
    properties: {
      _id: { type: 'string', example: '665f1a2b8c9d4e0012a3b333' },
      product: {
        oneOf: [
          { type: 'string', example: '665f1a2b8c9d4e0012a3b111' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string', example: 'Wireless Mouse' },
              sku: { type: 'string', example: 'WM-1001' },
            },
          },
        ],
      },
      store: {
        oneOf: [
          { type: 'string', example: '665f1a2b8c9d4e0012a3b222' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string', example: 'Downtown Warehouse' },
            },
          },
        ],
      },
      quantity: { type: 'integer', example: 42 },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
