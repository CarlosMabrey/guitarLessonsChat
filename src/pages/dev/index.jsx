import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiActivity, FiList, FiAlertTriangle, FiPlus, FiArrowUp, FiArrowDown, FiTrash2, FiChevronDown, FiChevronUp, FiCheck, FiRefreshCw } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';

// Dynamic background component similar to dashboard
const DynamicBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-indigo-800/80">
      <div className="absolute inset-0 bg-[url('/images/guitar-texture.png')] opacity-10 mix-blend-overlay"></div>
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
const FeatureStatusCard = ({ title, description, status, lastUpdated }) => {
  const statusColor = status === 'Completed' ? 'green' : status === 'In Progress' ? 'yellow' : 'red';
  const StatusIcon = status === 'Completed' ? FiCheckCircle : status === 'In Progress' ? FiClock : FiXCircle;
  
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className={`flex items-center text-${statusColor}-400`}>
          <StatusIcon className="mr-1" />
          <span className="text-sm">{status}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className="text-xs text-gray-500">Last updated: {lastUpdated}</div>
    </div>
  );
};

// Task component with priority and expandable details
const Task = ({ task, onDelete, onPriorityChange, onStatusChange, onStepToggle, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDetails, setEditDetails] = useState(task.details || '');
  const [editTechnologies, setEditTechnologies] = useState((task.technologies || []).join(', '));
  const [editSteps, setEditSteps] = useState(task.steps ? task.steps.map(s => s.text) : []);

  useEffect(() => {
    if (expanded) {
      setEditDetails(task.details || '');
      setEditTechnologies((task.technologies || []).join(', '));
      setEditSteps(task.steps ? task.steps.map(s => s.text) : []);
    }
  }, [expanded, task]);
  
  const priorityColor = 
    task.priority === 'High' ? 'red' : 
    task.priority === 'Medium' ? 'yellow' : 'blue';
  
  const statusColor = 
    task.status === 'Completed' ? 'green' : 
    task.status === 'In Progress' ? 'yellow' : 'gray';
  
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300 mb-2">
      {/* Clickable header area */}
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full bg-${priorityColor}-400`}></div>
          <div>
            <p className="text-white font-medium">{task.title}</p>
            <div className="flex items-center mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs bg-${statusColor}-400/20 text-${statusColor}-400 mr-2`}>
                {task.status}
              </span>
              <span className="text-xs text-gray-400">{task.category}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Priority and delete buttons */}
          <div className="flex items-center mr-2">
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent expansion toggle
                onPriorityChange(task.id, 'increase');
              }}
              className="p-1 rounded hover:bg-white/10"
              aria-label="Increase priority"
            >
              <FiArrowUp size={14} className="text-white/70" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent expansion toggle
                onPriorityChange(task.id, 'decrease');
              }}
              className="p-1 rounded hover:bg-white/10"
              aria-label="Decrease priority"
            >
              <FiArrowDown size={14} className="text-white/70" />
            </button>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent expansion toggle
              onDelete(task.id);
            }}
            className="p-1 rounded hover:bg-white/10"
            aria-label="Delete task"
          >
            <FiTrash2 size={14} className="text-white/70" />
          </button>
          {/* Expansion indicator */}
          {expanded ? (
            <FiChevronUp className="text-white/70" />
          ) : (
            <FiChevronDown className="text-white/70" />
          )}
        </div>
      </div>
      
      {/* Expanded details section */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-white/10 text-sm text-gray-300">
          {/* Details section */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium mb-1">Details</h4>
              {editing ? (
                <textarea
                  className="w-full bg-white/10 text-white rounded p-2 mb-2"
                  value={editDetails}
                  onChange={e => setEditDetails(e.target.value)}
                  rows={2}
                />
              ) : (
                <p>{task.details}</p>
              )}
            </div>
            <button
              className="ml-2 text-xs text-indigo-400 hover:underline"
              onClick={() => setEditing(e => !e)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Editable Steps */}
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">Implementation Steps</h4>
            {editing ? (
              <div>
                {editSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center mb-1">
                    <input
                      className="flex-1 bg-white/10 text-white rounded p-1 mr-2"
                      value={step}
                      onChange={e => {
                        const newSteps = [...editSteps];
                        newSteps[idx] = e.target.value;
                        setEditSteps(newSteps);
                      }}
                    />
                    <button
                      className="text-xs px-2 py-1 bg-red-500/30 text-red-200 rounded hover:bg-red-500/60"
                      onClick={e => {
                        e.preventDefault();
                        setEditSteps(editSteps.filter((_, i) => i !== idx));
                      }}
                    >Remove</button>
                  </div>
                ))}
                <button
                  className="mt-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  onClick={e => {
                    e.preventDefault();
                    setEditSteps([...editSteps, '']);
                  }}
                >Add Step</button>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {task.steps && task.steps.length > 0 ? task.steps.map((step, index) => (
                  <li key={index} className="flex items-center">
                    <button
                      onClick={() => onStepToggle(task.id, index)}
                      className={`w-5 h-5 rounded flex items-center justify-center mr-2 ${step.completed ? 'bg-green-500/30 text-green-400' : 'bg-white/10'}`}
                    >
                      {step.completed && <FiCheck size={12} />}
                    </button>
                    <span className={step.completed ? 'line-through text-gray-500' : ''}>{step.text}</span>
                  </li>
                )) : <span className="italic text-gray-500">No steps</span>}
              </ul>
            )}
          </div>

          {/* Editable Technologies */}
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">Technologies</h4>
            {editing ? (
              <input
                className="w-full bg-white/10 text-white rounded p-2"
                value={editTechnologies}
                onChange={e => setEditTechnologies(e.target.value)}
                placeholder="Comma-separated"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {task.technologies && task.technologies.length > 0 ? task.technologies.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-500/30 text-purple-300 rounded-full text-xs">{tech}</span>
                )) : <span className="italic text-gray-500">No technologies</span>}
              </div>
            )}
          </div>

          {/* Status selection */}
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">Status</h4>
            <div className="flex space-x-2">
              {['Not Started', 'In Progress', 'Completed'].map(status => (
                <button
                  key={status}
                  onClick={() => onStatusChange(task.id, status)}
                  className={`px-3 py-1.5 rounded-md text-xs ${task.status === status ? 'bg-indigo-500/70 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Save/cancel actions for editing */}
          {editing && (
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={e => {
                  e.preventDefault();
                  onEdit(task.id, {
                    details: editDetails,
                    technologies: editTechnologies.split(',').map(t => t.trim()).filter(Boolean),
                    steps: editSteps.map(s => ({ text: s, completed: false }))
                  });
                  setEditing(false);
                }}
              >Save</button>
              <button
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={e => {
                  e.preventDefault();
                  setEditing(false);
                }}
              >Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Task management section
const TaskManager = () => {
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Core Functionality');
  
  // Fetch tasks when component mounts
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      setError(error.message || 'Error fetching tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Add new task
  const handleAddTask = async (e) => {
    setError(null);
    setSaving(true);
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask,
          category: newTaskCategory,
          priority: 'Medium',
          status: 'Not Started',
          details: '',
          steps: [],
          technologies: []
        })
      });
      
      const newTaskData = await response.json();
      setTasks([...tasks, newTaskData]);
      setNewTask('');
    } catch (error) {
      setError(error.message || 'Error adding task');
      console.error('Error adding task:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Delete task
  const handleDeleteTask = async (id) => {
    setError(null);
    setSaving(true);
    try {
      await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE'
      });
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      setError(error.message || 'Error deleting task');
      console.error('Error deleting task:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Change task priority
  const handlePriorityChange = async (id, direction) => {
    setError(null);
    setSaving(true);
    const priorities = ['Low', 'Medium', 'High'];
    const taskToUpdate = tasks.find(task => task.id === id);
    if (!taskToUpdate) return;
    
    const currentIndex = priorities.indexOf(taskToUpdate.priority);
    let newIndex;
    
    if (direction === 'increase' && currentIndex < priorities.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'decrease' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return; // No change needed
    }
    
    const newPriority = priorities[newIndex];
    
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          updates: { priority: newPriority }
        })
      });
      
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, priority: newPriority } : task
      ));
    } catch (error) {
      setError(error.message || 'Error updating task priority');
      console.error('Error updating task priority:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Change task status
  const handleStatusChange = async (id, status) => {
    setError(null);
    setSaving(true);
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          updates: { status }
        })
      });
      
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, status } : task
      ));
    } catch (error) {
      setError(error.message || 'Error updating task status');
      console.error('Error updating task status:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Toggle step completion
  const handleStepToggle = async (taskId, stepIndex) => {
    setError(null);
    setSaving(true);
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate || !taskToUpdate.steps) return;
    
    const updatedSteps = [...taskToUpdate.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      completed: !updatedSteps[stepIndex].completed
    };
    
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          updates: { steps: updatedSteps }
        })
      });
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, steps: updatedSteps } : task
      ));
    } catch (error) {
      setError(error.message || 'Error updating task step');
      console.error('Error updating task step:', error);
    } finally {
      setSaving(false);
    }
  };

  // Edit task details/steps/technologies
  const handleEditTask = async (id, updates) => {
    setError(null);
    setSaving(true);
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      });
      setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
    } catch (error) {
      setError(error.message || 'Error editing task');
      console.error('Error editing task:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Group tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === 'High');
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'Medium');
  const lowPriorityTasks = tasks.filter(task => task.priority === 'Low');
  
  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Task Management</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Task Management</h2>
        <button
          className="flex items-center px-3 py-1.5 bg-white/10 text-indigo-300 rounded hover:bg-white/20"
          onClick={e => { e.preventDefault(); fetchTasks(); }}
          title="Refresh"
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          <span className="ml-2 text-xs">Refresh</span>
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-white">
          {error}
        </div>
      )}
      {saving && (
        <div className="mb-4 flex items-center text-indigo-300 text-sm"><FiRefreshCw className="animate-spin mr-2" />Saving...</div>
      )}
      {/* Add task form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add new task"
            className="flex-1 bg-white/5 rounded-lg px-4 py-2 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-400"
          />
          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            className="md:w-48 bg-white/5 rounded-lg px-4 py-2 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-400"
          >
            <option value="Core Functionality">Core Functionality</option>
            <option value="UX & UI">UX & UI</option>
            <option value="Mobile & Accessibility">Mobile & Accessibility</option>
            <option value="AI Features">AI Features</option>
            <option value="Data Management">Data Management</option>
            <option value="Performance">Performance</option>
            <option value="Technical Debt">Technical Debt</option>
          </select>
          <button
            type="submit"
            className="md:w-auto whitespace-nowrap inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus size={16} className="mr-1" />
            Add Task
          </button>
        </div>
      </form>
      
      {/* Tasks list by priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-md font-semibold text-white mb-3 flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
            High Priority
          </h3>
          <div className="space-y-2">
            {highPriorityTasks.length ? (
              highPriorityTasks.map(task => (
                <Task 
                  key={task.id} 
                  task={task} 
                  onDelete={handleDeleteTask}
                  onPriorityChange={handlePriorityChange}
                  onStatusChange={handleStatusChange}
                  onStepToggle={handleStepToggle}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No high priority tasks</p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-semibold text-white mb-3 flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
            Medium Priority
          </h3>
          <div className="space-y-2">
            {mediumPriorityTasks.length ? (
              mediumPriorityTasks.map(task => (
                <Task 
                  key={task.id} 
                  task={task} 
                  onDelete={handleDeleteTask}
                  onPriorityChange={handlePriorityChange}
                  onStatusChange={handleStatusChange}
                  onStepToggle={handleStepToggle}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No medium priority tasks</p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-semibold text-white mb-3 flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
            Low Priority
          </h3>
          <div className="space-y-2">
            {lowPriorityTasks.length ? (
              lowPriorityTasks.map(task => (
                <Task 
                  key={task.id} 
                  task={task} 
                  onDelete={handleDeleteTask}
                  onPriorityChange={handlePriorityChange}
                  onStatusChange={handleStatusChange}
                  onStepToggle={handleStepToggle}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No low priority tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DevPage() {
  // Feature implementation status from the roadmap and todo list
  const [features, setFeatures] = useState([
    { 
      id: 1, 
      title: 'Core UI Components',
      description: 'Base UI components, theme system, and responsive layouts',
      status: 'Completed', 
      lastUpdated: 'June 20, 2025'
    },
    { 
      id: 2, 
      title: 'Fretboard Visualization', 
      description: 'Interactive fretboard with note visualization and scales',
      status: 'Completed', 
      lastUpdated: 'June 22, 2025'
    },
    { 
      id: 3, 
      title: 'AI Chat Implementation', 
      description: 'Basic AI chat for guitar learning assistance',
      status: 'In Progress', 
      lastUpdated: 'June 25, 2025'
    },
    { 
      id: 4, 
      title: 'Smart Metronome', 
      description: 'Configurable metronome with tempo visualization',
      status: 'Not Started', 
      lastUpdated: 'June 18, 2025'
    },
    { 
      id: 5, 
      title: 'Chord Progression Generator', 
      description: 'Generate chord progressions in any key with playback',
      status: 'In Progress', 
      lastUpdated: 'June 23, 2025'
    },
    { 
      id: 6, 
      title: 'User Authentication', 
      description: 'User accounts and profile management',
      status: 'Not Started', 
      lastUpdated: 'June 15, 2025'
    },
  ]);

  // Site statistics
  const getStats = () => {
    const completedFeatures = features.filter(f => f.status === 'Completed').length;
    const inProgressFeatures = features.filter(f => f.status === 'In Progress').length;
    const notStartedFeatures = features.filter(f => f.status === 'Not Started').length;
    const totalFeatures = features.length;
    
    return [
      { label: 'Complete', value: `${completedFeatures}/${totalFeatures}`, color: 'green', icon: FiCheckCircle },
      { label: 'In Progress', value: inProgressFeatures, color: 'yellow', icon: FiClock },
      { label: 'Not Started', value: notStartedFeatures, color: 'red', icon: FiXCircle },
      { label: 'Completion', value: `${Math.round((completedFeatures/totalFeatures)*100)}%`, color: 'indigo', icon: FiActivity },
    ];
  };
  
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(feature => (
            <FeatureStatusCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              status={feature.status}
              lastUpdated={feature.lastUpdated}
            />
          ))}
        </div>
      </div>
      
      {/* Task Management Section */}
      <div className="container mx-auto px-4 max-w-6xl mb-16">
        <TaskManager />
      </div>
    </Layout>
  );
}
