import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Cookie parser middleware
    app.use(cookieParser());

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    // CORS configuration
    app.enableCors({
        origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
        credentials: true,
    });

    const port = configService.get('PORT') || 3001;
    await app.listen(port);
    console.log(`🚀 Run Tracker API running on port ${port}`);
}
bootstrap();
