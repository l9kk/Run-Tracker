import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRunDto {
    @ApiPropertyOptional({
        description: 'Date of the run (ISO string)',
        example: '2025-07-31T10:00:00Z',
        format: 'date-time'
    })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiProperty({
        description: 'Location where the run took place',
        example: 'Central Park, New York'
    })
    @IsString()
    @IsNotEmpty()
    locationText: string;

    @ApiProperty({
        description: 'Distance of the run in kilometers',
        example: 5.2,
        minimum: 0.01
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Type(() => Number)
    distanceKm: number;

    @ApiProperty({
        description: 'Duration of the run in minutes',
        example: 30,
        minimum: 0.1
    })
    @IsNumber()
    @Min(0.1)
    @Type(() => Number)
    durationMinutes: number;

    @ApiPropertyOptional({
        description: 'URL of a photo taken during the run',
        example: 'https://example.com/photos/run123.jpg'
    })
    @IsOptional()
    @IsString()
    photoUrl?: string;

    @ApiPropertyOptional({
        description: 'Latitude coordinate of the run start location',
        example: 40.7829
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lat?: number;

    @ApiPropertyOptional({
        description: 'Longitude coordinate of the run start location',
        example: -73.9654
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lon?: number;
}
