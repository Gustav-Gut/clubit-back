import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const message = exception.message.replace(/\n/g, '');

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorMsg = 'Internal Server Error';
        let customMessage = message;

        switch (exception.code) {
            case 'P2002':
                status = HttpStatus.CONFLICT;
                errorMsg = 'Conflict';
                customMessage = 'Unique data is duplicated';
                break;
            case 'P2025':
                status = HttpStatus.NOT_FOUND;
                errorMsg = 'Not Found';
                customMessage = 'Record not found';
                break;
            default:
                console.error(exception);
                break;
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: customMessage,
            error: errorMsg,
        });
    }
}