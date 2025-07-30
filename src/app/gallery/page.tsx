// Dead Horse Gallery - Main gallery browsing page
// Features needed:
// - Search and filter artworks by medium, price, availability
// - Currency switcher (GBP/USD/ETH)
// - Grid layout with hover effects
// - QR code authentication badges
// - Links to individual artwork pages
// - Artist profile links
// - Responsive design with Tailwind CSS
// - Black/white minimal aesthetic matching homepage

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useHybridAuth } from '@/contexts/HybridAuthContext';
import { log } from '@/lib/logger';
import { 
  ProtectedPurchase, 
  ProtectedSave, 
  ProtectedContact 
} from '@/components/ProtectedAction';

// SVG Icon Components
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const QrCodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 4v8m-4-8h8" />
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="15" width="6" height="6" rx="1" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const HeartIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function Gallery() {
  // Keep auth context available for ProtectedAction components
  useHybridAuth();
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedItems, setLikedItems] = useState(new Set<number>());

  // Handle artwork viewing - keep viewing completely open
  const handleArtworkView = () => {
    // No restrictions on viewing
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter
  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);
  };

  // Types for artwork data
  interface ArtworkPrices {
    GBP: number;
    ETH: number;
    USD: number;
  }

  interface Artwork {
    id: number;
    title: string;
    artist: string;
    artistSlug: string;
    medium: string;
    dimensions: string;
    year: number;
    prices: ArtworkPrices;
    image: string;
    qrLinked: boolean;
    views: number;
    isAvailable: boolean;
    isOriginal: boolean;
    tags: string[];
  }

  // Mock data - replace with actual API calls
  const artworks: Artwork[] = [
    {
      id: 1,
      title: "Urban Meditation #3",
      artist: "Sarah Chen",
      artistSlug: "sarah-chen",
      medium: "Oil on Canvas",
      dimensions: "30×40cm",
      year: 2024,
      prices: { GBP: 450, ETH: 0.12, USD: 565 },
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop",
      qrLinked: true,
      views: 234,
      isAvailable: true,
      isOriginal: true,
      tags: ["contemporary", "oil", "meditation"]
    },
    {
      id: 2,
      title: "Digital Fragments",
      artist: "Marcus Thompson",
      artistSlug: "marcus-thompson", 
      medium: "Mixed Media",
      dimensions: "25×35cm",
      year: 2024,
      prices: { GBP: 280, ETH: 0.075, USD: 352 },
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop",
      qrLinked: true,
      views: 189,
      isAvailable: true,
      isOriginal: false,
      tags: ["mixed-media", "digital", "fragments"]
    },
    {
      id: 3,
      title: "Botanical Series IV",
      artist: "Elena Rodriguez",
      artistSlug: "elena-rodriguez",
      medium: "Watercolor",
      dimensions: "28×42cm", 
      year: 2024,
      prices: { GBP: 320, ETH: 0.085, USD: 402 },
      image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=500&h=500&fit=crop",
      qrLinked: true,
      views: 156,
      isAvailable: false,
      isOriginal: true,
      tags: ["watercolor", "botanical", "nature"]
    },
    {
      id: 4,
      title: "Industrial Dreams",
      artist: "David Kim",
      artistSlug: "david-kim",
      medium: "Photography Print",
      dimensions: "40×60cm",
      year: 2024,
      prices: { GBP: 150, ETH: 0.04, USD: 188 },
      image: "https://images.unsplash.com/photo-1551913902-c92207136625?w=500&h=500&fit=crop",
      qrLinked: true,
      views: 312,
      isAvailable: true,
      isOriginal: false,
      tags: ["photography", "industrial", "urban"]
    },
    {
      id: 5,
      title: "Rhythmic Patterns",
      artist: "Yuki Tanaka",
      artistSlug: "yuki-tanaka",
      medium: "Acrylic on Wood",
      dimensions: "35×45cm",
      year: 2024,
      prices: { GBP: 380, ETH: 0.10, USD: 477 },
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&h=500&fit=crop",
      qrLinked: true,
      views: 201,
      isAvailable: true,
      isOriginal: true,
      tags: ["acrylic", "patterns", "geometric"]
    },
    {
      id: 6,
      title: "Silent Conversations",
      artist: "Anna Kowalski",
      artistSlug: "anna-kowalski",
      medium: "Charcoal Drawing",
      dimensions: "20×30cm",
      year: 2024,
      prices: { GBP: 180, ETH: 0.048, USD: 226 },
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop",
      qrLinked: true,
      views: 143,
      isAvailable: true,
      isOriginal: true,
      tags: ["charcoal", "drawing", "portrait"]
    }
  ];

  const filters = [
    { id: 'all', label: 'All Works', count: artworks.length },
    { id: 'available', label: 'Available', count: artworks.filter(a => a.isAvailable).length },
    { id: 'originals', label: 'Originals', count: artworks.filter(a => a.isOriginal).length },
    { id: 'prints', label: 'Prints', count: artworks.filter(a => !a.isOriginal).length },
    { id: 'under-200', label: 'Under £200', count: artworks.filter(a => a.prices.GBP < 200).length },
    { id: 'sold', label: 'Sold', count: artworks.filter(a => !a.isAvailable).length }
  ];

  const formatPrice = (prices: ArtworkPrices, currency: string) => {
    const symbols = { GBP: '£', USD: '$', ETH: '' };
    const suffix = currency === 'ETH' ? ' ETH' : '';
    return `${symbols[currency as keyof typeof symbols]}${prices[currency as keyof ArtworkPrices]}${suffix}`;
  };

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artwork.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artwork.medium.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'available' && artwork.isAvailable) ||
                         (selectedFilter === 'originals' && artwork.isOriginal) ||
                         (selectedFilter === 'prints' && !artwork.isOriginal) ||
                         (selectedFilter === 'under-200' && artwork.prices.GBP < 200) ||
                         (selectedFilter === 'sold' && !artwork.isAvailable);

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="hidden md:flex space-x-6 flex-1 justify-end pr-8">
              <Link href="/gallery" className="text-white border-b border-white">Gallery</Link>
              <Link href="#zine" className="hover:text-gray-300 transition-colors">Zine</Link>
            </div>
            
            <Link href="/" className="text-3xl font-bold hover:text-gray-300 transition-colors">
              Dead Horse
            </Link>
            
            <div className="hidden md:flex space-x-6 flex-1 pl-8">
              <Link href="/apply" className="hover:text-gray-300 transition-colors">For Artists</Link>
              <a href="#collectors" className="hover:text-gray-300 transition-colors">For Collectors</a>
              <a href="#about" className="hover:text-gray-300 transition-colors">About</a>
            </div>
            
            <button className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors ml-4">
              Connect
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <h1 className="text-4xl font-bold mb-2">Gallery</h1>
              <p className="text-gray-400">Curated artworks with blockchain authentication</p>
            </div>
            
            {/* Currency Toggle */}
            <div className="bg-gray-900 rounded-full p-1 inline-flex">
              {['GBP', 'USD', 'ETH'].map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCurrency === currency
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-12">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search artworks, artists, or medium..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-400">
              Showing {filteredArtworks.length} of {artworks.length} artworks
            </p>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <FilterIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Artworks Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArtworks.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold mb-2">No artworks found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtworks.map((artwork) => (
                <div key={artwork.id} className="group cursor-pointer">
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-900">
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-3">
                        <Link 
                          href={`/artwork/${artwork.id}`}
                          className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
                        >
                          View Details
                        </Link>
                        {artwork.isAvailable && (
                          <ProtectedPurchase 
                            onClick={() => {
                              // Handle purchase logic
                              log.userAction('Purchase artwork', { artworkId: artwork.id });
                            }}
                            metadata={{ 
                              artworkId: artwork.id, 
                              artworkTitle: artwork.title,
                              price: artwork.prices.GBP,
                              artist: artwork.artist
                            }}
                          >
                            <button className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">
                              Purchase
                            </button>
                          </ProtectedPurchase>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      {artwork.qrLinked && (
                        <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                          <QrCodeIcon className="w-3 h-3" />
                          <span>QR</span>
                        </div>
                      )}
                      {artwork.isOriginal && (
                        <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-medium">
                          Original
                        </div>
                      )}
                      {!artwork.isAvailable && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Sold
                        </div>
                      )}
                    </div>

                    {/* Top Right Actions */}
                    <div className="absolute top-3 right-3 flex flex-col space-y-2">
                      <ProtectedSave
                        onClick={() => {
                          // Toggle like state
                          const newLikedItems = new Set(likedItems);
                          if (newLikedItems.has(artwork.id)) {
                            newLikedItems.delete(artwork.id);
                          } else {
                            newLikedItems.add(artwork.id);
                          }
                          setLikedItems(newLikedItems);
                        }}
                        metadata={{ artworkId: artwork.id, artworkTitle: artwork.title }}
                      >
                        <button className="bg-black/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black transition-colors">
                          <HeartIcon 
                            className={`w-4 h-4 ${likedItems.has(artwork.id) ? 'fill-red-500 text-red-500' : ''}`}
                            filled={likedItems.has(artwork.id)}
                          />
                        </button>
                      </ProtectedSave>
                    </div>

                    {/* View Count */}
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                      <EyeIcon className="w-3 h-3" />
                      <span>{artwork.views}</span>
                    </div>
                  </div>

                  {/* Artwork Info */}
                  <div className="space-y-2">
                    <Link 
                      href={`/artwork/${artwork.id}`}
                      onClick={handleArtworkView}
                    >
                      <h3 className="text-xl font-semibold group-hover:text-gray-300 transition-colors">
                        {artwork.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/artist/${artwork.artistSlug}`}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            by {artwork.artist}
                          </Link>
                          <ProtectedContact
                            onClick={() => {
                              // Handle contact artist logic
                              log.userAction('Contact artist', { artistName: artwork.artist });
                            }}
                            metadata={{
                              artistName: artwork.artist,
                              artistSlug: artwork.artistSlug,
                              artworkId: artwork.id,
                              artworkTitle: artwork.title
                            }}
                          >
                            <button className="text-xs text-gray-500 hover:text-white transition-colors underline">
                              Contact
                            </button>
                          </ProtectedContact>
                        </div>
                        <p className="text-sm text-gray-500">{artwork.medium} • {artwork.dimensions}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatPrice(artwork.prices, selectedCurrency)}
                        </p>
                        <p className="text-xs text-gray-500">{artwork.year}</p>
                      </div>
                    </div>

                    {/* QR Authentication */}
                    {artwork.qrLinked && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <QrCodeIcon className="w-3 h-3" />
                          <span>Blockchain verified</span>
                        </div>
                        <Link 
                          href={`/qr/${artwork.id}`}
                          className="text-xs text-white hover:text-gray-300 transition-colors underline"
                        >
                          View Certificate
                        </Link>
                      </div>
                    )}

                    {/* Action Button */}
                    {artwork.isAvailable ? (
                      <ProtectedPurchase 
                        onClick={() => {
                          // Handle add to cart logic
                          log.userAction('Add to cart', { artworkId: artwork.id });
                        }}
                        metadata={{ 
                          artworkId: artwork.id, 
                          artworkTitle: artwork.title,
                          price: artwork.prices.GBP,
                          artist: artwork.artist,
                          action: 'add_to_cart'
                        }}
                      >
                        <button className="w-full mt-4 bg-white text-black py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">
                          Add to Cart
                        </button>
                      </ProtectedPurchase>
                    ) : (
                      <button disabled className="w-full mt-4 bg-gray-800 text-gray-500 py-2 rounded-full font-medium cursor-not-allowed">
                        Sold
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-white text-black w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg z-50"
        aria-label="Back to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  );
}