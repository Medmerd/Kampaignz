import express from 'express';
import cors from 'cors';

import { campaignsRouter } from './routes/campaigns';

import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/campaigns', campaignsRouter);

// Error handler must be the last middleware
app.use(errorHandler);

export { app };
