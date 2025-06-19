import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { jobsAPI } from '../services/api.js';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import {
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Banknote, 
  ExternalLink,
  Building,
  User
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const jobData = await jobsAPI.getJob(id);
      setJob(jobData);
    } catch (error) {
      addNotification('Failed to load job details', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      await jobsAPI.deleteJob(id);
      addNotification('Job application deleted successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      addNotification('Failed to delete job application', 'error');
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'status-applied';
      case 'interview':
        return 'status-interview';
      case 'offer':
        return 'status-offer';
      case 'rejected':
        return 'status-rejected';
      case 'accepted':
        return 'status-accepted';
      default:
        return 'status-applied';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.position}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span className="text-lg font-medium">{job.company}</span>
              </div>
              <span className={getStatusClass(job.status)}>{job.status}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/jobs/${job._id}/edit`}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Applied Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(job.appliedDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {job.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{job.location}</p>
                  </div>
                </div>
              )}              {job.salary && (
                <div className="flex items-center space-x-3">
                  <Banknote className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">{job.salary}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={getStatusClass(job.status)}>{job.status}</span>
                </div>
              </div>
            </div>

            {job.jobUrl && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Job Posting</span>
                </a>
              </div>
            )}
          </div>

          {/* Notes */}
          {job.notes && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to={`/jobs/${job._id}/edit`}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Application</span>
              </Link>
              
              {job.jobUrl && (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Job Posting</span>
                </a>
              )}

              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-sm font-medium"
              >
                Delete Application
              </button>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(job.appliedDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              {job.status !== 'applied' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status Updated</p>
                    <p className="text-xs text-gray-500">
                      Changed to {job.status}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
