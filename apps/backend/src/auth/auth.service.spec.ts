import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
    let service: AuthService;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const mockPrismaService = {
            user: {
                findUnique: jest.fn(),
            },
        };

        const mockJwtService = {
            sign: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prismaService = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user data when user exists', async () => {
            const userSelect = { id: '1', email: 'test@example.com' };
            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(userSelect);

            const result = await service.validateUser('1');

            expect(result).toEqual(userSelect);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                select: { id: true, email: true },
            });
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.validateUser('nonexistent')).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('should return user and token when credentials are valid', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockToken = 'jwt-token';
            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

            const result = await service.login(loginDto);

            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                },
                token: mockToken,
            });
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: loginDto.email },
            });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
            });
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            const loginDto: LoginDto = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});
