"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, QrCode, Heart, Share2, Eye, ExternalLink, Shield, Clock, MapPin } from 'lucide-react';
import { log } from '@/lib/logger';

interface ArtworkDetailProps {
  params: Promise<{ id: string }>;
}

interface PriceData {
  GBP: number;
  USD: number;
  ETH: number;
}

export default function ArtworkDetail({ params }: ArtworkDetailProps) {
  // Use React.use() to unwrap the params Promise
  const { id } = use(params);
  const [selectedCurrency, setSelectedCurrency] = useState<keyof PriceData>('GBP');
  const [isLiked, setIsLiked] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Mock data - replace with actual API call using id
  const artwork = {
    id: id,
    title: "Urban Meditation #3",
    artist: "Sarah Chen",
    artistSlug: "sarah-chen",
    medium: "Oil on Canvas",
    dimensions: "30×40cm",
    year: 2024,
    prices: { GBP: 450, ETH: 0.12, USD: 565 } as PriceData,
    images: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=800&fit=crop"
    ],
    qrLinked: true,
    views: 234,
    isAvailable: true,
    isOriginal: true,
    description: "Part of the Urban Meditation series, this piece explores the intersection of chaos and calm in metropolitan environments. Using layered oil techniques, the artist creates depth that mirrors the complexity of finding peace in urban settings.",
    tags: ["contemporary", "oil", "meditation", "urban"],
    provenance: "Created in the artist's London studio, 2024",
    certificate: "QR-linked blockchain certificate on Base network",
    shipping: "Worldwide shipping available, insured delivery",
    created: "2024-01-15",
    qrCodeId: "DH-2024-001-UC3",
    blockchainHash: "0x1234...5678",
    ipfsHash: "QmXy9Z...",
    artist_bio: "Sarah Chen is a contemporary artist based in London, known for her exploration of urban environments and mindfulness practices through oil painting."
  };

  const formatPrice = (prices: PriceData, currency: keyof PriceData) => {
    const symbols = { GBP: '£', USD: '$', ETH: '' };
    const suffix = currency === 'ETH' ? ' ETH' : '';
    return `${symbols[currency]}${prices[currency]}${suffix}`;
  };

  const handlePurchase = () => {
    // Implement purchase flow
    log.payment('Purchase artwork initiated', { 
      artworkId: artwork.id, 
      title: artwork.title,
      price: artwork.prices[selectedCurrency],
      currency: selectedCurrency
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: artwork.title,
      text: `Check out "${artwork.title}" by ${artwork.artist} on Dead Horse Gallery`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        log.info('Artwork shared via Web Share API', { artworkId: artwork.id });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        log.info('Artwork link copied to clipboard', { artworkId: artwork.id });
        // You could show a toast notification here instead of alert
      }
    } catch (error) {
      log.error('Share failed', { error, artworkId: artwork.id });
    }
  };

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

      {/* Main Content */}
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
            <span>/</span>
            <span className="text-white">{artwork.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-900">
                <Image
                  src={artwork.images[0]}
                  alt={artwork.title}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-3 gap-4">
                {artwork.images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-900 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                    <Image
                      src={image}
                      alt={`${artwork.title} view ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* QR Code Section */}
              {artwork.qrLinked && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <QrCode className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Blockchain Certificate</h3>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">QR Code ID</p>
                      <p className="font-mono">{artwork.qrCodeId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Blockchain</p>
                      <p>Base Network</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Contract</p>
                      <p className="font-mono text-xs">{artwork.blockchainHash}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">IPFS</p>
                      <p className="font-mono text-xs">{artwork.ipfsHash}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowQRScanner(true)}
                    className="w-full mt-4 border border-gray-600 px-4 py-2 rounded-lg hover:border-white transition-colors"
                  >
                    View QR Code & Certificate
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <Link href="/gallery" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Gallery</span>
                </Link>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{artwork.title}</h1>
                    <Link 
                      href={`/artist/${artwork.artistSlug}`}
                      className="text-xl text-gray-400 hover:text-white transition-colors"
                    >
                      by {artwork.artist}
                    </Link>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-3 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-2 mb-6">
                  {artwork.isOriginal && (
                    <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium">
                      Original
                    </span>
                  )}
                  {artwork.qrLinked && (
                    <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <QrCode className="w-3 h-3" />
                      <span>QR Authenticated</span>
                    </span>
                  )}
                  {artwork.isAvailable ? (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Available
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Sold
                    </span>
                  )}
                </div>
              </div>

              {/* Price and Currency */}
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">
                    {formatPrice(artwork.prices, selectedCurrency)}
                  </h3>
                  <div className="bg-gray-800 rounded-full p-1 inline-flex">
                    {(['GBP', 'USD', 'ETH'] as const).map((currency) => (
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
                  <div className="space-y-3">
                    <button 
                      onClick={handlePurchase}
                      className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Purchase Now
                    </button>
                    <button className="w-full border border-gray-600 py-3 rounded-lg font-semibold hover:border-white transition-colors">
                      Add to Cart
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-2">This artwork has been sold</p>
                    <Link 
                      href="/gallery" 
                      className="text-white hover:text-gray-300 transition-colors underline"
                    >
                      View similar works
                    </Link>
                  </div>
                )}
              </div>

              {/* Artwork Details Tabs */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex border-b border-gray-800">
                  {[
                    { id: 'details', label: 'Details' },
                    { id: 'provenance', label: 'Provenance' },
                    { id: 'shipping', label: 'Shipping' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gray-800 text-white border-b-2 border-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-gray-300 leading-relaxed">{artwork.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Medium</p>
                          <p className="font-medium">{artwork.medium}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Dimensions</p>
                          <p className="font-medium">{artwork.dimensions}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Year</p>
                          <p className="font-medium">{artwork.year}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Views</p>
                          <p className="font-medium flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {artwork.views}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-gray-400 text-sm mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {artwork.tags.map((tag) => (
                            <span key={tag} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'provenance' && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-green-400 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Authenticity Guarantee</h4>
                          <p className="text-gray-300 text-sm">{artwork.provenance}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <QrCode className="w-5 h-5 text-blue-400 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Blockchain Certificate</h4>
                          <p className="text-gray-300 text-sm">{artwork.certificate}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-purple-400 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Creation Date</h4>
                          <p className="text-gray-300 text-sm">
                            {new Date(artwork.created).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4 mt-6">
                        <h4 className="font-semibold mb-2">Artist Information</h4>
                        <p className="text-gray-300 text-sm mb-3">{artwork.artist_bio}</p>
                        <Link 
                          href={`/artist/${artwork.artistSlug}`}
                          className="text-white hover:text-gray-300 transition-colors underline text-sm"
                        >
                          View artist profile →
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-green-400 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Worldwide Shipping</h4>
                          <p className="text-gray-300 text-sm">{artwork.shipping}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">UK Delivery</p>
                          <p className="font-medium">2-3 working days</p>
                          <p className="text-sm text-gray-400">Free shipping</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">International</p>
                          <p className="font-medium">5-10 working days</p>
                          <p className="text-sm text-gray-400">£25 shipping</p>
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4 mt-6">
                        <h4 className="font-semibold mb-2">Package Includes</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Original artwork with QR authentication tag</li>
                          <li>• Certificate of authenticity</li>
                          <li>• Artist statement and care instructions</li>
                          <li>• Protective packaging and insurance</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Works */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">More by {artwork.artist}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="aspect-square bg-gray-800 rounded-lg mb-2 overflow-hidden">
                        <Image
                          src={`https://images.unsplash.com/photo-154796101777${i}?w=200&h=200&fit=crop`}
                          alt={`Related work ${i}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-sm font-medium">Urban Meditation #{i}</p>
                      <p className="text-xs text-gray-400">£{300 + i * 50}</p>
                    </div>
                  ))}
                </div>
                <Link 
                  href={`/artist/${artwork.artistSlug}`}
                  className="inline-flex items-center space-x-2 text-white hover:text-gray-300 transition-colors mt-4"
                >
                  <span>View all works by {artwork.artist}</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">QR Certificate</h3>
              <button 
                onClick={() => setShowQRScanner(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="text-black font-mono text-xs">
                  [QR CODE]<br/>
                  {artwork.qrCodeId}
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">
                Scan this QR code to verify the blockchain certificate and view additional artwork details.
              </p>
              
              <div className="space-y-2 text-xs text-gray-400">
                <p>Blockchain: Base Network</p>
                <p>Contract: {artwork.blockchainHash}</p>
                <p>IPFS: {artwork.ipfsHash}</p>
              </div>
              
              <button 
                onClick={() => setShowQRScanner(false)}
                className="w-full mt-6 bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
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