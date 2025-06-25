import React, { useState } from 'react';

/**
 * RoutineForm - Standard routine creation form for Practice Page
 * Fields: title, description, steps (dynamic list)
 * Props:
 *   - onSubmit: function({ title, description, steps })
 *   - onCancel: function (optional)
 */
export default function RoutineForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState(['']);
  const [error, setError] = useState(null);

  const handleStepChange = (idx, value) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? value : s)));
  };

  const addStep = () => setSteps((prev) => [...prev, '']);
  const removeStep = (idx) => setSteps((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || steps.some((s) => !s.trim())) {
      setError('Please enter a title and all steps.');
      return;
    }
    onSubmit({ title: title.trim(), description: description.trim(), steps: steps.map(s => s.trim()) });
    setTitle('');
    setDescription('');
    setSteps(['']);
    setError(null);
  };

  return (
    <form className="bg-navy-900 p-4 rounded-xl shadow-lg" onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold text-white mb-4">Create New Routine</h3>
      {error && <div className="mb-2 text-red-400">{error}</div>}
      <div className="mb-3">
        <label className="block text-sm text-blue-200 mb-1">Title</label>
        <input
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700 focus:outline-none focus:border-blue-500"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Routine Title"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm text-blue-200 mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700 focus:outline-none focus:border-blue-500"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Short description (optional)"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm text-blue-200 mb-1">Steps</label>
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              className="flex-1 px-3 py-2 rounded bg-navy-800 text-white border border-navy-700 focus:outline-none focus:border-blue-500"
              value={step}
              onChange={e => handleStepChange(idx, e.target.value)}
              placeholder={`Step ${idx + 1}`}
            />
            {steps.length > 1 && (
              <button type="button" className="ml-2 text-red-400 hover:text-red-600" onClick={() => removeStep(idx)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="mt-2 text-blue-400 hover:text-blue-600" onClick={addStep}>
          + Add Step
        </button>
      </div>
      <div className="flex gap-2 justify-end mt-4">
        {onCancel && (
          <button type="button" className="px-4 py-2 rounded bg-navy-800 text-gray-300 hover:bg-navy-700" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold">
          Create Routine
        </button>
      </div>
    </form>
  );
}
