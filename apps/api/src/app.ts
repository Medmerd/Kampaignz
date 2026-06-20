import express from 'express';
import cors from 'cors';

import { campaignsRouter } from './routes/campaigns';
import { missionsRouter } from './routes/missions';
import { sessionsRouter } from './routes/sessions';
import { playersRouter } from './routes/players';
import { armyRulebooksRouter } from './routes/army-rulebooks';
import { rulesRouter } from './routes/rules';
import { playerRulesRouter } from './routes/player-rules';
import { messagesRouter } from './routes/messages';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/campaigns', campaignsRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/players', playersRouter);
app.use('/api/army-rulebooks', armyRulebooksRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/player-rules', playerRulesRouter);
app.use('/api/messages', messagesRouter);

// Error handler must be the last middleware
app.use(errorHandler);

export { app };
