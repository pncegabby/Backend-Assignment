import type { Request, Response, NextFunction } from 'express';


export function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response {
    console.error('Unhandled server error:', error);
    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
}
