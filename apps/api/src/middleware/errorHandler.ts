import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If the error message indicates a validation issue, return 400
  if (err instanceof Error && err.message.includes('is required')) {
    return res.status(400).json({ error: err.message });
  }

  // Default to 500 for unhandled errors
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
};
