import { NextRequest, NextResponse } from 'next/server';

import { log } from '@/lib/logger';
// Mock data for development - replace with actual database queries
const mockArtist = {
  id: '1',
  slug: 'jane-doe',
  name: 'Jane Doe',
  bio: 'Contemporary artist specializing in abstract expressionism and mixed media. My work explores the intersection of emotion and color, creating pieces that invite viewers into a dialogue with their own experiences.',
  profile_image: '/api/placeholder/200/200',
  cover_image: '/api/placeholder/800/400',
  instagram_handle: '@janedoeart',
  website_url: 'https://janedoe.art',
  email: 'jane@janedoe.art',
  location: 'New York, NY',
  art_medium: ['Painting', 'Mixed Media', 'Digital Art'],
  years_active: 8,
  is_verified: true,
  created_at: '2020-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // In a real app, you would query your database here
    // const artist = await db.artist.findUnique({ where: { slug } });
    
    if (slug !== 'jane-doe') {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mockArtist);
  } catch (error) {
    log.error('Error fetching artist:', { error: error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
