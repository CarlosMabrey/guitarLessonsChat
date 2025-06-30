import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Parses the Task Management markdown file into structured task data
 * @returns {Array} Array of task objects with category, title, and details
 */
export async function getTasksFromMarkdown() {
  try {
    const filePath = path.join(process.cwd(), 'Task Management.md');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Split the file by sections using ## as delimiter
    const sections = fileContents.split(/^## /m).filter(Boolean);
    
    const tasks = [];
    let taskId = 1;
    
    // Process each section (category)
    for (let section of sections) {
      const lines = section.split('\n');
      const category = lines[0].trim();
      
      // Skip the first line (category name) and then split by ### to get individual tasks
      const taskContent = lines.slice(1).join('\n');
      const taskBlocks = taskContent.split(/^### /m).filter(Boolean);
      
      // Process each task within the category
      for (let taskBlock of taskBlocks) {
        const taskLines = taskBlock.split('\n');
        const title = taskLines[0].trim();
        
        // Parse the metadata and details from the task block
        let priority = 'Medium';
        let status = 'Not Started';
        let details = '';
        let steps = [];
        let technologies = [];
        
        let currentSection = null;
        
        for (let i = 1; i < taskLines.length; i++) {
          const line = taskLines[i].trim();
          
          if (line.startsWith('- **Priority**:')) {
            priority = line.replace('- **Priority**:', '').trim();
          } 
          else if (line.startsWith('- **Status**:')) {
            status = line.replace('- **Status**:', '').trim();
          } 
          else if (line.startsWith('- **Details**:')) {
            details = line.replace('- **Details**:', '').trim();
          } 
          else if (line === '- **Steps**:') {
            currentSection = 'steps';
          } 
          else if (line === '- **Technologies**:') {
            currentSection = 'technologies';
          }
          else if (currentSection === 'steps' && line.startsWith('  ')) {
            // Extract step number and text, removing the checkmark if present
            const stepText = line.trim().replace(/^\d+\.\s+(?:✅\s+)?/, '');
            const isCompleted = line.includes('✅');
            steps.push({ text: stepText, completed: isCompleted });
          }
          else if (currentSection === 'technologies' && line.startsWith('  -')) {
            const tech = line.replace('  -', '').trim();
            technologies.push(tech);
          }
        }
        
        tasks.push({
          id: taskId++,
          category,
          title,
          priority,
          status,
          details,
          steps,
          technologies
        });
      }
    }
    
    return tasks;
  } catch (error) {
    console.error('Error parsing Task Management markdown:', error);
    return [];
  }
}

/**
 * Saves task data back to the markdown file
 * @param {Array} tasks Array of task objects
 */
export async function saveTasksToMarkdown(tasks) {
  try {
    let fileContent = '# Guitar Learning App Task Management\n\n';
    fileContent += 'This file contains task details, implementation status, and technical specifications for the Guitar Learning App.\n\n';
    
    // Group tasks by category
    const tasksByCategory = tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    }, {});
    
    // Generate markdown for each category
    for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
      fileContent += `## ${category}\n\n`;
      
      // Generate markdown for each task in the category
      for (const task of categoryTasks) {
        fileContent += `### ${task.title}\n`;
        fileContent += `- **Priority**: ${task.priority}\n`;
        fileContent += `- **Status**: ${task.status}\n`;
        fileContent += `- **Details**: ${task.details}\n`;
        
        // Add steps
        if (task.steps && task.steps.length > 0) {
          fileContent += '- **Steps**:\n';
          task.steps.forEach((step, index) => {
            const checkmark = step.completed ? '✅ ' : '';
            fileContent += `  ${index + 1}. ${checkmark}${step.text}\n`;
          });
        }
        
        // Add technologies
        if (task.technologies && task.technologies.length > 0) {
          fileContent += '- **Technologies**:\n';
          task.technologies.forEach(tech => {
            fileContent += `  - ${tech}\n`;
          });
        }
        
        fileContent += '\n';
      }
    }
    
    const filePath = path.join(process.cwd(), 'Task Management.md');
    fs.writeFileSync(filePath, fileContent);
    
    return true;
  } catch (error) {
    console.error('Error saving Task Management markdown:', error);
    return false;
  }
}

/**
 * Updates a single task property
 */
export async function updateTask(taskId, updates) {
  try {
    // Get current tasks
    const tasks = await getTasksFromMarkdown();
    
    // Find and update the task
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    
    // Save back to markdown
    await saveTasksToMarkdown(updatedTasks);
    
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
}

/**
 * Adds a new task to the markdown file
 */
export async function addTask(taskData) {
  try {
    // Get current tasks
    const tasks = await getTasksFromMarkdown();
    
    // Create new task with ID
    const newTask = {
      id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      ...taskData,
      steps: taskData.steps || [],
      technologies: taskData.technologies || []
    };
    
    // Add to tasks and save
    tasks.push(newTask);
    await saveTasksToMarkdown(tasks);
    
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
}

/**
 * Deletes a task from the markdown file
 */
export async function deleteTask(taskId) {
  try {
    // Get current tasks
    const tasks = await getTasksFromMarkdown();
    
    // Filter out the task to delete
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    // Save back to markdown
    await saveTasksToMarkdown(updatedTasks);
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}
