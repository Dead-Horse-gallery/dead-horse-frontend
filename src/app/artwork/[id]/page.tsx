// Dead Horse Gallery - Individual artwork detail page
// Features needed:
// - Dynamic route with artwork ID parameter
// - Image gallery with thumbnails
// - Tabbed interface (Details, Provenance, Shipping)
// - QR code modal for blockchain certificate
// - Purchase button integration
// - Artist information sidebar
// - Related works section
// - Currency price display
// - Share functionality

"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { log } from '@/lib/logger';
import { ProtectedPurchase, ProtectedSave, ProtectedContact, ProtectedVerify } from '@/components/ProtectedAction';

// SVG Icon Components
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const HeartIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

interface ArtworkDetailProps {
  params: Promise<{ id: string }>;
}

export default function ArtworkDetail({ params }: ArtworkDetailProps) {
  // Use React.use() to unwrap the params Promise
  const { id } = use(params);
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [activeTab, setActiveTab] = useState('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Types
  interface ArtworkPrices {
    GBP: number;
    ETH: number;
    USD: number;
  }

  interface Artist {
    id: number;
    name: string;
    slug: string;
    bio: string;
    profileImage: string;
    verified: boolean;
    location: string;
    totalWorks: number;
  }

  interface Artwork {
    id: number;
    title: string;
    artist: Artist;
    medium: string;
    dimensions: string;
    year: number;
    prices: ArtworkPrices;
    images: string[];
    description: string;
    isAvailable: boolean;
    isOriginal: boolean;
    hasQR: boolean;
    views: number;
    edition?: string;
    weight?: string;
    materials: string[];
    tags: string[];
    provenance: Array<{
      date: string;
      event: string;
      owner: string;
    }>;
    shipping: {
      domestic: number;
      international: number;
      expedited: number;
    };
  }

  // Mock artworks data - replace with API call
  const artworks: Artwork[] = [
    {
      id: 1,
      title: "Urban Meditation #3",
      artist: {
        id: 1,
        name: "Sarah Chen",
        slug: "sarah-chen",
        bio: "Contemporary artist exploring urban mindfulness through oil painting.",
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b562?w=400&h=400&fit=crop",
        verified: true,
        location: "London, UK",
        totalWorks: 12
      },
      medium: "Oil on Canvas",
      dimensions: "30×40cm",
      year: 2024,
      prices: { GBP: 450, ETH: 0.12, USD: 565 },
      images: [
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=800&fit=crop"
      ],
      description: "Part of the acclaimed Urban Meditation series, this piece captures the essence of finding tranquility amidst the chaos of city life. Using traditional oil painting techniques with a contemporary perspective, Chen creates a visual bridge between Eastern meditation practices and Western urban environments.",
      isAvailable: true,
      isOriginal: true,
      hasQR: true,
      views: 234,
      edition: "1/1 Original",
      weight: "0.8kg",
      materials: ["Premium cotton canvas", "Professional oil paints", "Wooden frame"],
      tags: ["contemporary", "oil", "meditation", "urban", "mindfulness"],
      provenance: [
        { date: "2024-07-20", event: "Created by artist", owner: "Sarah Chen Studio" },
        { date: "2024-07-25", event: "Listed on Dead Horse Gallery", owner: "Dead Horse Gallery" }
      ],
      shipping: {
        domestic: 15,
        international: 45,
        expedited: 25
      }
    },
    {
      id: 2,
      title: "Digital Fragments",
      artist: {
        id: 2,
        name: "Marcus Thompson",
        slug: "marcus-thompson",
        bio: "Digital artist exploring the intersection of technology and humanity.",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        verified: true,
        location: "Berlin, DE",
        totalWorks: 8
      },
      medium: "Mixed Media",
      dimensions: "25×35cm",
      year: 2024,
      prices: { GBP: 280, ETH: 0.075, USD: 352 },
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop"
      ],
      description: "A exploration of digital fragmentation in the modern world, combining traditional mixed media with digital elements.",
      isAvailable: true,
      isOriginal: false,
      hasQR: true,
      views: 189,
      edition: "2/5",
      weight: "1.8kg",
      materials: ["Mixed Media", "Digital Print", "Acrylic"],
      tags: ["mixed-media", "digital", "fragments"],
      provenance: [
        { date: "2024-02-01", event: "Created", owner: "Artist Studio" }
      ],
      shipping: {
        domestic: 12,
        international: 35,
        expedited: 20
      }
    },
    {
      id: 3,
      title: "Botanical Series IV",
      artist: {
        id: 3,
        name: "Elena Rodriguez",
        slug: "elena-rodriguez",
        bio: "Botanical watercolor artist inspired by nature's intricate details.",
        profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        verified: true,
        location: "Barcelona, ES",
        totalWorks: 15
      },
      medium: "Watercolor",
      dimensions: "28×42cm",
      year: 2024,
      prices: { GBP: 320, ETH: 0.085, USD: 402 },
      images: [
        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=800&fit=crop"
      ],
      description: "The fourth piece in the beloved Botanical Series, featuring delicate watercolor techniques that capture nature's ephemeral beauty.",
      isAvailable: false,
      isOriginal: true,
      hasQR: true,
      views: 156,
      edition: "1/1",
      weight: "1.2kg",
      materials: ["Watercolor", "Paper", "Frame"],
      tags: ["watercolor", "botanical", "nature"],
      provenance: [
        { date: "2024-01-10", event: "Created", owner: "Artist Studio" },
        { date: "2024-01-25", event: "Sold", owner: "Private Collection" }
      ],
      shipping: {
        domestic: 10,
        international: 30,
        expedited: 18
      }
    },
    {
      id: 4,
      title: "Industrial Dreams",
      artist: {
        id: 4,
        name: "David Kim",
        slug: "david-kim",
        bio: "Contemporary photographer capturing urban landscapes.",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
        verified: false,
        location: "Tokyo, JP",
        totalWorks: 6
      },
      medium: "Photography Print",
      dimensions: "40×60cm",
      year: 2024,
      prices: { GBP: 180, ETH: 0.048, USD: 226 },
      images: [
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=800&fit=crop"
      ],
      description: "A striking photograph that captures the beauty in industrial architecture.",
      isAvailable: true,
      isOriginal: true,
      hasQR: false,
      views: 98,
      edition: "5/10",
      weight: "0.5kg",
      materials: ["Photo Paper", "Frame"],
      tags: ["photography", "industrial", "architecture"],
      provenance: [
        { date: "2024-03-01", event: "Created", owner: "Artist Studio" }
      ],
      shipping: {
        domestic: 8,
        international: 25,
        expedited: 15
      }
    }
  ];

  // Find the artwork by ID
  const artwork = artworks.find(art => art.id === parseInt(id));

  // If artwork not found, show 404
  if (!artwork) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Artwork Not Found</h1>
          <p className="text-gray-400 mb-8">The artwork you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/gallery" className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  // Related artworks - filter out current artwork and take 3 others
  const relatedArtworks = artworks
    .filter(art => art.id !== parseInt(id))
    .slice(0, 3)
    .map(art => ({
      id: art.id,
      title: art.title,
      artist: art.artist.name,
      artistSlug: art.artist.slug,
      prices: art.prices,
      image: art.images[0],
      isAvailable: art.isAvailable
    }));

  const formatPrice = (prices: ArtworkPrices, currency: string) => {
    const symbols = { GBP: '£', USD: '$', ETH: '' };
    const suffix = currency === 'ETH' ? ' ETH' : '';
    return `${symbols[currency as keyof typeof symbols]}${prices[currency as keyof ArtworkPrices]}${suffix}`;
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out "${artwork.title}" by ${artwork.artist.name} on Dead Horse Gallery`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
    setShowShareModal(false);
  };

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'provenance', label: 'Provenance' },
    { id: 'shipping', label: 'Shipping' }
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="hidden md:flex space-x-6 flex-1 justify-end pr-8">
              <Link href="/gallery" className="hover:text-gray-300 transition-colors">Gallery</Link>
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

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
            <span>/</span>
            <span className="text-white">{artwork.title}</span>
          </div>

          <Link href="/gallery" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Gallery</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="aspect-square rounded-lg overflow-hidden mb-6 bg-gray-900 relative">
                <Image
                  src={artwork.images[selectedImageIndex]}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                />
                
                {/* Image Controls */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <ProtectedSave
                    onClick={() => setIsLiked(!isLiked)}
                    metadata={{ 
                      artworkId: artwork.id, 
                      artworkTitle: artwork.title,
                      currentStatus: isLiked ? 'liked' : 'not_liked'
                    }}
                    className="bg-black/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black transition-colors"
                  >
                    <HeartIcon className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} filled={isLiked} />
                  </ProtectedSave>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-black/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                  {artwork.hasQR && (
                    <ProtectedVerify
                      onClick={() => setShowQRModal(true)}
                      metadata={{ 
                        artworkId: artwork.id, 
                        artworkTitle: artwork.title,
                        feature: 'blockchain_verification'
                      }}
                      className="bg-black/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black transition-colors"
                    >
                      <QrCodeIcon className="w-5 h-5" />
                    </ProtectedVerify>
                  )}
                </div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {artwork.hasQR && (
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
              </div>

              {/* Thumbnail Gallery */}
              {artwork.images.length > 1 && (
                <div className="flex space-x-3 mb-8">
                  {artwork.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-white' : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${artwork.title} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Tabbed Interface */}
              <div className="mb-8">
                <div className="flex space-x-1 mb-6 bg-gray-900 rounded-lg p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-black'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-gray-900 rounded-lg p-6">
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                        <p className="text-gray-300 leading-relaxed">{artwork.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Specifications</h4>
                          <div className="space-y-2 text-sm text-gray-400">
                            <p><span className="text-white">Medium:</span> {artwork.medium}</p>
                            <p><span className="text-white">Dimensions:</span> {artwork.dimensions}</p>
                            <p><span className="text-white">Year:</span> {artwork.year}</p>
                            <p><span className="text-white">Edition:</span> {artwork.edition}</p>
                            {artwork.weight && <p><span className="text-white">Weight:</span> {artwork.weight}</p>}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Materials</h4>
                          <ul className="space-y-1 text-sm text-gray-400">
                            {artwork.materials.map((material, index) => (
                              <li key={index}>• {material}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {artwork.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'provenance' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4">Artwork History</h3>
                      <div className="space-y-4">
                        {artwork.provenance.map((entry, index) => (
                          <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-700 last:border-b-0">
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium">{entry.event}</p>
                              <p className="text-sm text-gray-400">{entry.owner}</p>
                              <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-700">
                          <div>
                            <p className="font-medium">Domestic Shipping (UK)</p>
                            <p className="text-sm text-gray-400">Standard delivery 3-5 business days</p>
                          </div>
                          <p className="font-medium">£{artwork.shipping.domestic}</p>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 border-b border-gray-700">
                          <div>
                            <p className="font-medium">International Shipping</p>
                            <p className="text-sm text-gray-400">Standard delivery 7-14 business days</p>
                          </div>
                          <p className="font-medium">£{artwork.shipping.international}</p>
                        </div>
                        
                        <div className="flex justify-between items-center py-3">
                          <div>
                            <p className="font-medium">Expedited Shipping</p>
                            <p className="text-sm text-gray-400">Express delivery 1-3 business days</p>
                          </div>
                          <p className="font-medium">£{artwork.shipping.expedited}</p>
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Important Notes</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• All artworks are professionally packaged</li>
                          <li>• Insurance included for full artwork value</li>
                          <li>• Customs duties may apply for international orders</li>
                          <li>• White glove delivery available upon request</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Purchase & Artist Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Artwork Info */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
                  <Link 
                    href={`/artist/${artwork.artist.slug}`}
                    className="text-gray-400 hover:text-white transition-colors text-lg"
                  >
                    by {artwork.artist.name}
                    {artwork.artist.verified && (
                      <span className="inline-block w-4 h-4 bg-blue-500 rounded-full ml-2 align-middle">
                        <CheckIcon className="w-3 h-3 text-white m-0.5" />
                      </span>
                    )}
                  </Link>
                  <p className="text-gray-500 mt-2">{artwork.medium} • {artwork.year}</p>
                </div>

                {/* Price & Currency */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold">
                      {formatPrice(artwork.prices, selectedCurrency)}
                    </div>
                    <div className="bg-gray-800 rounded-full p-1 inline-flex">
                      {['GBP', 'USD', 'ETH'].map((currency) => (
                        <button
                          key={currency}
                          onClick={() => setSelectedCurrency(currency)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
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

                  {artwork.isAvailable ? (
                    <div className="space-y-4">
                      {/* Quantity Selector for Prints */}
                      {!artwork.isOriginal && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Quantity:</span>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => setQuantity(quantity + 1)}
                              className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      <ProtectedPurchase 
                        onClick={() => {
                          // Add to cart logic
                          log.userAction('Adding to cart', { artworkTitle: artwork.title });
                        }}
                        metadata={{ 
                          artworkId: artwork.id, 
                          artworkTitle: artwork.title,
                          price: formatPrice(artwork.prices, selectedCurrency),
                          action: 'add_to_cart'
                        }}
                        className="w-full bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Add to Cart
                      </ProtectedPurchase>
                      <ProtectedPurchase 
                        onClick={() => {
                          // Buy now logic
                          log.payment('Buy now initiated', { artworkTitle: artwork.title });
                        }}
                        metadata={{ 
                          artworkId: artwork.id, 
                          artworkTitle: artwork.title,
                          price: formatPrice(artwork.prices, selectedCurrency),
                          action: 'buy_now'
                        }}
                        className="w-full bg-gray-800 text-white py-3 rounded-full font-semibold hover:bg-gray-700 transition-colors"
                      >
                        Buy Now
                      </ProtectedPurchase>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-red-500 text-white py-3 rounded-full font-semibold mb-3">
                        Sold Out
                      </div>
                      <button className="w-full bg-gray-800 text-gray-400 py-2 rounded-full text-sm">
                        Notify When Similar Available
                      </button>
                    </div>
                  )}
                </div>

                {/* Artist Info */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">About the Artist</h3>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800">
                      <Image
                        src={artwork.artist.profileImage}
                        alt={artwork.artist.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/artist/${artwork.artist.slug}`} className="font-semibold hover:text-gray-300 transition-colors">
                        {artwork.artist.name}
                      </Link>
                      <p className="text-sm text-gray-400">{artwork.artist.location}</p>
                      <p className="text-sm text-gray-500">{artwork.artist.totalWorks} works</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{artwork.artist.bio}</p>
                  <div className="space-y-2">
                    <Link 
                      href={`/artist/${artwork.artist.slug}`}
                      className="inline-block w-full text-center bg-gray-800 text-white py-2 rounded-full text-sm hover:bg-gray-700 transition-colors"
                    >
                      View Artist Profile
                    </Link>
                    <ProtectedContact
                      onClick={() => {
                        // Contact artist logic
                        log.userAction('Contacting artist', { artistName: artwork.artist.name });
                      }}
                      metadata={{ 
                        artistId: artwork.artist.id,
                        artistName: artwork.artist.name,
                        artworkId: artwork.id, 
                        artworkTitle: artwork.title
                      }}
                      className="w-full bg-white text-black py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Contact Artist
                    </ProtectedContact>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Artwork Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Views</span>
                      <span>{artwork.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Listed</span>
                      <span>3 days ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID</span>
                      <span>#{artwork.id.toString().padStart(6, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Works Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArtworks.map((relatedArtwork) => (
                <Link key={relatedArtwork.id} href={`/artwork/${relatedArtwork.id}`} className="group">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-900">
                    <Image
                      src={relatedArtwork.image}
                      alt={relatedArtwork.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {!relatedArtwork.isAvailable && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Sold
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold group-hover:text-gray-300 transition-colors">{relatedArtwork.title}</h3>
                  <p className="text-gray-400 text-sm">{relatedArtwork.artist}</p>
                  <p className="font-semibold">{formatPrice(relatedArtwork.prices, selectedCurrency)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Blockchain Certificate</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg mb-6 inline-block">
                <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                  <QrCodeIcon className="w-16 h-16 text-gray-600" />
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Scan this QR code to view the blockchain certificate and verify authenticity.
              </p>
              <button
                onClick={() => setShowQRModal(false)}
                className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Share Artwork</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleShare('twitter')}
                className="w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 transition-colors"
              >
                Share on Twitter
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full bg-blue-700 text-white py-3 rounded-full hover:bg-blue-800 transition-colors"
              >
                Share on Facebook
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="w-full bg-gray-800 text-white py-3 rounded-full hover:bg-gray-700 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-white text-black w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg z-40"
        aria-label="Back to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  );
}
