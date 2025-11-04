// In backend-only mode, API is served from the same origin
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface CustomerContactData {
  name: string;
  whatsapp: string;
  goal?: string;
  city?: string;
}

export interface VideoData {
  id: number;
  title: string;
  description?: string;
  vimeo_id?: string;
  video_url?: string;
  video_file_url?: string;
  position: string;
}

export const api = {
  // Customer Registration
  async registerCustomer(data: CustomerContactData) {
    const response = await fetch(`${API_BASE_URL}/contacts/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'فشل التسجيل');
    }

    return response.json();
  },

  // Get Hero Video
  async getHeroVideo(): Promise<VideoData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/hero/`);
      if (response.ok) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching hero video:', error);
      return null;
    }
  },

  // Get Active Videos
  async getActiveVideos(position?: string): Promise<VideoData[]> {
    try {
      const url = position 
        ? `${API_BASE_URL}/videos/active/?position=${position}`
        : `${API_BASE_URL}/videos/active/`;
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  },
};

