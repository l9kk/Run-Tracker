import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Add validation pipe like in main.ts
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
        }));

        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();
    });

    afterAll(async () => {
        // Clean up test data
        await prismaService.run.deleteMany();
        await prismaService.user.deleteMany();

        await prismaService.$disconnect();
        await app.close();
    });

    describe('Health Check', () => {
        it('/health (GET)', () => {
            return request(app.getHttpServer())
                .get('/health')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('status', 'ok');
                    expect(res.body).toHaveProperty('timestamp');
                    expect(res.body).toHaveProperty('service', 'run-tracker-api');
                });
        });
    });

    describe('Root', () => {
        it('/ (GET)', () => {
            return request(app.getHttpServer())
                .get('/')
                .expect(200)
                .expect('Run Tracker API is running!');
        });
    });

    describe('Authentication Flow', () => {
        const testUser = {
            email: 'test@e2e.com',
            password: 'testPassword123',
        };

        let authToken: string;

        it('should create a user and login successfully', async () => {
            // First, manually create a user in the database
            const hashedPassword = await import('bcrypt').then(bcrypt =>
                bcrypt.hash(testUser.password, 10)
            );

            await prismaService.user.create({
                data: {
                    email: testUser.email,
                    password: hashedPassword,
                },
            });

            // Now test login
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(testUser.email);

            authToken = response.body.token;
        });

        it('should get user profile with valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.email).toBe(testUser.email);
        });

        it('should reject invalid credentials', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongPassword',
                })
                .expect(401);
        });
    });

    describe('Runs API', () => {
        let authToken: string; beforeAll(async () => {
            // Create user and get auth token
            const hashedPassword = await import('bcrypt').then(bcrypt =>
                bcrypt.hash('testPassword123', 10)
            );

            await prismaService.user.create({
                data: {
                    email: 'runs@e2e.com',
                    password: hashedPassword,
                },
            }); const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'runs@e2e.com',
                    password: 'testPassword123',
                });

            authToken = loginResponse.body.token;
        });

        it('should create a new run', async () => {
            const newRun = {
                date: '2025-01-01',
                timeMinutes: 30,
                timeSeconds: 45,
                distanceKm: 5.5,
                location: 'Test Park',
                notes: 'Great run!',
            };

            const response = await request(app.getHttpServer())
                .post('/runs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newRun)
                .expect(201);

            expect(response.body.distanceKm).toBe(5.5);
            expect(response.body.location).toBe('Test Park');
            expect(response.body.paceSecPerKm).toBeDefined();
        });

        it('should get user runs', async () => {
            const response = await request(app.getHttpServer())
                .get('/runs')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should get user stats', async () => {
            const response = await request(app.getHttpServer())
                .get('/runs/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('totalRuns');
            expect(response.body).toHaveProperty('totalDistanceKm');
            expect(response.body).toHaveProperty('averagePaceSecPerKm');
        });
    });
});
