'use client';

// src/app/apply/page.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
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
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string[]>([]);

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
    
    if (files.length + formData.portfolio_images.length > 6) {
      setError('Maximum 6 images allowed');
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
    
    setFormData({
      ...formData,
      portfolio_images: [...formData.portfolio_images, ...files]
    });
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
    setError('');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'portfolio_images') {
          submitData.append(key, value as string);
        }
      });

      // Add images
      formData.portfolio_images.forEach((file, index) => {
        submitData.append(`portfolio_image_${index}`, file);
      });

      // Get auth token (we'll implement this properly when we have Magic working)
      // For now, we'll just send without auth token for testing
      const response = await fetch('http://localhost:3001/api/artists/apply', {
        method: 'POST',
        headers: {
          // We'll add auth header once Magic is working properly
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: submitData
      });

      if (response.ok) {
        const result = await response.json();
        
        // For now, just show success message
        alert('Application submitted successfully! Payment integration coming next.');
        console.log('Application result:', result);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Application submission failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Application submission error:', err);
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
          <p className="text-lg text-gray-500">Application Fee: £50 • Review Time: 48 hours</p>
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
            </div>

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

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Application Fee Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Application Process</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• £50 application fee (covers curation costs)</li>
                <li>• Applications reviewed within 48 hours</li>
                <li>• Detailed feedback provided for all applications</li>
                <li>• Successful artists invited to list artworks immediately</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting || formData.portfolio_images.length < 3}
                className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {submitting ? 'Submitting Application...' : 'Submit Application & Pay £50'}
              </button>
              
              {formData.portfolio_images.length < 3 && (
                <p className="text-red-600 text-sm mt-2">Please upload at least 3 portfolio images</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistApplicationPage;