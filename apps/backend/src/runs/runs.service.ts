import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunDto } from './dto/update-run.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class RunsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createRunDto: CreateRunDto) {
        // Convert minutes to seconds for database storage
        const durationSec = Math.round(createRunDto.durationMinutes * 60);
        const paceSecPerKm = Math.round(durationSec / createRunDto.distanceKm);

        const run = await this.prisma.run.create({
            data: {
                userId,
                date: createRunDto.date ? new Date(createRunDto.date) : new Date(),
                locationText: createRunDto.locationText,
                lat: createRunDto.lat,
                lon: createRunDto.lon,
                distanceKm: new Decimal(createRunDto.distanceKm),
                durationSec,
                paceSecPerKm,
                photoUrl: createRunDto.photoUrl,
            },
        });

        return run;
    }

    async findAll(userId: string) {
        const runs = await this.prisma.run.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });

        return runs;
    }

    async findOne(id: string, userId: string) {
        const run = await this.prisma.run.findFirst({
            where: { id, userId },
        });

        if (!run) {
            throw new NotFoundException('Run not found');
        }

        return run;
    }

    async update(id: string, userId: string, updateRunDto: UpdateRunDto) {
        const existingRun = await this.findOne(id, userId);

        const updateData: any = { ...updateRunDto };

        if (updateRunDto.date) {
            updateData.date = new Date(updateRunDto.date);
        }

        if (updateRunDto.distanceKm) {
            updateData.distanceKm = new Decimal(updateRunDto.distanceKm);
        }

        // Convert minutes to seconds if durationMinutes is provided
        if (updateRunDto.durationMinutes) {
            updateData.durationSec = Math.round(updateRunDto.durationMinutes * 60);
            delete updateData.durationMinutes; // Remove the minutes field before database update
        }

        // Recalculate pace if distance or duration changed
        if (updateRunDto.distanceKm || updateRunDto.durationMinutes) {
            const newDistance = updateRunDto.distanceKm || Number(existingRun.distanceKm);
            const newDuration = updateData.durationSec || existingRun.durationSec;
            updateData.paceSecPerKm = Math.round(newDuration / newDistance);
        }

        const updatedRun = await this.prisma.run.update({
            where: { id },
            data: updateData,
        });

        return updatedRun;
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);

        await this.prisma.run.delete({
            where: { id },
        });

        return { message: 'Run deleted successfully' };
    }

    async getStats(userId: string) {
        const runs = await this.prisma.run.findMany({
            where: { userId },
        });

        if (runs.length === 0) {
            return {
                totalRuns: 0,
                totalDistance: 0,
                averagePace: 0,
                bestPace: null,
            };
        }

        const totalRuns = runs.length;
        const totalDistance = runs.reduce((sum, run) => sum + Number(run.distanceKm), 0);
        const totalDuration = runs.reduce((sum, run) => sum + run.durationSec, 0);
        const averagePace = Math.round(totalDuration / totalDistance);
        const bestPace = Math.min(...runs.map(run => run.paceSecPerKm));

        return {
            totalRuns,
            totalDistance: Math.round(totalDistance * 100) / 100,
            averagePace,
            bestPace,
        };
    }

    formatPace(paceSecPerKm: number): string {
        const minutes = Math.floor(paceSecPerKm / 60);
        const seconds = paceSecPerKm % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    formatDuration(durationSec: number): string {
        const hours = Math.floor(durationSec / 3600);
        const minutes = Math.floor((durationSec % 3600) / 60);
        const seconds = durationSec % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}
