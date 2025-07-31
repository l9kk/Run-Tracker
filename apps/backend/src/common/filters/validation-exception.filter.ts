import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;

        // Handle validation errors specifically
        if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
            const validationErrors = exceptionResponse.message;
            let userFriendlyMessage = 'Please check your input and try again.';

            // Provide specific messages for common validation errors
            if (validationErrors.some((msg: string) => msg.includes('email'))) {
                userFriendlyMessage = 'Please provide a valid email address.';
            } else if (validationErrors.some((msg: string) => msg.includes('password'))) {
                userFriendlyMessage = 'Password must be at least 6 characters long.';
            } else if (validationErrors.some((msg: string) => msg.includes('duration'))) {
                userFriendlyMessage = 'Please enter duration in minutes (e.g., 25 for 25 minutes).';
            } else if (validationErrors.some((msg: string) => msg.includes('distance'))) {
                userFriendlyMessage = 'Please enter a valid distance greater than 0.';
            }

            return response.status(status).json({
                success: false,
                message: userFriendlyMessage,
                error: 'Validation Error',
                statusCode: status,
                details: validationErrors,
            });
        }

        // Default handling for other BadRequestExceptions
        return response.status(status).json({
            success: false,
            message: 'Invalid request. Please check your input.',
            error: 'Bad Request',
            statusCode: status,
        });
    }
}
