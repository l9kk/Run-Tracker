import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('General')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('health')
    @ApiResponse({
        status: 200,
        description: 'Health status',
        schema: {
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time', example: '2025-07-31T10:00:00Z' },
                service: { type: 'string', example: 'run-tracker-api' }
            }
        }
    })
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'run-tracker-api'
        };
    }
}
