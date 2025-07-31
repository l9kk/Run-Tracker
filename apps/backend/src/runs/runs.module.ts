import { Module } from '@nestjs/common';
import { RunsService } from './runs.service';
import { RunsController } from './runs.controller';
import { OpenAIModule } from '../openai/openai.module';

@Module({
    imports: [OpenAIModule],
    controllers: [RunsController],
    providers: [RunsService],
})
export class RunsModule { }
