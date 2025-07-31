import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RunsService } from './runs.service';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunDto } from './dto/update-run.dto';
import { GenerateAchievementDto } from './dto/generate-achievement.dto';
import { OpenAIService } from '../openai/openai.service';

@ApiTags('Runs')
@ApiBearerAuth('JWT-auth')
@Controller('runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
    constructor(
        private readonly runsService: RunsService,
        private readonly openaiService: OpenAIService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new run' })
    @ApiResponse({
        status: 201,
        description: 'Run created successfully',
        schema: {
            properties: {
                message: { type: 'string', example: 'Run created successfully' },
                run: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clk1234567890abcdef' },
                        distance: { type: 'number', example: 5.2 },
                        duration: { type: 'number', example: 1800 },
                        date: { type: 'string', format: 'date-time', example: '2025-07-31T10:00:00Z' },
                        pace: { type: 'number', example: 346 },
                        route: { type: 'string', example: 'Central Park Loop' },
                        notes: { type: 'string', example: 'Great morning run!' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(@Request() req: any, @Body() createRunDto: CreateRunDto) {
        const run = await this.runsService.create(req.user.id, createRunDto);
        return {
            message: 'Run created successfully',
            run,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all runs for the authenticated user' })
    @ApiResponse({
        status: 200,
        description: 'Runs retrieved successfully',
        schema: {
            properties: {
                runs: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'clk1234567890abcdef' },
                            distance: { type: 'number', example: 5.2 },
                            duration: { type: 'number', example: 1800 },
                            date: { type: 'string', format: 'date-time', example: '2025-07-31T10:00:00Z' },
                            pace: { type: 'number', example: 346 },
                            route: { type: 'string', example: 'Central Park Loop' },
                            notes: { type: 'string', example: 'Great morning run!' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@Request() req: any) {
        const runs = await this.runsService.findAll(req.user.id);
        return {
            runs,
        };
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get running statistics for the authenticated user' })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
            properties: {
                stats: {
                    type: 'object',
                    properties: {
                        totalRuns: { type: 'number', example: 42 },
                        totalDistance: { type: 'number', example: 218.5 },
                        totalDuration: { type: 'number', example: 75600 },
                        averagePace: { type: 'number', example: 346 },
                        bestPace: { type: 'number', example: 295 },
                        longestRun: { type: 'number', example: 21.1 }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getStats(@Request() req: any) {
        const stats = await this.runsService.getStats(req.user.id);
        return {
            stats,
        };
    }

    @Get('insights')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get AI-powered running insights' })
    @ApiResponse({
        status: 200,
        description: 'Insights generated successfully',
        schema: {
            properties: {
                insights: { type: 'string', example: 'Your running consistency is impressive with 12 runs this month! Your average pace of 4:30/km shows steady improvement. Consider adding one longer run per week to build endurance.' }
            }
        }
    })
    async getRunningInsights(@Request() req: any) {

        const runs = await this.runsService.findAll(req.user.id);

        const insights = await this.openaiService.generateRunningInsights(runs);

        return { insights };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific run by ID' })
    @ApiParam({ name: 'id', description: 'Run ID', example: 'clk1234567890abcdef' })
    @ApiResponse({
        status: 200,
        description: 'Run retrieved successfully',
        schema: {
            properties: {
                run: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clk1234567890abcdef' },
                        distance: { type: 'number', example: 5.2 },
                        duration: { type: 'number', example: 1800 },
                        date: { type: 'string', format: 'date-time', example: '2025-07-31T10:00:00Z' },
                        pace: { type: 'number', example: 346 },
                        route: { type: 'string', example: 'Central Park Loop' },
                        notes: { type: 'string', example: 'Great morning run!' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Run not found' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        const run = await this.runsService.findOne(id, req.user.id);
        return {
            run,
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a specific run' })
    @ApiParam({ name: 'id', description: 'Run ID', example: 'clk1234567890abcdef' })
    @ApiResponse({
        status: 200,
        description: 'Run updated successfully',
        schema: {
            properties: {
                message: { type: 'string', example: 'Run updated successfully' },
                run: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clk1234567890abcdef' },
                        distance: { type: 'number', example: 5.2 },
                        duration: { type: 'number', example: 1800 },
                        date: { type: 'string', format: 'date-time', example: '2025-07-31T10:00:00Z' },
                        pace: { type: 'number', example: 346 },
                        route: { type: 'string', example: 'Central Park Loop' },
                        notes: { type: 'string', example: 'Great morning run!' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Run not found' })
    async update(@Request() req: any, @Param('id') id: string, @Body() updateRunDto: UpdateRunDto) {
        const run = await this.runsService.update(id, req.user.id, updateRunDto);
        return {
            message: 'Run updated successfully',
            run,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a specific run' })
    @ApiParam({ name: 'id', description: 'Run ID', example: 'clk1234567890abcdef' })
    @ApiResponse({
        status: 200,
        description: 'Run deleted successfully',
        schema: {
            properties: {
                message: { type: 'string', example: 'Run deleted successfully' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Run not found' })
    async remove(@Request() req: any, @Param('id') id: string) {
        const result = await this.runsService.remove(id, req.user.id);
        return result;
    }

    @Post('generate-achievement')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Generate AI-powered achievement celebration' })
    @ApiResponse({
        status: 200,
        description: 'Achievement celebration generated successfully',
        schema: {
            properties: {
                celebration: { type: 'string', example: '🎉 Incredible! You just crushed your distance record with a fantastic 10km run! Your previous best of 8km is now in the dust. This achievement shows your dedication and growing strength!' }
            }
        }
    })
    async generateAchievementCelebration(@Body() data: GenerateAchievementDto) {
        const celebration = await this.openaiService.generateAchievementCelebration({
            achievementType: data.achievementType,
            value: data.value,
            previousBest: data.previousBest,
            location: data.location
        });
        return { celebration };
    }
}
