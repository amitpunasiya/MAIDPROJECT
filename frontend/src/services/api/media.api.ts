import { get, post, del } from './helpers';
import { ApiResponse, PaginatedData } from './types';

export interface IMediaItem {
  id: string;
  name: string;
  url: string;
  category: 'avatar' | 'aadhaar' | 'pan' | 'certificate' | 'gallery' | 'document' | 'other';
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface IUploadMediaResponse {
  file: IMediaItem;
  url: string;
}

export const mediaApi = {
  /**
   * Upload generic file / document / image
   * POST /media/upload
   */
  uploadFile(file: File, category: string = 'document'): Promise<ApiResponse<IUploadMediaResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return post<IUploadMediaResponse>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload user avatar profile picture
   * POST /media/avatar
   */
  uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string; file: IMediaItem }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return post<{ avatarUrl: string; file: IMediaItem }>('/media/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload identity / qualification document (Aadhaar, PAN, Certificate)
   * POST /media/document
   */
  uploadDocument(file: File, docType: string): Promise<ApiResponse<IUploadMediaResponse>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('docType', docType);

    return post<IUploadMediaResponse>('/media/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get uploaded media files list
   * GET /media
   */
  fetchMedia(params?: { category?: string; page?: number; limit?: number }): Promise<ApiResponse<PaginatedData<IMediaItem>>> {
    return get<PaginatedData<IMediaItem>>('/media', params);
  },

  /**
   * Delete uploaded media by ID or key
   * DELETE /media/:id
   */
  deleteMedia(idOrKey: string): Promise<ApiResponse<{ success: boolean }>> {
    return del<{ success: boolean }>(`/media/${idOrKey}`);
  },
};

export default mediaApi;
