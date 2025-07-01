import React from 'react';

export default function FileUpload({
  handleFileChange,
  handleSendFile,
  isLoading,
  selectedFile
}) {
  return (
    <div className="flex flex-col mt-2">
      <label className="block text-sm font-medium text-gray-200 mb-1">Upload Tab File (.txt, .gp, .pdf)</label>
      <div className="flex items-center space-x-2">
        <input
          type="file"
          accept=".txt,.gp,.gp3,.gp4,.gp5,.gpx,.pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        <button
          onClick={handleSendFile}
          disabled={isLoading || !selectedFile}
          className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50`}
        >
          {isLoading ? 'Uploading...' : 'Send File'}
        </button>
      </div>
      {selectedFile && (
        <div className="text-xs text-gray-300 mt-1">Selected: {selectedFile.name}</div>
      )}
    </div>
  );
}
