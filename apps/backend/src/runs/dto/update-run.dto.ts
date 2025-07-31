import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateRunDto {
    @IsDateString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsOptional()
    locationText?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Type(() => Number)
    @IsOptional()
    distanceKm?: number;

    @IsNumber()
    @Min(0.1)
    @Type(() => Number)
    @IsOptional()
    durationMinutes?: number;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lat?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lon?: number;
}
