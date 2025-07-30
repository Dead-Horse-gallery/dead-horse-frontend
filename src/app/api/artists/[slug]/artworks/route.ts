import { NextRequest, NextResponse } from 'next/server';

import { log } from '@/lib/logger';
// Mock artworks data
const mockArtworks = [
  {
    id: '1',
    title: 'Ethereal Dreams',
    description: 'A vibrant exploration of subconscious imagery through bold colors and flowing forms.',
    image_url: '/api/placeholder/400/400',
    price: 3200,
    is_sold: false,
    medium: 'Oil on Canvas',
    dimensions: '36" x 48"',
    year_created: 2024,
    views: 1240,
    created_at: '2024-01-15T00:00:00Z',
    is_favorited: false
  },
  {
    id: '2',
    title: 'Urban Fragments',
    description: 'Mixed media piece capturing the essence of city life through layered textures.',
    image_url: '/api/placeholder/400/400',
    price: 2800,
    is_sold: true,
    medium: 'Mixed Media',
    dimensions: '30" x 40"',
    year_created: 2023,
    views: 980,
    created_at: '2023-08-10T00:00:00Z',
    is_favorited: true
  },
  {
    id: '3',
    title: 'Digital Horizon',
    description: 'Contemporary digital art exploring the intersection of technology and nature.',
    image_url: '/api/placeholder/400/400',
    price: 1500,
    is_sold: false,
    medium: 'Digital Art',
    dimensions: 'Digital Print 24" x 32"',
    year_created: 2024,
    views: 750,
    created_at: '2024-02-20T00:00:00Z',
    is_favorited: false
  },
  {
    id: '4',
    title: 'Midnight Reflections',
    description: 'A contemplative piece exploring themes of solitude and inner peace.',
    image_url: '/api/placeholder/400/400',
    price: 4500,
    is_sold: false,
    medium: 'Acrylic on Canvas',
    dimensions: '48" x 60"',
    year_created: 2023,
    views: 1850,
    created_at: '2023-11-05T00:00:00Z',
    is_favorited: true
  },
  {
    id: '5',
    title: 'Geometric Symphony',
    description: 'Abstract geometric composition in vibrant blues and yellows.',
    image_url: '/api/placeholder/400/400',
    price: 2200,
    is_sold: true,
    medium: 'Painting',
    dimensions: '24" x 36"',
    year_created: 2022,
    views: 650,
    created_at: '2022-06-15T00:00:00Z',
    is_favorited: false
  },
  {
    id: '6',
    title: 'Organic Flow',
    description: 'Fluid forms inspired by natural patterns and growth.',
    image_url: '/api/placeholder/400/400',
    price: 3800,
    is_sold: false,
    medium: 'Mixed Media',
    dimensions: '42" x 54"',
    year_created: 2024,
    views: 1100,
    created_at: '2024-03-12T00:00:00Z',
    is_favorited: false
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // In a real app, you would query your database here
    // const artworks = await db.artwork.findMany({
    //   where: { artist: { slug } },
    //   orderBy: { created_at: 'desc' }
    // });

    if (slug !== 'jane-doe') {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mockArtworks);
  } catch (error) {
    log.error('Error fetching artworks:', { error: error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
