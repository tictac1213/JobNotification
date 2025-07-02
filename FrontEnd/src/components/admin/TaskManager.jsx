import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, AlertCircle, CheckCircle, Clock, Link, FileText } from 'lucide-react';
import api from '../../utils/api';

const TaskManager = ({ companyId, onTaskAdded }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    pptLink: '',
    formLink: ''
  });

  useEffect(() => {
    if (companyId) {
      fetchTasks();
    }
  }, [companyId]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/companies/${companyId}/tasks`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post(`/companies/${companyId}/tasks`, formData);
      }
      
      setFormData({ title: '', description: '', deadline: '', pptLink: '', formLink: '' });
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
      if (onTaskAdded) onTaskAdded();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task?.title || '',
      description: task?.description || '',
      deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      pptLink: task?.pptLink || '',
      formLink: task?.formLink || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
        if (onTaskAdded) onTaskAdded();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleMarkCompleted = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      fetchTasks();
      if (onTaskAdded) onTaskAdded();
    } catch (error) {
      console.error('Error marking task as completed:', error);
      alert('Error marking task as completed');
    }
  };

  const getTaskStatusIcon = (deadline) => {
    const now = new Date();
    const taskDeadline = new Date(deadline);
    const timeUntilDeadline = taskDeadline - now;
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
    
    if (timeUntilDeadline < 0) return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (hoursUntilDeadline <= 72) return <Clock className="h-4 w-4 text-yellow-600" />; // 3 days = 72 hours
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getTaskStatusColor = (deadline) => {
    const now = new Date();
    const taskDeadline = new Date(deadline);
    const timeUntilDeadline = taskDeadline - now;
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
    
    if (timeUntilDeadline < 0) return 'text-red-600';
    if (hoursUntilDeadline <= 72) return 'text-yellow-600'; // 3 days = 72 hours
    return 'text-green-600';
  };

  const formatTimeRemaining = (deadline) => {
    const now = new Date();
    const taskDeadline = new Date(deadline);
    const timeUntilDeadline = taskDeadline - now;
    
    if (timeUntilDeadline < 0) {
      return 'Overdue';
    }
    
    const days = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Company Tasks</h3>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-4">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Submit PPT, Fill Application Form"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows="3"
                className="input-field"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students need to do..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.deadline ? formData.deadline.split('T')[0] : ''}
                  onChange={(e) => {
                    const currentTime = formData.deadline ? formData.deadline.split('T')[1] : '12:00';
                    setFormData({ ...formData, deadline: `${e.target.value}T${currentTime}` });
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hour *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.deadline ? parseInt(formData.deadline.split('T')[1]?.split(':')[0]) : 12}
                  onChange={(e) => {
                    const currentDate = formData.deadline ? formData.deadline.split('T')[0] : new Date().toISOString().split('T')[0];
                    const currentMinute = formData.deadline ? formData.deadline.split('T')[1]?.split(':')[1] : '00';
                    setFormData({ ...formData, deadline: `${currentDate}T${e.target.value.padStart(2, '0')}:${currentMinute}` });
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minute *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.deadline ? parseInt(formData.deadline.split('T')[1]?.split(':')[1]) : 0}
                  onChange={(e) => {
                    const currentDate = formData.deadline ? formData.deadline.split('T')[0] : new Date().toISOString().split('T')[0];
                    const currentHour = formData.deadline ? formData.deadline.split('T')[1]?.split(':')[0] : '12';
                    setFormData({ ...formData, deadline: `${currentDate}T${currentHour}:${e.target.value.padStart(2, '0')}` });
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                PPT/Video Link (Optional)
              </label>
              <input
                type="url"
                className="input-field"
                value={formData.pptLink}
                onChange={(e) => setFormData({ ...formData, pptLink: e.target.value })}
                placeholder="https://drive.google.com/... or YouTube link"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Link className="h-4 w-4 inline mr-1" />
                Form Link (Optional)
              </label>
              <input
                type="url"
                className="input-field"
                value={formData.formLink}
                onChange={(e) => setFormData({ ...formData, formLink: e.target.value })}
                placeholder="https://forms.google.com/... or Microsoft Forms link"
              />
            </div>
            
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTask(null);
                  setFormData({ title: '', description: '', deadline: '', pptLink: '', formLink: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No tasks available for this company</p>
            <p className="text-sm mt-1">Add tasks as you receive information from the company</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTaskStatusIcon(task.deadline)}
                    <h5 className="font-medium text-gray-900">{task.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  
                  {/* Links */}
                  {(task.pptLink || task.formLink) && (
                    <div className="space-y-1 mb-2">
                      {task.pptLink && (
                        <div className="flex items-center text-sm">
                          <FileText className="h-4 w-4 text-blue-600 mr-1" />
                          <a 
                            href={task.pptLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View PPT/Video
                          </a>
                        </div>
                      )}
                      {task.formLink && (
                        <div className="flex items-center text-sm">
                          <Link className="h-4 w-4 text-green-600 mr-1" />
                          <a 
                            href={task.formLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 underline"
                          >
                            Fill Form
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className={`font-medium ${getTaskStatusColor(task.deadline)}`}>
                      Deadline: {new Date(task.deadline).toLocaleDateString()} at {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({formatTimeRemaining(task.deadline)})
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'Completed' 
                      ? 'bg-green-100 text-green-800'
                      : new Date(task.deadline) < new Date() 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {task.status === 'Completed' ? 'Completed' : new Date(task.deadline) < new Date() ? 'Ended' : 'Active'}
                  </span>
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => handleMarkCompleted(task._id)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      title="Mark as completed"
                    >
                      Mark Done
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit task"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager; 