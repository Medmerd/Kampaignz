import express from 'express';
import cors from 'cors';

import { campaignsRouter } from './routes/campaigns';
import { missionsRouter } from './routes/missions';
import { sessionsRouter } from './routes/sessions';
import { playersRouter } from './routes/players';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/campaigns', campaignsRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/players', playersRouter);

// Error handler must be the last middleware
app.use(errorHandler);

export { app };
