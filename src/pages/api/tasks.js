import { getTasksFromMarkdown, saveTasksToMarkdown, updateTask, addTask, deleteTask } from '@/lib/taskManager';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const tasks = await getTasksFromMarkdown();
        return res.status(200).json(tasks);

      case 'POST':
        const newTask = await addTask(req.body);
        return res.status(201).json(newTask);

      case 'PUT':
        const { id, updates } = req.body;
        const updated = await updateTask(id, updates);
        if (updated) {
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ success: false, message: 'Failed to update task' });

      case 'DELETE':
        const { id: taskId } = req.query;
        const deleted = await deleteTask(Number(taskId));
        if (deleted) {
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ success: false, message: 'Failed to delete task' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Task API error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
