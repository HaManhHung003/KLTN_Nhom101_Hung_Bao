import { api } from './api';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadService = {
  async uploadSingleImage(file: File, folder = 'bdspro/avatars'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any, UploadResult>(`/upload/image?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async uploadMultipleImages(files: File[], folder = 'bdspro/properties'): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post<any, UploadResult[]>(`/upload/images?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
