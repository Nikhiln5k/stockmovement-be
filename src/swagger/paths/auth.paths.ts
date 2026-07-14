import { badRequest, wrapper, schemas, thrownErrorResponse } from '../definitions';

const authResult = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    user: schemas.User,
  },
};

export const authPaths = {
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Create a new account',
      description:
        'Sign up as either an "admin" (can create products/stores and move stock) ' +
        'or a "shopper" (read-only access). Returns a JWT you can use straight away.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password', 'role'],
              properties: {
                username: { type: 'string', example: 'john_doe' },
                password: { type: 'string', format: 'password', example: 'john123' },
                role: { type: 'string', enum: ['admin', 'shopper'], example: 'shopper' },
              },
            },
          },
        },
      },
      responses: {
        201: wrapper(authResult, 'User registered successfully'),
        400: badRequest("Username, password and a valid role ('admin' or 'shopper') are required"),
        500: thrownErrorResponse('Something went wrong on the server', 'Internal server error'),
      },
    },
  },

  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Log in',
      description: 'Exchange a username and password for a JWT. Use this token as a Bearer token on every other endpoint.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string', example: 'john_doe' },
                password: { type: 'string', format: 'password', example: 'MyStr0ngPass!' },
              },
            },
          },
        },
      },
      responses: {
        200: wrapper(authResult, 'User logged in successfully'),
        400: badRequest('Username and password are required'),
        401: thrownErrorResponse('Wrong username or password', 'Invalid credentials'),
        500: thrownErrorResponse('Something went wrong', 'Internal server error'),
      },
    },
  },
};
