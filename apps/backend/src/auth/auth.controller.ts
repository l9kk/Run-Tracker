import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            properties: {
                message: { type: 'string', example: 'Login successful' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clk1234567890abcdef' },
                        email: { type: 'string', example: 'user@example.com' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Authentication failed',
        schema: {
            properties: {
                message: {
                    type: 'string',
                    example: 'Invalid email or password. Please check your credentials and try again.'
                },
                error: { type: 'string', example: 'Invalid Credentials' },
                statusCode: { type: 'number', example: 401 }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Validation error',
        schema: {
            properties: {
                message: {
                    type: 'string',
                    examples: [
                        'Please provide a valid email address.',
                        'Password must be at least 6 characters long.',
                        'Please check your input and try again.'
                    ]
                },
                error: { type: 'string', example: 'Validation Error' },
                statusCode: { type: 'number', example: 400 },
                details: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['email must be an email', 'password must be longer than or equal to 6 characters']
                }
            }
        }
    })
    @ApiResponse({
        status: 429,
        description: 'Too many login attempts',
        schema: {
            properties: {
                message: { type: 'string', example: 'Too many requests' },
                error: { type: 'string', example: 'ThrottlerException' },
                statusCode: { type: 'number', example: 429 }
            }
        }
    })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto);

        res.cookie('access_token', result.token, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        return {
            message: 'Login successful',
            user: result.user,
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({
        status: 200,
        description: 'Logout successful',
        schema: {
            properties: {
                message: { type: 'string', example: 'Logout successful' }
            }
        }
    })
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token', { path: '/' });
        return { message: 'Logout successful' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clk1234567890abcdef' },
                        email: { type: 'string', example: 'user@example.com' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Authentication required',
        schema: {
            properties: {
                message: {
                    type: 'string',
                    examples: [
                        'Your session has expired. Please login again.',
                        'Invalid authentication token. Please login again.'
                    ]
                },
                error: {
                    type: 'string',
                    examples: ['Session Expired', 'Invalid Token']
                },
                statusCode: { type: 'number', example: 401 }
            }
        }
    })
    async getProfile(@Request() req: any) {
        return {
            user: {
                id: req.user.id,
                email: req.user.email,
            },
        };
    }
}
