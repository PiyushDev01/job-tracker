import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../services/api.js';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import JobCard from '../components/JobCard.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import { Plus, Filter, Search, BarChart3, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    accepted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('-appliedDate');
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadJobs();
    loadStats();
  }, [statusFilter, sortBy]);

  const loadJobs = async () => {
    try {
      const data = await jobsAPI.getJobs({ status: statusFilter, sortBy });
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      addNotification('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await jobsAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const handleDelete = (id) => {
    // Find the job to show its details in the confirmation modal
    const jobToDelete = jobs.find(job => job._id === id);
    setJobToDelete(jobToDelete);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      await jobsAPI.deleteJob(jobToDelete._id);
      setJobs(jobs.filter((job) => job._id !== jobToDelete._id));
      addNotification('Job application deleted successfully', 'success');
      // Refresh stats
      loadStats();
    } catch (error) {
      console.error('Error deleting job:', error);
      addNotification('Failed to delete job application', 'error');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredJobs = jobs.filter((job) => {
    const jobText = `${job.company} ${job.position} ${job.location || ''} ${job.status}`.toLowerCase();
    return jobText.includes(searchTerm.toLowerCase());
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'applied', label: 'Applied' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'accepted', label: 'Accepted' },
  ];

  const sortOptions = [
    { value: '-appliedDate', label: 'Newest First' },
    { value: 'appliedDate', label: 'Oldest First' },
    { value: 'company', label: 'Company (A-Z)' },
    { value: '-company', label: 'Company (Z-A)' },
    { value: 'position', label: 'Position (A-Z)' },
    { value: '-position', label: 'Position (Z-A)' },
  ];  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card">
      <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 h-full">
        <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
          {icon}
        </div>
        <div className="ml-2 overflow-hidden">
          <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );return (
    <div>      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Jobs"
          value={stats.total}
          icon={<Briefcase className="h-5 w-5 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Applied"
          value={stats.applied}
          icon={<Clock className="h-5 w-5 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Interviews"
          value={stats.interview}
          icon={<BarChart3 className="h-5 w-5 text-white" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Offers"
          value={stats.offer}
          icon={<CheckCircle className="h-5 w-5 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle className="h-5 w-5 text-white" />}
          color="bg-red-500"
        />
        <StatCard
          title="Accepted"
          value={stats.accepted}
          icon={<Briefcase className="h-5 w-5 text-white" />}
          color="bg-teal-500"
        />
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {/* Filters */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="input-field pl-10 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="input-field pl-10 appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Job Button */}
        <Link
          to="/jobs/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Job</span>
        </Link>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm || statusFilter ? (
            <p className="text-gray-500">No jobs match your filters</p>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-500 mb-4">You haven't added any job applications yet.</p>
              <Link to="/jobs/new" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Your First Job</span>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} onDelete={handleDelete} />
          ))}        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Job Application"
        message={jobToDelete ? `Are you sure you want to delete the application for ${jobToDelete.position} at ${jobToDelete.company}?` : 'Are you sure you want to delete this job application?'}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Dashboard;
