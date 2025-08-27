import React from 'react';
import { HeartHandshake } from 'lucide-react';

const Step4Social = ({
  formData = {},
  onWebsiteChange,
  onFacebookChange,
  onTikTokChange,
  onLinkedInChange,
  onPrevious,
  onSubmit,
  isLoading = false,
}) => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-blue-600">
            Connect With the World
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Add your school’s official social links and website
          </p>
          <div className="mt-4 w-20 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-8 md:p-12">
            {/* Progress */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step 4 of 4</span>
                <span>100% Complete</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-full bg-blue-500 transition-all duration-500 ease-out" />
              </div>
            </div>

            {/* Social Links Form */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-4 flex items-center">
                <div className="w-2 h-8 bg-blue-500 rounded-full mr-3" />
                Social Media & Website
              </h2>
              <p className="text-gray-600 mb-8">
                Share your online presence so students, parents, and staff can
                easily find you.
              </p>

              <div className="space-y-6">
                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Official Website
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={onWebsiteChange}
                    placeholder="https://www.myschool.edu"
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Page
                  </label>
                  <input
                    type="url"
                    value={formData.facebook || ''}
                    onChange={onFacebookChange}
                    placeholder="https://www.facebook.com/myschool"
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* TikTok */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="url"
                    value={formData.tiktok || ''}
                    onChange={onTikTokChange}
                    placeholder="https://www.tiktok.com/@myschool"
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin || ''}
                    onChange={onLinkedInChange}
                    placeholder="https://www.linkedin.com/school/myschool"
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Friendly Support Message */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-10 flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <HeartHandshake className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  No links yet? No worries.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  It’s perfectly fine if you don’t have a website or social
                  pages yet. We’d be happy to help you create them — <span className="font-medium text-blue-600">at no cost</span>.
                  Just reach out at{" "}
                  <a
                    href="mailto:support@yourschoolapp.com"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    support@schoolheadoffice.com
                  </a>{" "}
                  whenever you’re ready. No pressure.
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-8 border-t border-gray-200 flex justify-between items-center">
              <button
                type="button"
                onClick={onPrevious}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                ← Previous Step
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={isLoading}
                className={`px-8 py-3 rounded-lg font-bold text-white transition ${
                  isLoading
                    ? 'bg-blue-300 cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isLoading ? 'Submitting...' : 'Finish & Create School →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Social;
