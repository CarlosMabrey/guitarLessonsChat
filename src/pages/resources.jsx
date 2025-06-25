import React, { useEffect, useState } from 'react';
import { FiPlus, FiExternalLink, FiYoutube } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';
import { getAllResources, addResource, removeResource } from '@/lib/resourcedb';
import { clsx } from 'clsx';

function getFavicon(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}`;
  } catch {
    return null;
  }
}

function isYouTube(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

const ResourceCard = ({ resource, onClick }) => (
  <div
    className={clsx(
      'bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col justify-between h-full',
      'group'
    )}
    onClick={() => window.open(resource.url, '_blank')}
    title={resource.title || resource.url}
  >
    <div className="flex items-center gap-3 mb-3">
      {isYouTube(resource.url) ? (
        <FiYoutube className="text-red-500 w-8 h-8" />
      ) : (
        <img
          src={getFavicon(resource.url)}
          alt="favicon"
          className="w-8 h-8 rounded"
          onError={e => (e.target.style.display = 'none')}
        />
      )}
      <div>
        <div className="font-semibold text-white truncate max-w-[200px]">{resource.title || resource.url}</div>
        <div className="text-xs text-gray-400 truncate max-w-[200px]">{resource.url}</div>
      </div>
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className="text-xs text-gray-400">Added {new Date(resource.dateAdded).toLocaleDateString()}</span>
      <FiExternalLink className="text-gray-400 group-hover:text-blue-400 transition-colors" />
    </div>
  </div>
);

const AddResourceCard = ({ onClick }) => (
  <button
    className="flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 rounded-xl h-full min-h-[140px] w-full opacity-60 hover:opacity-80 transition-all"
    onClick={onClick}
    aria-label="Add Resource"
  >
    <FiPlus className="text-4xl text-blue-400 mb-2" />
    <span className="text-gray-300">Add Resource</span>
  </button>
);

const ResourceModal = ({ open, onClose, onSave }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    try {
      new URL(url);
    } catch {
      setError('Invalid URL');
      return;
    }
    onSave({ url: url.trim(), title: title.trim() });
    setUrl('');
    setTitle('');
    setError('');
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        className="bg-[#232a3a] rounded-xl shadow-2xl p-6 w-full max-w-md relative flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <h2 className="text-xl font-bold text-gray-100 mb-2">Add Resource</h2>
        <input
          type="text"
          className="rounded-lg px-4 py-2 bg-navy-900 text-white border border-white/10 focus:border-blue-500 outline-none"
          placeholder="Resource Title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="url"
          className="rounded-lg px-4 py-2 bg-navy-900 text-white border border-white/10 focus:border-blue-500 outline-none"
          placeholder="https://example.com or YouTube link"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium mt-2"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setResources(getAllResources());
  }, [modalOpen]);

  function handleAdd(resource) {
    addResource(resource);
    setResources(getAllResources());
  }

  return (
    <Layout title="Resources">
      <div className="container mx-auto px-4 max-w-6xl py-12 min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-8">Resources</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resources.length === 0 ? (
            <AddResourceCard onClick={() => setModalOpen(true)} />
          ) : (
            <>
              {resources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
              <AddResourceCard onClick={() => setModalOpen(true)} />
            </>
          )}
        </div>
        <ResourceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleAdd}
        />
      </div>
    </Layout>
  );
}
