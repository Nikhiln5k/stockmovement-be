import { authPaths } from './paths/auth.paths';
import { productPaths } from './paths/product.paths';
import { storePaths } from './paths/store.paths';
import { stockPaths } from './paths/stock.paths';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Stock Movement API',
    version: '1.0.0',
    description:
      'Multi-store stock movement backend. Lets you manage products, stores, ' +
      'and how much stock of each product sits in each store — including moving ' +
      'stock between stores.\n\n' +
      'Most endpoints need you to be logged in. Log in (or register) first, ' +
      'then click "Authorize" above and paste in the token you get back as ' +
      '`Bearer <token>`.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Current server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Register and log in' },
    { name: 'Products', description: 'Manage the product catalogue' },
    { name: 'Stores', description: 'Manage store locations' },
    { name: 'Stocks', description: 'View and move stock between stores' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the token you got from /api/auth/login or /api/auth/register.',
      },
    },
  },
  paths: {
    ...authPaths,
    ...productPaths,
    ...storePaths,
    ...stockPaths,
  },
};
