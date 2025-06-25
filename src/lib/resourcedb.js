// Local database implementation for Resources using localStorage

const RESOURCE_KEY = 'guitarCoach_resources';

export const initializeResources = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(RESOURCE_KEY)) {
    localStorage.setItem(RESOURCE_KEY, JSON.stringify([]));
  }
};

export const getAllResources = () => {
  if (typeof window === 'undefined') return [];
  try {
    const resources = localStorage.getItem(RESOURCE_KEY);
    return resources ? JSON.parse(resources) : [];
  } catch (error) {
    console.error('Error retrieving resources:', error);
    return [];
  }
};

export const addResource = (resource) => {
  if (typeof window === 'undefined') return false;
  try {
    const resources = getAllResources();
    const newResource = {
      ...resource,
      id: resource.id || `resource-${Date.now()}`,
      dateAdded: resource.dateAdded || new Date().toISOString(),
    };
    resources.push(newResource);
    localStorage.setItem(RESOURCE_KEY, JSON.stringify(resources));
    return true;
  } catch (error) {
    console.error('Error adding resource:', error);
    return false;
  }
};

export const removeResource = (id) => {
  if (typeof window === 'undefined') return false;
  try {
    const resources = getAllResources();
    const updated = resources.filter(r => r.id !== id);
    localStorage.setItem(RESOURCE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error removing resource:', error);
    return false;
  }
};

// Initialize resources on module import
if (typeof window !== 'undefined') {
  initializeResources();
}
