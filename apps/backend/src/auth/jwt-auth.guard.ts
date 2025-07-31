import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionExpiredException, InvalidTokenException } from '../common/exceptions/auth.exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any) {
        if (info?.name === 'TokenExpiredError') {
            throw new SessionExpiredException();
        }

        if (info?.name === 'JsonWebTokenError' || info?.name === 'NotBeforeError') {
            throw new InvalidTokenException();
        }

        if (err || !user) {
            throw new InvalidTokenException();
        }

        return user;
    }
}
