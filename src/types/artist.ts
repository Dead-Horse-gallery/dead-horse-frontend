// Artist profile related types
export interface Artist {
  id: string;
  slug: string;
  name: string;
  bio: string;
  profile_image: string;
  cover_image?: string;
  instagram_handle?: string;
  website_url?: string;
  email: string;
  location?: string;
  art_medium: string[];
  years_active: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtistStats {
  total_artworks: number;
  total_sold: number;
  total_views: number;
  total_collectors: number;
  average_price: number;
}

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  price: number;
  is_sold: boolean;
  medium: string;
  dimensions: string;
  year_created: number;
  views: number;
  created_at: string;
  is_favorited: boolean;
}

export interface ArtworkFilter {
  medium?: string;
  price_range?: [number, number];
  year_range?: [number, number];
  availability?: 'all' | 'available' | 'sold';
  sort_by?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'most_viewed';
}

export interface ArtistProfileResponse {
  artist: Artist;
  stats: ArtistStats;
  artworks: Artwork[];
}
