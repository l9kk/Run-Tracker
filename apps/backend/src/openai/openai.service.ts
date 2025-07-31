import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private readonly logger = new Logger(OpenAIService.name);
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        } else {
            this.logger.warn('OpenAI API key not found. AI features will be disabled.');
        }
    }

    async generateAchievementCelebration(data: {
        achievementType: 'distance' | 'pace' | 'duration';
        value: string;
        previousBest?: string;
        location: string;
    }): Promise<string> {
        if (!this.openai) {
            throw new Error('OpenAI not configured');
        }

        try {
            const improvement = data.previousBest ? ` (previous best: ${data.previousBest})` : '';

            const prompt = `Generate a short, enthusiastic celebration message (1-2 sentences) for achieving a personal record:

Achievement Type: ${data.achievementType}
New Record: ${data.value}${improvement}
Location: ${data.location}

Make it celebratory, personal, and motivating. Use emojis sparingly. Focus on the accomplishment.`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an enthusiastic running coach celebrating achievements. Write short, exciting messages that make runners feel proud of their accomplishments.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 100,
                temperature: 0.8,
            });

            return response.choices[0]?.message?.content?.trim() || `🎉 New ${data.achievementType} record! Outstanding performance!`;
        } catch (error) {
            this.logger.error('Error generating achievement celebration:', error);
            return `🎉 New ${data.achievementType} record! You're crushing it!`;
        }
    }

    async generateRunningInsights(runs: any[]): Promise<string> {
        if (!this.openai || runs.length === 0) {
            return 'Keep logging your runs to get personalized insights!';
        }

        try {
            // Convert Prisma Decimal to number for calculations
            const totalDistance = runs.reduce((sum, run) => sum + Number(run.distanceKm), 0);
            const totalRuns = runs.length;
            const avgDistance = totalDistance / totalRuns;
            const avgPace = runs.reduce((sum, run) => sum + run.paceSecPerKm, 0) / totalRuns / 60; // convert to min/km

            const prompt = `Analyze this running data and provide encouraging insights and suggestions (2-3 sentences):

Total Runs: ${totalRuns}
Total Distance: ${totalDistance.toFixed(1)} km
Average Distance: ${avgDistance.toFixed(1)} km per run
Average Pace: ${Math.floor(avgPace)}:${Math.round((avgPace % 1) * 60).toString().padStart(2, '0')} min/km

Give positive feedback on progress and one practical tip for improvement.`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a supportive running coach providing insights and encouragement based on running data. Be positive, practical, and motivating.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.6,
            });

            return response.choices[0]?.message?.content?.trim() || 'You\'re making great progress! Keep up the consistent training.';
        } catch (error) {
            this.logger.error('Error generating running insights:', error);
            return 'Your dedication to running is impressive! Keep pushing forward.';
        }
    }
}
