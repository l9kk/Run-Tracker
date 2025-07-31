import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor(private configService: ConfigService) {
        this.region = this.configService.get('S3_REGION');
        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
            },
        });
        this.bucketName = this.configService.get('S3_BUCKET');
    }

    async generatePresignedUrl(key: string, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        try {
            const signedUrl = await getSignedUrl(this.s3Client, command, {
                expiresIn: 3600, // 1 hour
            });
            return signedUrl;
        } catch (error) {
            throw new Error(`Failed to generate presigned URL: ${error.message}`);
        }
    }

    getPublicUrl(key: string): string {
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }

    generateUniqueKey(userId: string, originalFilename: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = originalFilename.split('.').pop();
        return `runs/${userId}/${timestamp}-${randomString}.${extension}`;
    }
}
