import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            password: hashedPassword,
        },
    });

    console.log('👤 Created demo user:', user.email);

    const runs = [
        {
            locationText: 'Kazakhstan, Almaty',
            lat: 40.785091,
            lon: 73.968285,
            distanceKm: 5.2,
            durationSec: 1485,
            date: new Date('2025-07-29T07:30:00Z'),
            aiTitle: 'Morning Park Run',
            aiNote: 'Great pace for morning run. Keep up the consistency!',
        },
        {
            locationText: 'Kazakhstan, Astana',
            lat: 40.706086,
            lon: 73.996864,
            distanceKm: 3.8,
            durationSec: 1140,
            date: new Date('2025-07-28T18:15:00Z'),
            aiTitle: 'Evening Bridge Run',
            aiNote: 'Fast pace! Nice improvement from last week.',
        },
        {
            locationText: 'Kazakhstan, Almaty',
            lat: 40.660204,
            lon: 73.969063,
            distanceKm: 7.5,
            durationSec: 2700,
            date: new Date('2025-07-27T06:45:00Z'),
            aiTitle: 'Long Saturday Run',
            aiNote: 'Steady endurance pace. Good base building.',
        },
    ];

    for (const runData of runs) {
        const paceSecPerKm = Math.round(runData.durationSec / Number(runData.distanceKm));

        await prisma.run.create({
            data: {
                ...runData,
                paceSecPerKm,
                userId: user.id,
            },
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
