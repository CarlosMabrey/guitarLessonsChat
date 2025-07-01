import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiActivity, FiList, FiAlertTriangle, FiPlus, FiArrowUp, FiArrowDown, FiTrash2, FiChevronDown, FiChevronUp, FiCheck, FiRefreshCw } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';

// --- Backend API utilities ---
// Convert features array to markdown for saving
function parseFeaturesMarkdown(md) {
  const features = [];
  const blocks = md.split(/\n(?=# Task: )/g);
  let id = 1;
  for (const block of blocks) {
    const titleMatch = block.match(/^# Task: (.+)$/m);
    const typeMatch = block.match(/^## Type: (.+)$/m);
    const descMatch = block.match(/^## Description: (.+)$/m);
    const statusMatch = block.match(/^## Completion Status: (.+)$/m);
    const priorityMatch = block.match(/^## Priority: (.+)$/m);
    // Implementation Steps extraction (robust and simple)
    let steps = [];
    let issues = [];
    const lines = block.split(/\r?\n/);
    let inSteps = false;
    let inIssues = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '## Implementation Steps:') {
        inSteps = true;
        inIssues = false;
        continue;
      }
      if (line === '## Issues:') {
        inIssues = true;
        inSteps = false;
        continue;
      }
      if ((inSteps || inIssues) && (line.startsWith('##') || line.startsWith('#'))) {
        inSteps = false;
        inIssues = false;
      }
      if (inSteps) {
        const match = line.match(/^[-*] \[( |x|X)\] (.+)$/);
        if (match) {
          steps.push({ text: match[2], completed: match[1].toLowerCase() === 'x' });
        }
      }
      if (inIssues) {
        // Support both '- Issue' and '### Issue' formats
        const listMatch = line.match(/^[-*] (.+)$/);
        const headerMatch = line.match(/^### (.+)$/);
        if (listMatch) {
          issues.push(listMatch[1].trim());
        } else if (headerMatch) {
          issues.push(headerMatch[1].trim());
        }
      }
    }
    // Docs extraction
    const docsMatch = block.match(/^## Docs: (.+)$/m);
    // Get all update history lines
    let updateHistory = [];
    const historyLines = block.match(/^- (\d{4}-\d{2}-\d{2}): .+$/gm) || [];
    for (const line of historyLines) {
      updateHistory.push(line.replace(/^- /, ''));
    }
    features.push({
      id: id++,
      title: titleMatch ? titleMatch[1].trim() : '',
      type: typeMatch ? typeMatch[1].trim() : 'Feature',
      description: descMatch ? descMatch[1].trim() : '',
      status: statusMatch ? statusMatch[1].trim() : '',
      priority: priorityMatch ? priorityMatch[1].trim() : '',
      steps,
      issues,
      docs: docsMatch ? docsMatch[1].trim() : '',
      updateHistory,
      lastUpdated: updateHistory.length > 0 ? updateHistory[0].split(':')[0].replace(/\-/g, '-') : ''
    });
  }
  return features.filter(f => f.title);
}

function featuresToMarkdown(features) {
  return features.map(f => {
    const steps = f.steps && f.steps.length
      ? '## Implementation Steps:\n' + f.steps.map(
          s => `- [${s.completed ? 'x' : ' '}] ${s.text}`
        ).join('\n')
      : '';
    const issues = f.issues && f.issues.length
      ? '## Issues:\n' + f.issues.map(issue => `- ${issue}`).join('\n')
      : '';
    const history = f.updateHistory && f.updateHistory.length
      ? '## Update History:\n' + f.updateHistory.map(h => `- ${h}`).join('\n')
      : '';
    return [
      `# Task: ${f.title}`,
      f.type ? `## Type: ${f.type}` : '',
      f.description ? `## Description: ${f.description}` : '',
      f.status ? `## Completion Status: ${f.status}` : '',
      f.priority ? `## Priority: ${f.priority}` : '',
      steps,
      issues,
      f.docs ? `## Docs: ${f.docs}` : '',
      history
    ].filter(Boolean).join('\n');
  }).join('\n\n');
}

// Save features to backend API
async function saveFeaturesToAPI(features) {
  const content = featuresToMarkdown(features);
  try {
    await fetch('http://localhost:5001/api/feature-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
  } catch (err) {
    console.error('Failed to save features:', err);
    // Optionally: setFeaturesError('Failed to save features');
  }
}

// Load features from backend API
async function loadFeaturesFromAPI() {
  try {
    const res = await fetch('http://localhost:5001/api/feature-status');
    if (!res.ok) throw new Error('Failed to load features');
    const data = await res.json();
    return data.content;
  } catch (err) {
    throw err;
  }
}

// Dynamic background component similar to dashboard
const DynamicBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-indigo-800/80">

      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-indigo-800/30"></div>
    </div>
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: `${Math.random() * 300 + 100}px`,
            height: `${Math.random() * 300 + 100}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `translate(-50%, -50%)`,
            filter: 'blur(40px)',
            animation: `pulse ${Math.random() * 30 + 20}s infinite alternate`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.5); }
        }
      `}</style>
    </div>
  </div>
);

// Status card component
const StatusCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg bg-${color}-500/10`}>
        <Icon className={`text-${color}-400`} size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  </div>
);

// Feature status component
const FeatureStatusCard = ({ feature, onClick }) => {
  const { title, description, status, lastUpdated } = feature;
  const statusColor = status === 'Completed' ? 'green' : status === 'In Progress' ? 'yellow' : 'red';
  const StatusIcon = status === 'Completed' ? FiCheckCircle : status === 'In Progress' ? FiClock : FiXCircle;
  return (
    <button
      type="button"
      className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 hover:border-white/30 transition-all duration-200 shadow-sm hover:shadow-2xl hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-400/40 text-left group w-full cursor-pointer"
      onClick={onClick}
      tabIndex={0}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-200 transition-colors duration-150">{title}</h3>
        <div className={`flex items-center text-${statusColor}-400`}>
          <StatusIcon className="mr-1" />
          <span className="text-sm">{status}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      {/* Implementation Steps Checklist */}
      {feature.steps && feature.steps.length > 0 && (
        <ul className="mb-3">
          {feature.steps.map((step, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-300 mb-1">
              <span className={`inline-block w-4 h-4 mr-2 rounded border ${step.completed ? 'bg-green-400 border-green-400' : 'border-gray-400'}`} style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                {step.completed && <FiCheck className="text-white w-3 h-3" />}
              </span>
              {step.text}
            </li>
          ))}
        </ul>
      )}
      {feature.issues && feature.issues.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold text-xs text-red-300 mb-1 flex items-center gap-1">
            <FiAlertTriangle className="inline" /> Issues
          </div>
          <ul className="list-disc list-inside text-red-200 text-xs">
            {feature.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="text-xs text-gray-500">Last updated: {lastUpdated}</div>
    </button>
  );
};

// --- Feature Modal component ---
function FeatureModal({ feature, onClose, onSave, onDelete }) {
  const [edit, setEdit] = React.useState({ ...feature });
  // For UI-only step editing
  const [steps, setSteps] = React.useState(feature.steps || []);
  const [issues, setIssues] = React.useState(feature.issues || []);
  const [animatingOut, setAnimatingOut] = React.useState(false);
  const statusOptions = ['Completed', 'In Progress', 'Not Started'];
  const typeOptions = ['Feature', 'Bug', 'Improvement', 'Research'];

  // Handle outside click
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line
  }, []);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) handleClose();
  }
  function handleClose() {
    setAnimatingOut(true);
    setTimeout(() => {
      setAnimatingOut(false);
      onClose();
    }, 200);
  }
  function handleChange(e) {
    const { name, value } = e.target;
    setEdit(prev => ({ ...prev, [name]: value }));
  }
  function handleTypeChange(e) {
    setEdit(prev => ({ ...prev, type: e.target.value }));
  }
  function handleDocsChange(e) {
    setEdit(prev => ({ ...prev, docs: e.target.value }));
  }
  function handleStepChange(idx, value) {
    setSteps(s => s.map((step, i) => i === idx ? { ...step, text: value } : step));
  }
  function handleStepToggle(idx) {
    setSteps(s => s.map((step, i) => i === idx ? { ...step, completed: !step.completed } : step));
  }
  function handleAddStep() {
    setSteps(s => [...s, { text: '', completed: false }]);
  }
  function handleRemoveStep(idx) {
    setSteps(s => s.filter((_, i) => i !== idx));
  }
  function handleSave() {
    onSave({ ...edit, steps });
  }
  function handleDelete() {
    onDelete(edit.id);
  }
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all ${animatingOut ? 'opacity-0' : 'opacity-100'} duration-200`}
      style={{ backdropFilter: 'blur(8px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative transition-all duration-200 ${animatingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} glassmorphism`}
        style={{ background: 'rgba(30,30,40,0.85)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-xl focus:outline-none"
          aria-label="Close"
        >
          <FiXCircle />
        </button>
        <div className="mb-4">
          <input
            type="text"
            name="title"
            value={edit.title}
            onChange={handleChange}
            className="w-full bg-transparent border-b border-white/20 text-white text-2xl font-bold focus:outline-none focus:border-indigo-400 mb-2 transition"
            placeholder="Feature Title"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <select
              name="type"
              value={edit.type || 'Feature'}
              onChange={handleTypeChange}
              className="bg-white/10 text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {typeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              name="status"
              value={edit.status}
              onChange={handleChange}
              className="bg-white/10 text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <textarea
            name="description"
            value={edit.description}
            onChange={handleChange}
            rows={5}
            className="w-full mt-2 mb-4 p-3 rounded-lg bg-white/10 text-white text-base resize-vertical border border-white/20 focus:outline-none focus:border-indigo-400"
            placeholder="Feature description..."
          />
        </div>
        {/* Implementation Steps */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Implementation Steps:</label>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center mb-3 bg-white/5 rounded-lg p-2 transition hover:bg-indigo-900/10"
              >
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => handleStepToggle(idx)}
                  className="w-5 h-5 accent-indigo-500 mr-3 focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  value={step.text}
                  onChange={e => handleStepChange(idx, e.target.value)}
                  className="flex-1 bg-transparent border-b border-white/20 text-white text-base px-2 py-1 focus:outline-none focus:border-indigo-400"
                  placeholder="Implementation step..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="ml-3 px-2 py-1 text-sm text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddStep} className="mt-1 text-indigo-400 hover:text-indigo-200 text-xs">+ Add Step</button>
          </div>
        </div> 
        <div className="mb-4">
          <label className="text-xs text-gray-400">Docs link (optional):</label>
          <input
            type="text"
            name="docs"
            value={edit.docs || ''}
            onChange={handleDocsChange}
            className="w-full bg-white/10 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            placeholder="e.g. docs/core-ui-components.md"
          />
          {edit.docs && edit.docs.trim() && (
            <a
              href={`/${edit.docs}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-indigo-300 hover:text-indigo-100 text-xs underline"
            >
              Open Documentation
            </a>
          )}
        </div>
        <div className="mb-6">
          <label className="text-xs text-gray-400">Last updated:</label>
          <input
            type="text"
            name="lastUpdated"
            value={edit.lastUpdated}
            onChange={handleChange}
            className="bg-transparent border-b border-white/10 text-gray-200 text-sm px-2 py-1 focus:outline-none focus:border-indigo-400 w-40"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleDelete}
            className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >Delete</button>
          <button
            onClick={handleSave}
            className="bg-indigo-500/80 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >Save</button>
        </div>
      </div>
      {/* Overlay blur and dark background */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md -z-10 pointer-events-none" aria-hidden="true" />
    </div>
  );
}

export default function DevPage() {
  // --- Modal state for feature editing ---
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Features state for feature list
  const [features, setFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featuresError, setFeaturesError] = useState(null);
  const [featuresSaving, setFeaturesSaving] = useState(false);
  // Load features on mount
  useEffect(() => {
    setFeaturesLoading(true);
    loadFeaturesFromAPI()
      .then(md => {
        console.log('[Dev Manager] API markdown:', md);
        const parsed = parseFeaturesMarkdown(md);
        console.log('[Dev Manager] Parsed features:', parsed);
        setFeatures(parsed);
        setFeaturesLoading(false);
        setFeaturesError(null);
      })
      .catch(err => {
        console.error('[Dev Manager] Failed to load features:', err);
        setFeaturesLoading(false);
        if (
          err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('ECONNREFUSED')
        ) {
          setFeaturesError('API server not found');
        } else {
          setFeaturesError('Failed to load features: ' + err.message);
        }
      });
  }, []);

  // Open modal for a feature
  const handleOpenFeature = (feature) => {
    setSelectedFeature(feature);
    setModalVisible(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };
  // Close modal
  const handleCloseFeature = () => {
    setModalVisible(false);
    setTimeout(() => {
      setSelectedFeature(null);
      document.body.style.overflow = '';
    }, 200); // Match modal exit animation
  };

  // Save changes or add new feature
  const handleSaveFeature = (updated) => {
    setFeatures((prev) => {
      let newFeatures;
      if (updated.id === undefined) {
        const nextId = prev.length > 0 ? Math.max(...prev.map(f => f.id)) + 1 : 1;
        newFeatures = [...prev, { ...updated, id: nextId }];
      } else {
        newFeatures = prev.map(f => f.id === updated.id ? { ...f, ...updated } : f);
      }
      saveFeaturesToAPI(newFeatures);
      return newFeatures;
    });
    handleCloseFeature();
  };

  // Delete feature
  const handleDeleteFeature = (featureId) => {
    setFeatures((prev) => prev.filter(f => f.id !== featureId));
    handleCloseFeature();
  };

  // Site statistics
  function getStats() {
    // Defensive: ensure features is always an array
    const feats = Array.isArray(features) ? features : [];
    const completedFeatures = feats.filter(f => f.status === 'Completed').length;
    const inProgressFeatures = feats.filter(f => f.status === 'In Progress').length;
    const notStartedFeatures = feats.filter(f => f.status === 'Not Started').length;
    const totalFeatures = feats.length;
    return [
      { label: 'Complete', value: `${completedFeatures}/${totalFeatures}`, color: 'green', icon: FiCheckCircle },
      { label: 'In Progress', value: inProgressFeatures, color: 'yellow', icon: FiClock },
      { label: 'Not Started', value: notStartedFeatures, color: 'red', icon: FiXCircle },
      { label: 'Completion', value: totalFeatures > 0 ? `${Math.round((completedFeatures/totalFeatures)*100)}%` : '0%', color: 'indigo', icon: FiActivity },
    ];
  }

  return (
    <Layout title="Dev Manager">
      <DynamicBackground />
      {/* Hero Section */}
      <div className="relative pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Development Manager
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl md:mx-0 mx-auto">
              Track feature implementation, manage tasks, and monitor development progress
            </p>
          </div>
        </div>
      </div>
      {/* Stats Section */}
      <div className="container mx-auto px-4 max-w-6xl mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Implementation Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getStats().map((stat, index) => (
            <StatusCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              color={stat.color}
            />
          ))}
        </div>
      </div>
      {/* Features Status Section */}
      <div className="container mx-auto px-4 max-w-6xl mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Feature Status</h2>
        {featuresLoading && (
          <div className="text-white text-center py-8">Loading features...</div>
        )}
        {featuresError && (
          featuresError === 'API server not found' ? (
            <div className="bg-red-900/80 border border-red-400 rounded-lg p-4 text-red-200 text-center my-4">
              <div className="mb-2 font-semibold">Dev API server not running</div>
              <div>To start the backend API, run:</div>
              <div className="flex justify-center items-center mt-2">
                <code className="bg-black/60 px-2 py-1 rounded text-white select-all text-sm">node backend/file-api.js</code>
                <button
                  className="ml-2 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-xs"
                  onClick={() => navigator.clipboard.writeText('node backend/file-api.js')}
                >
                  Copy
                </button>
              </div>
            </div>
          ) : (
            <div className="text-red-400 text-center py-4">{featuresError}</div>
          )
        )}
        {featuresSaving && (
          <div className="text-indigo-300 text-center py-4 animate-pulse">Saving changes...</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(feature => (
            <FeatureStatusCard
              key={feature.id}
              feature={feature}
              onClick={() => handleOpenFeature(feature)}
            />
          ))}
          {/* Add Feature Card */}
          <button
            className="flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-indigo-400/40 rounded-2xl p-5 text-indigo-300 hover:bg-white/10 hover:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/40 w-full min-h-[140px]"
            onClick={() => handleOpenFeature({
              id: undefined,
              title: '',
              type: 'Feature',
              description: '',
              status: 'Not Started',
              priority: 'Medium',
              steps: [],
              docs: '',
              updateHistory: [],
              lastUpdated: ''
            })}
            aria-label="Add Feature"
            type="button"
          >
            <FiPlus size={32} className="mb-2" />
            <span className="font-semibold">Add Feature</span>
          </button>
          {selectedFeature && (
            <FeatureModal
              feature={selectedFeature}
              onClose={handleCloseFeature}
              onSave={handleSaveFeature}
              onDelete={handleDeleteFeature}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
