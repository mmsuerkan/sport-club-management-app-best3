import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export const Onboarding: React.FC = () => {
  const [clubName, setClubName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { setupClub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) {
      toast.error('Please upload a club logo');
      return;
    }

    setLoading(true);
    try {
      await setupClub(clubName, logoFile);
      toast.success('Club setup completed!');
    } catch (error) {
      toast.error('Failed to set up club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome!</h2>
          <p className="text-gray-500 mt-2">Let's set up your basketball club</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Club Name
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your club name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Club Logo
            </label>
            <input
              type="file"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="hidden"
              id="logo-upload"
              accept="image/*"
              required
            />
            <label
              htmlFor="logo-upload"
              className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              {logoFile ? (
                <div className="text-center">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Preview"
                    className="w-32 h-32 mx-auto mb-2 object-contain"
                  />
                  <span className="text-sm text-gray-600">{logoFile.name}</span>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload club logo</span>
                </div>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};