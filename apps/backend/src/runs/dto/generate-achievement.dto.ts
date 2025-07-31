import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateAchievementDto {
    @ApiProperty({
        enum: ['distance', 'pace', 'duration'],
        example: 'distance'
    })
    @IsEnum(['distance', 'pace', 'duration'])
    achievementType: 'distance' | 'pace' | 'duration';

    @ApiProperty({ example: '10km' })
    @IsString()
    value: string;

    @ApiPropertyOptional({ example: '8km' })
    @IsOptional()
    @IsString()
    previousBest?: string;

    @ApiProperty({ example: 'Central Park, New York' })
    @IsString()
    location: string;
}
