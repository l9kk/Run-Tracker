import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: AppController;

    const mockAppService = {
        getHello: jest.fn(() => 'Run Tracker API is running!'),
    };

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                {
                    provide: AppService,
                    useValue: mockAppService,
                },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
    }); describe('root', () => {
        it('should return "Run Tracker API is running!"', () => {
            const result = appController.getHello();
            expect(result).toBe('Run Tracker API is running!');
            expect(mockAppService.getHello).toHaveBeenCalled();
        });
    });

    describe('health', () => {
        it('should return health status', () => {
            const result = appController.healthCheck();

            expect(result).toEqual({
                status: 'ok',
                timestamp: expect.any(String),
                service: 'run-tracker-api',
            });

            expect(new Date(result.timestamp)).toBeInstanceOf(Date);
        });
    });
});
