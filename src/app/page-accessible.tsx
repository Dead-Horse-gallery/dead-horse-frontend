"use client";

import Link from 'next/link'
import ProtectedAction from '@/components/ProtectedAction'
import AccessibleButton from '@/components/AccessibleButton'
import AccessibleImage from '@/components/AccessibleImage'
import AccessibleNavigation from '@/components/AccessibleNavigation'
import { NavigationItem } from '@/components/AccessibleNavigation'

const navigationItems: NavigationItem[] = [
  {
    label: 'Gallery',
    href: '/gallery',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Artists',
    href: '#artists',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: 'About',
    href: '#about',
    children: [
      { label: 'Our Story', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

export default function Home() {
  return (
    <>
      {/* Accessible Navigation */}
      <AccessibleNavigation
        items={navigationItems}
        logo={
          <div className="text-white">
            <span className="text-2xl font-bold">Dead Horse</span>
            <span className="sr-only">Gallery - Home</span>
          </div>
        }
        className="bg-black border-b border-gray-700"
      />

      {/* Hero Section */}
      <section 
        className="pt-20 min-h-screen flex items-center justify-center bg-black text-white"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 id="hero-heading" className="text-6xl md:text-8xl font-bold mb-6 text-white">
            Still flogging it.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            A curated Web3 art gallery where physical meets digital. 
            Authentic artist-collector relationships, not speculation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/gallery">
              <AccessibleButton
                variant="primary"
                size="lg"
                className="bg-white text-black hover:bg-gray-200"
              >
                <span className="flex items-center gap-2">
                  Explore Gallery
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </AccessibleButton>
            </Link>
            
            <Link href="/apply">
              <AccessibleButton
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black"
              >
                Apply as Artist
              </AccessibleButton>
            </Link>
          </div>
          
          {/* Quick Navigation */}
          <nav aria-label="Quick navigation" className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/gallery" 
              className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-2" aria-hidden="true"></span>
              Current Drop
            </Link>
            <Link 
              href="#zine" 
              className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-2" aria-hidden="true"></span>
              Latest Articles
            </Link>
            <Link 
              href="#artists" 
              className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-2" aria-hidden="true"></span>
              For Artists
            </Link>
            <Link 
              href="#collectors" 
              className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-2" aria-hidden="true"></span>
              For Collectors
            </Link>
            <Link 
              href="#about" 
              className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-2" aria-hidden="true"></span>
              About
            </Link>
          </nav>
        </div>
      </section>

      {/* Featured Drop */}
      <section id="gallery" className="py-20 border-t border-gray-800 bg-black text-white" aria-labelledby="gallery-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/gallery" className="block group">
            <h2 id="gallery-heading" className="text-4xl font-bold text-center mb-16 group-hover:text-gray-300 transition-colors">
              Current Drop
            </h2>
          </Link>
          <div className="grid md:grid-cols-3 gap-8" role="list">
            {[1, 2, 3].map((i) => (
              <article key={i} className="group cursor-pointer" role="listitem">
                <Link href={`/artwork/${i}`} className="block">
                  <AccessibleImage
                    src={`/placeholder-artwork-${i}.jpg`}
                    alt={`Artwork titled "Untitled #${i}" by Artist Name - abstract digital composition featuring geometric patterns and vibrant colors`}
                    fallbackSrc="/placeholder-image.jpg"
                    aspectRatio="square"
                    className="bg-gray-800 rounded-lg mb-4 group-hover:bg-gray-700 transition-colors"
                    width={400}
                    height={400}
                  />
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-gray-300 transition-colors">
                    Untitled #{i}
                  </h3>
                  <p className="text-gray-400 mb-2">Artist Name</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-white">£45 / 0.05 ETH</p>
                    <AccessibleButton
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Currency switch logic here
                      }}
                    >
                      Switch Currency
                    </AccessibleButton>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* For Artists */}
      <section id="artists" className="py-20 bg-gray-900 text-white" aria-labelledby="artists-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 id="artists-heading" className="text-4xl font-bold mb-6">For Artists</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join a community that values authentic artistic expression over market speculation. 
                Our curated platform connects artists directly with collectors who appreciate your work.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Direct artist-collector relationships without intermediaries</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Curated exhibitions that focus on artistic merit</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Physical and digital artwork integration</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Fair revenue sharing and transparent pricing</span>
                </li>
              </ul>
              <Link href="/apply">
                <AccessibleButton variant="primary" size="lg">
                  Apply to Exhibit
                </AccessibleButton>
              </Link>
            </div>
            <div className="relative">
              <AccessibleImage
                src="/artist-workspace.jpg"
                alt="Artist working in studio - person painting on canvas with natural lighting and art supplies visible"
                fallbackSrc="/placeholder-studio.jpg"
                aspectRatio="4/3"
                className="rounded-lg"
                width={600}
                height={450}
              />
            </div>
          </div>
        </div>
      </section>

      {/* For Collectors */}
      <section id="collectors" className="py-20 bg-black text-white" aria-labelledby="collectors-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <AccessibleImage
                src="/collector-viewing.jpg"
                alt="Art collector viewing digital artwork on tablet in modern gallery space with contemporary lighting"
                fallbackSrc="/placeholder-gallery.jpg"
                aspectRatio="4/3"
                className="rounded-lg"
                width={600}
                height={450}
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 id="collectors-heading" className="text-4xl font-bold mb-6">For Collectors</h2>
              <p className="text-xl text-gray-300 mb-8">
                Discover authentic artworks from emerging and established artists. 
                Build meaningful relationships with creators and own pieces that tell a story.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Curated selection of high-quality artworks</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Direct communication with artists</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Blockchain provenance and authenticity</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Physical and digital ownership options</span>
                </li>
              </ul>
              <Link href="/gallery">
                <AccessibleButton variant="primary" size="lg">
                  Explore Collection
                </AccessibleButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About/Philosophy */}
      <section id="about" className="py-20 bg-gray-900 text-white" aria-labelledby="about-heading">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 id="about-heading" className="text-4xl font-bold mb-8">Still flogging it.</h2>
          <p className="text-xl text-gray-300 mb-8">
            Dead Horse Gallery challenges the status quo of digital art markets. 
            We&apos;re not just another NFT platform – we&apos;re a community-driven space 
            that prioritizes artistic integrity over speculation.
          </p>
          <blockquote className="text-2xl italic text-gray-200 mb-8 border-l-4 border-blue-500 pl-6">
            &ldquo;Art should be about connection, not commerce. We&apos;re here to prove that 
            authentic relationships between artists and collectors can thrive in the digital age.&rdquo;
          </blockquote>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/about">
              <AccessibleButton variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                Our Story
              </AccessibleButton>
            </Link>
            <Link href="/contact">
              <AccessibleButton variant="ghost" size="lg" className="text-gray-300 hover:text-white">
                Get in Touch
              </AccessibleButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Protected Action Demo */}
      <section className="py-20 bg-black text-white" aria-labelledby="demo-heading">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 id="demo-heading" className="text-3xl font-bold mb-6">Experience Web3 Authentication</h2>
          <p className="text-gray-300 mb-8">
            Try our seamless authentication system that connects traditional and Web3 users.
          </p>
          <ProtectedAction intent="apply" className="inline-block">
            <AccessibleButton variant="primary" size="lg">
              Connect & Explore
            </AccessibleButton>
          </ProtectedAction>
        </div>
      </section>
    </>
  );
}
