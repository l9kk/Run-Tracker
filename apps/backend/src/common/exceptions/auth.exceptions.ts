import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
    constructor() {
        super(
            {
                message: 'Invalid email or password. Please check your credentials and try again.',
                error: 'Invalid Credentials',
                statusCode: HttpStatus.UNAUTHORIZED,
            },
            HttpStatus.UNAUTHORIZED,
        );
    }
}

export class UserNotFoundException extends HttpException {
    constructor() {
        super(
            {
                message: 'Account not found. Please check your email address.',
                error: 'User Not Found',
                statusCode: HttpStatus.UNAUTHORIZED,
            },
            HttpStatus.UNAUTHORIZED,
        );
    }
}

export class SessionExpiredException extends HttpException {
    constructor() {
        super(
            {
                message: 'Your session has expired. Please login again.',
                error: 'Session Expired',
                statusCode: HttpStatus.UNAUTHORIZED,
            },
            HttpStatus.UNAUTHORIZED,
        );
    }
}

export class InvalidTokenException extends HttpException {
    constructor() {
        super(
            {
                message: 'Invalid authentication token. Please login again.',
                error: 'Invalid Token',
                statusCode: HttpStatus.UNAUTHORIZED,
            },
            HttpStatus.UNAUTHORIZED,
        );
    }
}
