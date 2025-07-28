'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SurveyResponse {
  userType: string;
  artEngagement: string;
  web3Comfort: string;
  purchaseFrequency: string;
  trustFactors: string[];
  primaryConcern: string;
}

export default function ResearchSurvey() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<SurveyResponse>({
    userType: '',
    artEngagement: '',
    web3Comfort: '',
    purchaseFrequency: '',
    trustFactors: [],
    primaryConcern: '',
  });

  const updateResponse = (key: keyof SurveyResponse, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('researchResponses', JSON.stringify(responses));
      
      if (responses.userType === 'artist') {
        router.push('/research/artist-flow');
      } else if (responses.userType === 'collector') {
        router.push('/research/collector-flow');
      } else {
        router.push('/research/curious-flow');
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return responses.userType !== '';
      case 2: return responses.artEngagement !== '';
      case 3: return responses.web3Comfort !== '';
      case 4: return responses.purchaseFrequency !== '';
      case 5: return responses.trustFactors.length > 0;
      case 6: return responses.primaryConcern !== '';
      default: return false;
    }
  };

  const handleTrustFactorChange = (factor: string) => {
    const current = responses.trustFactors;
    if (current.includes(factor)) {
      updateResponse('trustFactors', current.filter(f => f !== factor));
    } else {
      updateResponse('trustFactors', [...current, factor]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Question {currentStep} of 6</span>
              <span>{Math.round((currentStep / 6) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">First, tell us about yourself</h2>
              <p className="text-gray-300 text-lg mb-8">
                This helps us show you relevant information about Dead Horse Gallery.
              </p>
              
              <div className="space-y-4">
                {[
                  { value: 'artist', label: 'Artist/Creator', desc: 'I create and sell art professionally or as hobby' },
                  { value: 'collector', label: 'Art Collector', desc: 'I regularly purchase art (digital or physical)' },
                  { value: 'enthusiast', label: 'Art Enthusiast', desc: 'I love art but don\'t often purchase' },
                  { value: 'curious', label: 'Just Curious', desc: 'I\'m new to art but interested in learning' }
                ].map(option => (
                  <label key={option.value} className="block">
                    <input
                      type="radio"
                      name="userType"
                      value={option.value}
                      checked={responses.userType === option.value}
                      onChange={(e) => updateResponse('userType', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      responses.userType === option.value 
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-gray-400 text-sm">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">How do you currently engage with art?</h2>
              
              <div className="space-y-4">
                {[
                  { value: 'galleries', label: 'Physical galleries and exhibitions' },
                  { value: 'online', label: 'Online galleries and marketplaces' },
                  { value: 'social', label: 'Social media (Instagram, TikTok, etc.)' },
                  { value: 'nft', label: 'NFT platforms (OpenSea, Foundation, etc.)' },
                  { value: 'mixed', label: 'Mix of physical and digital' },
                  { value: 'limited', label: 'Limited engagement, but interested' }
                ].map(option => (
                  <label key={option.value} className="block">
                    <input
                      type="radio"
                      name="artEngagement"
                      value={option.value}
                      checked={responses.artEngagement === option.value}
                      onChange={(e) => updateResponse('artEngagement', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      responses.artEngagement === option.value 
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}>
                      {option.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">How comfortable are you with blockchain/Web3?</h2>
              <p className="text-gray-300">
                Don't worry if you're not familiar - we're designed to be accessible to everyone!
              </p>
              
              <div className="space-y-4">
                {[
                  { value: 'expert', label: 'Very Comfortable', desc: 'I regularly use DeFi, NFTs, and crypto' },
                  { value: 'familiar', label: 'Somewhat Familiar', desc: 'I own crypto but limited Web3 experience' },
                  { value: 'beginner', label: 'Beginner', desc: 'I\'ve heard of it but don\'t understand much' },
                  { value: 'skeptical', label: 'Skeptical', desc: 'I have concerns about blockchain technology' },
                  { value: 'avoid', label: 'Prefer to Avoid', desc: 'I prefer traditional methods' }
                ].map(option => (
                  <label key={option.value} className="block">
                    <input
                      type="radio"
                      name="web3Comfort"
                      value={option.value}
                      checked={responses.web3Comfort === option.value}
                      onChange={(e) => updateResponse('web3Comfort', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      responses.web3Comfort === option.value 
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-gray-400 text-sm">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">How often do you purchase art?</h2>
              <p className="text-gray-300">
                This includes prints, originals, digital art, or any creative works.
              </p>
              
              <div className="space-y-4">
                {[
                  { value: 'monthly', label: 'Monthly or more' },
                  { value: 'quarterly', label: 'Several times per year' },
                  { value: 'yearly', label: 'Once or twice per year' },
                  { value: 'rarely', label: 'Every few years' },
                  { value: 'never', label: 'I don\'t buy art but I\'m interested' },
                  { value: 'sell', label: 'I sell more than I buy' }
                ].map(option => (
                  <label key={option.value} className="block">
                    <input
                      type="radio"
                      name="purchaseFrequency"
                      value={option.value}
                      checked={responses.purchaseFrequency === option.value}
                      onChange={(e) => updateResponse('purchaseFrequency', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      responses.purchaseFrequency === option.value 
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}>
                      {option.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">What makes you trust an art platform?</h2>
              <p className="text-gray-300 mb-6">Select all that are important to you:</p>
              
              <div className="space-y-4">
                {[
                  'Expert curation by art professionals',
                  'Anti-speculation, art-first community focus', 
                  'Established gallery partnerships',
                  'Transparent team with art world credentials',
                  'Clear authentication and provenance tracking',
                  'Strong buyer protection policies',
                  'Community recommendations and reviews',
                  'Secure payment processing',
                  'Physical verification methods (QR codes, certificates)',
                  'Platform longevity and stability'
                ].map(factor => (
                  <label key={factor} className="block">
                    <input
                      type="checkbox"
                      checked={responses.trustFactors.includes(factor)}
                      onChange={() => handleTrustFactorChange(factor)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      responses.trustFactors.includes(factor)
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}>
                      {factor}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">What's your biggest concern about online art platforms?</h2>
              
              <div className="space-y-4">
                {[
                  { value: 'authenticity', label: 'Art authenticity and forgeries' },
                  { value: 'quality', label: 'Artwork quality different from photos' },
                  { value: 'security', label: 'Payment security and fraud' },
                  { value: 'complexity', label: 'Technical complexity (wallets, crypto, etc.)' },
                  { value: 'speculation', label: 'Too much speculation/investment focus vs art appreciation' },
                  { value: 'sustainability', label: 'Platform stability and longevity' },
                  { value: 'support', label: 'Poor customer service' },
                  { value: 'pricing', label: 'Unclear or unfair pricing' },
                  { value: 'legal', label: 'Unclear legal rights and ownership' },
                  { value: 'none', label: 'I don\'t have major concerns' }
                ].map(option => (
                  <label key={option.value} className="block">
                    <input
                      type="radio"
                      name="primaryConcern"
                      value={option.value}
                      checked={responses.primaryConcern === option.value}
                      onChange={(e) => updateResponse('primaryConcern', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      responses.primaryConcern === option.value 
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}>
                      {option.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-12">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-3 bg-white text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-semibold"
            >
              {currentStep === 6 ? 'See Personalized Experience' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}