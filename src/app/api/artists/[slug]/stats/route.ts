import { NextRequest, NextResponse } from 'next/server';

import { log } from '@/lib/logger';
// Mock stats data
const mockStats = {
  total_artworks: 42,
  total_sold: 18,
  total_views: 12540,
  total_collectors: 24,
  average_price: 2850
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // In a real app, you would query your database here
    // const stats = await db.artwork.aggregate({
    //   where: { artist: { slug } },
    //   _count: { id: true },
    //   _sum: { views: true },
    //   _avg: { price: true }
    // });

    if (slug !== 'jane-doe') {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mockStats);
  } catch (error) {
    log.error('Error fetching artist stats:', { error: error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
