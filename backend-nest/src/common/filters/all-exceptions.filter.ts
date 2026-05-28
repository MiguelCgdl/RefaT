import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = exception instanceof Error ? exception.message : 'Internal server error';
    let detailedResponse: any = null;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        detailedResponse = response;
        if ((response as any).message) {
          message = Array.isArray((response as any).message)
            ? (response as any).message.join(', ')
            : (response as any).message;
        }
      }
    }
    
    const method = req ? httpAdapter.getRequestMethod(req) : 'UNKNOWN';
    const url = req ? httpAdapter.getRequestUrl(req) : 'UNKNOWN';
    const headers = req ? req.headers : {};
    const authHeader = headers?.authorization;
    const authInfo = authHeader 
      ? `Present (starts with Bearer: ${authHeader.startsWith('Bearer ')}, length: ${authHeader.length})` 
      : 'Missing';

    this.logger.error(
      `Exception [Status ${httpStatus}] on ${method} ${url} | Auth: ${authInfo}: ${message}`,
      exception instanceof Error ? exception.stack : ''
    );

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: message,
      ...(detailedResponse ? { details: detailedResponse } : {}),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
