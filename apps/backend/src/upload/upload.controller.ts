import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { S3Service } from '../s3/s3.service';
import { IsString, IsNotEmpty } from 'class-validator';

class GeneratePresignedUrlDto {
    @ApiProperty({
        description: 'Name of the file to upload',
        example: 'run-photo.jpg'
    })
    @IsString()
    @IsNotEmpty()
    filename: string;

    @ApiProperty({
        description: 'MIME type of the file',
        example: 'image/jpeg',
        enum: ['image/jpeg', 'image/png', 'image/webp']
    })
    @IsString()
    @IsNotEmpty()
    contentType: string;
}

@ApiTags('File Upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
    constructor(private readonly s3Service: S3Service) { }

    @Post('presigned-url')
    @ApiOperation({ summary: 'Generate URL for file upload' })
    @ApiResponse({
        status: 201,
        description: 'Presigned URL generated successfully',
        schema: {
            properties: {
                presignedUrl: {
                    type: 'string',
                    example: 'https://s3.amazonaws.com/bucket/file.jpg?AWSAccessKeyId=...&Signature=...'
                },
                publicUrl: {
                    type: 'string',
                    example: 'https://s3.amazonaws.com/bucket/uploads/user123/file.jpg'
                },
                key: {
                    type: 'string',
                    example: 'uploads/user123/1234567890_file.jpg'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid file type or filename' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async generatePresignedUrl(@Request() req: any, @Body() dto: GeneratePresignedUrlDto) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(dto.contentType)) {
            throw new Error('Only JPEG, PNG, and WebP images are allowed');
        }

        const key = this.s3Service.generateUniqueKey(req.user.id, dto.filename);

        const presignedUrl = await this.s3Service.generatePresignedUrl(key, dto.contentType);

        const publicUrl = this.s3Service.getPublicUrl(key);

        return {
            presignedUrl,
            publicUrl,
            key,
        };
    }
}
