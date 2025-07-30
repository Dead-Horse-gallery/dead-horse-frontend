'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDownIcon, HeartIcon, ShareIcon, MapPinIcon, CalendarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Artist, ArtistStats, Artwork, ArtworkFilter } from '../../../types/artist';

import { log } from '@/lib/logger';
// Dead Horse Gallery - Artist profile page
// Features needed:
// - Dynamic route with artist slug parameter
// - Artist bio and contact information
// - Portfolio grid of their artworks
// - Statistics (total works, sold, views, collectors)
// - Social media links (Instagram, website, email)
// - Verification badges
// - Filterable artwork display
// - Sticky sidebar layout

interface ArtistProfileProps {
  params: Promise<{ slug: string }>;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'most_viewed', label: 'Most Viewed' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All Works' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
];

export default function ArtistProfile({ params }: ArtistProfileProps) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ArtworkFilter>({
    availability: 'all',
    sort_by: 'newest'
  });
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch artist data
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        
        // Await params to get the slug
        const { slug } = await params;
        
        // Fetch artist profile
        const artistResponse = await fetch(`/api/artists/${slug}`);
        if (!artistResponse.ok) {
          if (artistResponse.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch artist data');
        }
        const artistData = await artistResponse.json();
        setArtist(artistData);

        // Fetch artist statistics
        const statsResponse = await fetch(`/api/artists/${slug}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch artworks
        const artworksResponse = await fetch(`/api/artists/${slug}/artworks`);
        if (artworksResponse.ok) {
          const artworksData = await artworksResponse.json();
          setArtworks(artworksData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [params]);

  // Filter and sort artworks
  const filteredArtworks = useMemo(() => {
    let filtered = [...artworks];

    // Filter by availability
    if (filters.availability === 'available') {
      filtered = filtered.filter(artwork => !artwork.is_sold);
    } else if (filters.availability === 'sold') {
      filtered = filtered.filter(artwork => artwork.is_sold);
    }

    // Filter by medium
    if (filters.medium) {
      filtered = filtered.filter(artwork => 
        artwork.medium.toLowerCase().includes(filters.medium!.toLowerCase())
      );
    }

    // Filter by price range
    if (filters.price_range) {
      filtered = filtered.filter(artwork => 
        artwork.price >= filters.price_range![0] && 
        artwork.price <= filters.price_range![1]
      );
    }

    // Filter by year range
    if (filters.year_range) {
      filtered = filtered.filter(artwork => 
        artwork.year_created >= filters.year_range![0] && 
        artwork.year_created <= filters.year_range![1]
      );
    }

    // Sort artworks
    switch (filters.sort_by) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'most_viewed':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [artworks, filters]);

  const toggleFavorite = async (artworkId: string) => {
    try {
      const response = await fetch(`/api/artworks/${artworkId}/favorite`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setArtworks(prev => prev.map(artwork => 
          artwork.id === artworkId 
            ? { ...artwork, is_favorited: !artwork.is_favorited }
            : artwork
        ));
      }
    } catch (error) {
      log.error('Failed to toggle favorite:', { error: error });
    }
  };

  const handleShare = async () => {
    if (navigator.share && artist) {
      try {
        await navigator.share({
          title: `${artist.name} - Dead Horse Gallery`,
          text: `Check out ${artist.name}'s artwork on Dead Horse Gallery`,
          url: window.location.href,
        });
      } catch (error) {
        log.error('Error sharing:', { error: error });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The artist you are looking for does not exist.'}</p>
          <Link 
            href="/gallery" 
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {artist.cover_image && (
        <div className="relative h-80 w-full overflow-hidden">
          <Image
            src={artist.cover_image}
            alt={`${artist.name} cover`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Artist Header */}
        <div className="relative pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8 -mt-20 relative z-10">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={artist.profile_image}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Artist Info */}
            <div className="flex-1 mt-6 lg:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold text-gray-900">{artist.name}</h1>
                    {artist.is_verified && (
                      <CheckBadgeIcon className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-gray-600">
                    {artist.location && (
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{artist.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{artist.years_active} years active</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Statistics */}
              {stats && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Works</span>
                      <span className="font-medium">{stats.total_artworks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sold</span>
                      <span className="font-medium">{stats.total_sold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views</span>
                      <span className="font-medium">{stats.total_views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collectors</span>
                      <span className="font-medium">{stats.total_collectors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Price</span>
                      <span className="font-medium">${stats.average_price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* About */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
                
                {/* Art Medium */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Medium</h4>
                  <div className="flex flex-wrap gap-2">
                    {artist.art_medium.map((medium) => (
                      <span
                        key={medium}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {medium}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Social */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                <div className="space-y-3">
                  {artist.website_url && (
                    <a
                      href={artist.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
                    >
                      <span>🌐</span>
                      <span>Website</span>
                    </a>
                  )}
                  {artist.instagram_handle && (
                    <a
                      href={`https://instagram.com/${artist.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
                    >
                      <span>📷</span>
                      <span>Instagram</span>
                    </a>
                  )}
                  <a
                    href={`mailto:${artist.email}`}
                    className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
                  >
                    <span>✉️</span>
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold mb-4 sm:mb-0">
                  Portfolio ({filteredArtworks.length} works)
                </h2>
                
                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={filters.sort_by}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        sort_by: e.target.value as ArtworkFilter['sort_by'] 
                      }))}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                  </div>

                  {/* Availability Filter */}
                  <div className="relative">
                    <select
                      value={filters.availability}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        availability: e.target.value as ArtworkFilter['availability'] 
                      }))}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {AVAILABILITY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Artwork Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((artwork) => (
                <div key={artwork.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                  <div className="relative aspect-square">
                    <Image
                      src={artwork.image_url}
                      alt={artwork.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {artwork.is_sold && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                        Sold
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(artwork.id)}
                      className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                    >
                      {artwork.is_favorited ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <Link 
                      href={`/artwork/${artwork.id}`}
                      className="block hover:text-gray-600 transition-colors"
                    >
                      <h3 className="font-semibold text-lg mb-1">{artwork.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {artwork.year_created} • {artwork.medium}
                      </p>
                      {artwork.dimensions && (
                        <p className="text-gray-500 text-sm mb-2">{artwork.dimensions}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">
                          ${artwork.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {artwork.views} views
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtworks.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
