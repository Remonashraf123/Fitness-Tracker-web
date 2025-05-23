import React from 'react';
import { CameraIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const FoodScanner: React.FC = () => {
  const handleCamera = () => {
    // TODO: Implement camera functionality
  };

  const handleUpload = () => {
    // TODO: Implement file upload
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">AI Food Scanner</h1>
      <p className="text-gray-600 mb-8">Scan your food to get nutrition information</p>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Scan Your Food</h2>

        <button
          onClick={handleCamera}
          className="w-full bg-emerald-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <CameraIcon className="w-6 h-6" />
          Use Camera
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={handleUpload}
          className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <ArrowUpTrayIcon className="w-6 h-6" />
          Upload Image
        </button>
      </div>
    </div>
  );
};

export default FoodScanner;
