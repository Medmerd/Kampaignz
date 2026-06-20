import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If the error message indicates a validation issue, return 400
  if (err instanceof Error && (
    err.message.includes('is required') || 
    err.message.includes('original campaign') ||
    err.message.includes('attached to exactly one') ||
    err.message.includes('Only campaign rules can be assigned') ||
    err.message.includes('Limit Exceeded') ||
    err.message.includes('do not belong to this campaign')
  )) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof Error && err.message.includes('not found')) {
    return res.status(404).json({ error: err.message });
  }

  // Default to 500 for unhandled errors
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
};
