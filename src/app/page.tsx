import Link from "next/link"
import Link from 'next/link' 

"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left Side Navigation */}
            <div className="hidden md:flex space-x-6 flex-1 justify-end pr-8">
              <a href="/gallery" className="hover:text-gray-300 transition-colors">Gallery</Link>
              <a href="#zine" className="hover:text-gray-300 transition-colors">Zine</Link>
            </div>
            
            {/* Center - Dead Horse Logo */}
            
            <Link href="/" className="text-3xl font-bold hover:text-gray-300 transition-colors">
            Dead Horse
            </Link>
            
            {/* Right Side Navigation */}
            <div className="hidden md:flex space-x-6 flex-1 pl-8">
              <a href="#artists" className="hover:text-gray-300 transition-colors">For Artists</Link>
              <a href="#collectors" className="hover:text-gray-300 transition-colors">For Collectors</Link>
              <a href="#about" className="hover:text-gray-300 transition-colors">About</Link>
            </div>
            
            {/* Connect Button */}
            <button className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors ml-4">
              Connect
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            Still flogging it.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            A curated Web3 art gallery where physical meets digital. 
            Authentic artist-collector relationships, not speculation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="/gallery" className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors">
              Browse Gallery
            </Link>
            <a href="/apply" className="border border-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-colors">
              Apply as Artist
            </Link>
          </div>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/gallery" className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              Current Drop
            </Link>
            <a href="#zine" className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              Latest Articles
            </Link>
            <a href="#artists" className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              For Artists
            </Link>
            <a href="#collectors" className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              For Collectors
            </Link>
            <a href="#about" className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              About
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Drop */}
      <section id="gallery" className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/gallery" className="block">
            <h2 className="text-4xl font-bold text-center mb-16 hover:text-gray-300 transition-colors">
              Current Drop
            </h2>
          </Link>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-gray-500 group-hover:bg-gray-700 transition-colors">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded"></div>
                    <p>Artwork {i}</p>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Untitled #{i}</h3>
                <p className="text-gray-400 mb-2">Artist Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">£45 / 0.05 ETH</p>
                  <button className="text-xs text-gray-400 hover:text-white transition-colors">
                    Switch Currency
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Artists */}
      <section id="artists" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">For Artists</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold">80%</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <a href="/artist-revenue" className="hover:text-gray-300 transition-colors">
                        Keep 80% of Sales
                      </Link>
                    </h3>
                    <p className="text-gray-400">
                      We believe artists should be fairly compensated. You keep the majority of every sale.
                      <br />
                      <a href="#transparency" className="text-white hover:text-gray-300 transition-colors text-sm border-b border-gray-600 hover:border-gray-400">
                        See where our 20% goes →
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">QR</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <a href="/physical-digital" className="hover:text-gray-300 transition-colors">
                        Physical + Digital
                      </Link>
                    </h3>
                    <p className="text-gray-400">Your physical artwork gets a QR code linking to its blockchain certificate.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">©</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <a href="/copyright-protection" className="hover:text-gray-300 transition-colors">
                        You Keep Copyright
                      </Link>
                    </h3>
                    <p className="text-gray-400">
                      Full intellectual property rights remain with you, always. We use IPFS and Arweave 
                      to create immutable records of your copyright ownership that can't be altered or removed.
                    </p>
                  </div>
                </div>
              </div>
              <button className="mt-8 bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors">
                Apply Now - £50
              </button>
            </div>
            <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-600 rounded"></div>
                <p>Artist Showcase</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Collectors */}
      <section id="collectors" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center md:max-w-md mx-auto">
              <div className="text-center text-gray-500">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-600 rounded"></div>
                <p>QR Code Demo</p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6">For Collectors</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">●</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <a href="/authentic-art" className="hover:text-gray-300 transition-colors">
                        Authentic Art
                      </Link>
                    </h3>
                    <p className="text-gray-400">Every piece is curated and verified. No AI, no mass production, just real art.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">@</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <a href="/no-wallet-needed" className="hover:text-gray-300 transition-colors">
                        No Wallet Needed
                      </Link>
                    </h3>
                    <p className="text-gray-400">Start collecting with just your email. We handle the blockchain complexity.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">⬜</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <a href="/physical-ownership" className="hover:text-gray-300 transition-colors">
                        Physical Ownership
                      </Link>
                    </h3>
                    <p className="text-gray-400">Own the actual artwork with blockchain-verified authenticity via QR code.</p>
                  </div>
                </div>
              </div>
              <button className="mt-8 border border-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-colors">
                Start Collecting
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Zine Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Dead Horse Zine</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Art criticism, artist interviews, and cultural commentary. 
              The stories behind the art and the artists who create it.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <article className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-gray-500 group-hover:bg-gray-700 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded"></div>
                  <p>Featured Article</p>
                </div>
              </div>
              <span className="text-sm text-gray-400 uppercase tracking-wide">Interview</span>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-300 transition-colors">
                Artist Spotlight: Behind the Canvas
              </h3>
              <p className="text-gray-400">An intimate conversation about process, inspiration, and the intersection of physical and digital art...</p>
              <div className="mt-4 text-sm text-gray-500">5 min read</div>
            </article>

            <article className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-gray-500 group-hover:bg-gray-700 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded"></div>
                  <p>Essay</p>
                </div>
              </div>
              <span className="text-sm text-gray-400 uppercase tracking-wide">Opinion</span>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-300 transition-colors">
                Why We're Still Flogging It
              </h3>
              <p className="text-gray-400">A manifesto on authentic art relationships in the age of digital speculation and AI generation...</p>
              <div className="mt-4 text-sm text-gray-500">8 min read</div>
            </article>

            <article className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-gray-500 group-hover:bg-gray-700 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded"></div>
                  <p>Guide</p>
                </div>
              </div>
              <span className="text-sm text-gray-400 uppercase tracking-wide">Education</span>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-300 transition-colors">
                QR Codes and Blockchain: A Primer
              </h3>
              <p className="text-gray-400">Understanding how physical artworks connect to digital certificates and why it matters...</p>
              <div className="mt-4 text-sm text-gray-500">12 min read</div>
            </article>
          </div>

          <div className="text-center mt-12">
            <a href="/zine" className="inline-block border border-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-colors">
              Read More Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Transparency */}
      <section id="transparency" className="py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Where Our 20% Goes</h2>
            <p className="text-xl text-gray-300">
              We believe in complete transparency. Here's exactly how we use our platform fee 
              to support artists and build a sustainable gallery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">⚡</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Platform Operations</h3>
                  <p className="text-gray-400">Hosting, blockchain fees, payment processing, and keeping the lights on.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">○</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Curation Team</h3>
                  <p className="text-gray-400">Art experts who review applications and maintain quality standards.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">◦</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Zine & Content</h3>
                  <p className="text-gray-400">Artist interviews, cultural writing, and educational content creation.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">●</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Artist Support</h3>
                  <p className="text-gray-400">Marketing campaigns, featured placements, and promotional opportunities.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">▲</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Platform Development</h3>
                  <p className="text-gray-400">New features, security updates, and improving the user experience.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">◐</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Future Opportunities</h3>
                  <p className="text-gray-400">Gallery partnerships, exhibitions, artist residencies, and community events.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 p-6 bg-gray-900 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-center">Our Commitment</h3>
            <p className="text-gray-300 text-center leading-relaxed">
              Every penny goes back into supporting artists and building a better platform. 
              No profit extraction, no shareholders - just sustainable growth that benefits the entire community.
              We publish quarterly transparency reports showing exactly where funds are allocated.
            </p>
            <div className="text-center mt-6">
              <a href="/transparency" className="inline-block text-white hover:text-gray-300 transition-colors border-b border-gray-600 hover:border-gray-400">
                View Transparency Reports →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Questions Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-8">Let's Talk About Art</h2>
          <p className="text-xl text-gray-300 mb-8">
            We're curious about your thoughts on art, culture, and where we're heading. 
            Your perspective helps us understand what matters to artists and art lovers today.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <a href="/questions/artist" className="block bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors">
              <h3 className="text-xl font-semibold mb-3">For Artists</h3>
              <p className="text-gray-400">Share your thoughts on creating, selling, and connecting with collectors in today's art world.</p>
            </Link>
            <a href="/questions/collector" className="block bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors">
              <h3 className="text-xl font-semibold mb-3">For Art Lovers</h3>
              <p className="text-gray-400">Tell us about discovering art, what draws you in, and how you connect with pieces and artists.</p>
            </Link>
          </div>
          <div className="mt-8">
            <a href="/questions/culture" className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors">
              Art & Culture Questions
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            No forms, no data collection - just genuine curiosity about your experience with art.
          </p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-8">About Dead Horse</h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            We're building a different kind of art platform. One where artists are fairly compensated, 
            collectors own genuine pieces, and speculation takes a back seat to authentic relationships. 
            Every artwork comes with QR-coded blockchain authentication, bridging the physical and digital worlds.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div>
              <div className="text-3xl font-bold text-white mb-2">20</div>
              <p className="text-gray-400">Artworks per month</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">80%</div>
              <p className="text-gray-400">Goes to artists</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Base</div>
              <p className="text-gray-400">Low-cost blockchain</p>
            </div>
          </div>
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

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Dead Horse</h3>
              <p className="text-gray-400">Still flogging it.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Gallery</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Current Drop</Link></li>
                <li><a href="#" className="hover:text-white">Past Exhibitions</Link></li>
                <li><a href="#" className="hover:text-white">Featured Artists</Link></li>
                <li><a href="/zine" className="hover:text-white">Zine</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Artist Applications</Link></li>
                <li><a href="#" className="hover:text-white">Collector Guide</Link></li>
                <li><a href="#" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://twitter.com/deadhorsegallery" className="hover:text-white">Twitter</Link></li>
                <li><a href="https://instagram.com/deadhorsegallery" className="hover:text-white">Instagram</Link></li>
                <li><a href="https://orb.ac/@deadhorse" className="hover:text-white">Orb</Link></li>
                <li><a href="https://warpcast.com/deadhorse" className="hover:text-white">Farcaster</Link></li>
                <li><a href="https://lenster.xyz/u/deadhorse" className="hover:text-white">Lens</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Dead Horse Gallery. Built on Base.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}