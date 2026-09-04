import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('cloudinary.cloudName'),
      api_key: this.config.get<string>('cloudinary.apiKey'),
      api_secret: this.config.get<string>('cloudinary.apiSecret'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'bdspro/properties'): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('Vui lòng chọn tệp ảnh để tải lên');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse) => {
          if (error) return reject(new BadRequestException(`Lỗi upload ảnh: ${error.message}`));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultiple(files: Express.Multer.File[], folder = 'bdspro/properties') {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 1 tệp');
    }
    return Promise.all(files.map((file) => this.uploadFile(file, folder)));
  }
}
