import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobsAPI } from "../services/api.js";
import { useNotifications } from "../contexts/NotificationContext.jsx";
import { Save, ArrowLeft, Banknote } from "lucide-react";

const JobForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "applied",
    appliedDate: new Date().toISOString().split("T")[0],
    location: "",
    salary: "",
    jobUrl: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && id) {
      loadJob();
    }
  }, [isEdit, id]);

  const loadJob = async () => {
    try {
      const job = await jobsAPI.getJob(id);
      setFormData({
        company: job.company,
        position: job.position,
        status: job.status,
        appliedDate: job.appliedDate.split("T")[0],
        location: job.location || "",
        salary: job.salary || "",
        jobUrl: job.jobUrl || "",
        notes: job.notes || "",
      });
    } catch (error) {
      addNotification("Failed to load job details", "error");
      navigate("/dashboard");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = "Applied date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await jobsAPI.updateJob(id, formData);
        addNotification("Job application updated successfully", "success");
      } else {
        await jobsAPI.createJob(formData);
        addNotification("Job application added successfully", "success");
      }
      navigate("/dashboard");
    } catch (error) {
      addNotification(
        error instanceof Error
          ? error.message
          : "Failed to save job application",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Job Application" : "Add New Job Application"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit
            ? "Update the details of your job application"
            : "Track a new job opportunity"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company */}
          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Company *
            </label>
            <input
              type="text"
              id="company"
              name="company"
              className={`input-field ${
                errors.company ? "border-red-500 focus:ring-red-500" : ""
              }`}
              placeholder="Enter company name"
              value={formData.company}
              onChange={handleChange}
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-600">{errors.company}</p>
            )}
          </div>
          {/* Position */}
          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Position *
            </label>
            <input
              type="text"
              id="position"
              name="position"
              className={`input-field ${
                errors.position ? "border-red-500 focus:ring-red-500" : ""
              }`}
              placeholder="Enter job position"
              value={formData.position}
              onChange={handleChange}
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position}</p>
            )}
          </div>
          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              className="input-field"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
          {/* Applied Date */}
          <div>
            <label
              htmlFor="appliedDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Applied Date *
            </label>
            <input
              type="date"
              id="appliedDate"
              name="appliedDate"
              className={`input-field ${
                errors.appliedDate ? "border-red-500 focus:ring-red-500" : ""
              }`}
              value={formData.appliedDate}
              onChange={handleChange}
            />
            {errors.appliedDate && (
              <p className="mt-1 text-sm text-red-600">{errors.appliedDate}</p>
            )}
          </div>
          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="input-field"
              placeholder="Enter location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>{" "}
          {/* Salary */}
          <div>
            {" "}
            <label
              htmlFor="salary"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Salary
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Banknote className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="salary"
                name="salary"
                className="input-field pl-10"
                placeholder="e.g., 80,000 - 100,000"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Job URL */}
        <div>
          <label
            htmlFor="jobUrl"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job URL
          </label>
          <input
            type="url"
            id="jobUrl"
            name="jobUrl"
            className="input-field"
            placeholder="https://..."
            value={formData.jobUrl}
            onChange={handleChange}
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="input-field resize-none"
            placeholder="Add any additional notes about this job application..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>
              {loading ? "Saving..." : isEdit ? "Update Job" : "Add Job"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
