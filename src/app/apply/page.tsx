'use client';

// src/app/apply/page.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import { useHybridAuth } from '../../contexts/HybridAuthContext';
import { useRouter } from 'next/navigation';
import { usePayment } from '../../hooks/usePayment';
import { PaymentFormWrapper } from '../../components/PaymentForm';
import { uploadPortfolio } from '../../lib/supabase';
import type { SupabaseUploadResult, MagicUser } from '../../types/supabase';
import type { ApplicationFormError } from '../../types/payment';

import { log } from '@/lib/logger';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_IMAGES = 3;
const MAX_IMAGES = 6;
const APPLICATION_FEE = 50.00; // Application fee in USD

interface FormData {
  portfolio_url: string;
  instagram_handle: string;
  artistic_statement: string;
  experience_level: string;
  art_medium: string;
  years_creating: string;
  exhibition_history: string;
  why_dead_horse: string;
  portfolio_images: File[];
}

const ArtistApplicationPage = () => {
  const { user, isAuthenticated, loading } = useHybridAuth();
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  // Cleanup image preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      imagePreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreview]);

  const [formData, setFormData] = useState<FormData>({
    portfolio_url: '',
    instagram_handle: '',
    artistic_statement: '',
    experience_level: '',
    art_medium: '',
    years_creating: '',
    exhibition_history: '',
    why_dead_horse: '',
    portfolio_images: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApplicationFormError | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { initiatePayment, isLoading: paymentLoading } = usePayment();

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to apply as an artist.</p>
          <button
            onClick={() => router.push('/test-auth')}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-black"></div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + formData.portfolio_images.length > MAX_IMAGES) {
      setError({
        type: 'validation',
        message: `Maximum ${MAX_IMAGES} images allowed`
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setError({
          type: 'validation',
          message: error
        });
        return;
      }
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
    
    setFormData({
      ...formData,
      portfolio_images: [...formData.portfolio_images, ...files]
    });
    
    setError(null);
  };

  const removeImage = (index: number) => {
    const newImages = formData.portfolio_images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setFormData({ ...formData, portfolio_images: newImages });
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (
        !user ||
        typeof user !== 'object' ||
        typeof ((user as unknown) as MagicUser).getIdToken !== 'function'
      ) {
        setError({
          type: 'validation',
          message: 'You must be logged in to submit an application'
        });
        setSubmitting(false);
        return;
      }
      const magicUser = user as unknown as MagicUser;

      // If payment hasn't been initiated yet, start the payment flow
      if (!showPayment) {
        const secret = await initiatePayment(APPLICATION_FEE);
        setClientSecret(secret);
        setShowPayment(true);
        setSubmitting(false);
        return;
      }

      // If we get here, payment was successful and we can submit the application
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'portfolio_images') {
          submitData.append(key, value as string);
        }
      });

      // Upload portfolio images to Supabase
      const uploadPromises = formData.portfolio_images.map(file => 
        uploadPortfolio(file, magicUser.issuer)
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      const portfolioUrls = uploadResults.map((result: SupabaseUploadResult) => result.path);

      // Add image URLs to form data
      submitData.append('portfolio_urls', JSON.stringify(portfolioUrls));

      const response = await fetch('/api/artists/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await ((user as unknown) as MagicUser).getIdToken()}`,
        },
        body: submitData
      });

      if (response.ok) {
        router.push('/thank-you');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Application submission failed');
      }
    } catch (err) {
      const error = err as Error;
      setError({
        type: 'submission',
        message: error.message || 'An unexpected error occurred'
      });
      log.error('Application submission error:', { error: error });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Apply to Dead Horse Gallery</h1>
          <p className="text-xl text-gray-600 mb-2">Join our curated collection of exceptional artists</p>
          <p className="text-lg text-gray-500">Application Fee: ${APPLICATION_FEE.toFixed(2)} • Review Time: 48 hours</p>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Artist Information Section */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Artist Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Website URL
                </label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="@yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select experience level</option>
                  <option value="emerging">Emerging Artist (0-3 years)</option>
                  <option value="established">Established Artist (3-10 years)</option>
                  <option value="professional">Professional Artist (10+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Medium *
                </label>
                <select
                  name="art_medium"
                  value={formData.art_medium}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select primary medium</option>
                  <option value="painting">Painting</option>
                  <option value="drawing">Drawing</option>
                  <option value="sculpture">Sculpture</option>
                  <option value="photography">Photography</option>
                  <option value="mixed_media">Mixed Media</option>
                  <option value="digital">Digital Art</option>
                  <option value="printmaking">Printmaking</option>
                  <option value="ceramics">Ceramics</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Portfolio Images Section */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Portfolio Images</h2>
            <p className="text-gray-600 mb-4">Upload 3-6 high-quality images of your best work (Max 5MB each)</p>
          </div>

          {/* Portfolio Upload Info */}
          <div className="mt-8">
            <p className="text-gray-600 mb-4">
              Please upload 3-6 high-quality images that best represent your work. Each image should be under 5MB.
            </p>
          </div>
            
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Image Previews */}
          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative">
                  <Image
                    src={preview}
                    alt={`Portfolio piece ${index + 1}`}
                    width={300}
                    height={160}
                    className="w-full h-40 object-cover rounded-lg"
                    unoptimized={true} // Since these are blob URLs from file input
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Artist Statement Section */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">About Your Work</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artistic Statement * (300-500 words)
                </label>
                <textarea
                  name="artistic_statement"
                  value={formData.artistic_statement}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Describe your artistic practice, influences, and what drives your work..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exhibition History
                </label>
                <textarea
                  name="exhibition_history"
                  value={formData.exhibition_history}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="List your most significant exhibitions, shows, or achievements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why Dead Horse Gallery? * (100-200 words)
                </label>
                <textarea
                  name="why_dead_horse"
                  value={formData.why_dead_horse}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Why do you want to be part of Dead Horse Gallery's curated collection?"
                />
              </div>
            </div>
          </div>


          {/* Application Fee Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Application Process</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• ${APPLICATION_FEE.toFixed(2)} application fee (covers curation costs)</li>
              <li>• Applications reviewed within 48 hours</li>
              <li>• Detailed feedback provided for all applications</li>
              <li>• Successful artists invited to list artworks immediately</li>
            </ul>
          </div>

          {/* Payment and Submit Section */}
          {showPayment && clientSecret ? (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Complete Payment</h2>
              <PaymentFormWrapper
                clientSecret={clientSecret}
                amount={APPLICATION_FEE}
                onSuccess={() => {
                  router.push('/thank-you');
                }}
                onError={(error) => {
                  setError({
                    type: 'payment',
                    message: error.message || 'Payment failed'
                  });
                  setShowPayment(false);
                  setClientSecret(null);
                }}
              />
            </div>
          ) : (
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting || formData.portfolio_images.length < MIN_IMAGES || paymentLoading}
                className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {submitting || paymentLoading ? 'Processing...' : `Submit Application & Pay $${APPLICATION_FEE.toFixed(2)}`}
              </button>
              
              {formData.portfolio_images.length < MIN_IMAGES && (
                <p className="text-red-600 text-sm mt-2">Please upload at least {MIN_IMAGES} portfolio images</p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error.message}
            </div>
          )}
        </form>
      </div>
      </div>
    </div>
  );
};

function validateFile(file: File): string | null {
    if (!file.type.startsWith('image/')) {
        return 'Only image files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
        return `Each image must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
}

export default ArtistApplicationPage;


