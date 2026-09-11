import { api } from './api';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadService = {
  async uploadSingleImage(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any, UploadResult>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async uploadMultipleImages(files: File[]): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post<any, UploadResult[]>('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
