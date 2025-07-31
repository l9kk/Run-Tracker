import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RunsModule } from './runs/runs.module';
import { UploadModule } from './upload/upload.module';
import { OpenAIModule } from './openai/openai.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        PrismaModule,
        RunsModule,
        UploadModule,
        OpenAIModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
