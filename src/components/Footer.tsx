import React from 'react';
import { Trophy, Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 mr-3 text-blue-500" />
              <div>
                <h3 className="font-bold text-xl text-white">BasketClub</h3>
                <p className="text-sm text-blue-400">Manager</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Streamline your basketball club management with our comprehensive solution for tracking players, schedules, and performance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/students" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Players
                </a>
              </li>
              <li>
                <a href="/trainers" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Trainers
                </a>
              </li>
              <li>
                <a href="/attendance" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Attendance
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                <a href="mailto:support@basketclub.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                  support@basketclub.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-blue-400 transition-colors">
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-blue-400" />
                <span className="text-gray-400">
                  123 Sports Avenue, CA 90210
                </span>
              </li>
              <li className="flex items-center">
                <Globe className="w-5 h-5 mr-3 text-blue-400" />
                <a href="https://www.basketclub.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                  www.basketclub.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-pink-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-2">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 flex items-center">
              © {new Date().getFullYear()} BasketClub Manager. All rights reserved.
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <span className="text-sm text-gray-400 flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> by BasketClub Team
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};