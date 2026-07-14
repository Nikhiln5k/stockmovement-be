import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swaggerDocument';

/**
 * Mounts the API documentation UI at /api-docs.
 */
export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Stock Movement API Docs',
  }));
};
