import express from 'express';
import Joi from 'joi';
import Job from '../models/Job.js';

const router = express.Router();

// Validation schema
const jobSchema = Joi.object({
  company: Joi.string().min(1).max(100).required(),
  position: Joi.string().min(1).max(100).required(),
  status: Joi.string().valid('applied', 'interview', 'offer', 'rejected', 'accepted').default('applied'),
  appliedDate: Joi.date().required(),
  location: Joi.string().max(100).allow(''),
  salary: Joi.string().max(50).allow(''),
  jobUrl: Joi.string().uri().allow(''),
  notes: Joi.string().max(1000).allow('')
});

// @route   GET /api/jobs
// @desc    Get all jobs for authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, sortBy = '-appliedDate', page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    // Build sort object
    let sort = {};
    if (sortBy.startsWith('-')) {
      sort[sortBy.substring(1)] = -1;
    } else {
      sort[sortBy] = 1;
    }

    const jobs = await Job.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// @route   GET /api/jobs/stats
// @desc    Get job statistics for authenticated user
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize all statuses with 0
    const result = {
      total: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      accepted: 0
    };

    // Populate with actual counts
    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    res.json(result);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get a specific job
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error while fetching job' });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error } = jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const job = new Job({
      ...req.body,
      user: req.user._id
    });

    await job.save();

    // Send real-time notification to all user's connected devices
    try {
      const io = req.app.get('io');
      if (io) {
        const userRoom = `user-${req.user._id}`;
        console.log(`Emitting job creation notification to room: ${userRoom}`);
        io.to(userRoom).emit('notification', {
          message: `New job application added for ${job.position} at ${job.company}`,
          type: 'success',
          timestamp: new Date().toISOString(),
          jobId: job._id.toString()
        });
      }
    } catch (error) {
      console.error('Failed to emit socket notification for job creation:', error);
      // Continue with the response even if notification fails
    }

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error while creating job' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    // Validate input
    const { error } = jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Send real-time notification to all user's connected devices
    try {
      const io = req.app.get('io');
      if (io) {
        const userRoom = `user-${req.user._id}`;
        console.log(`Emitting job update notification to room: ${userRoom}`);
        io.to(userRoom).emit('notification', {
          message: `Job application updated: ${job.position} at ${job.company}`,
          type: 'info',
          timestamp: new Date().toISOString(),
          jobId: job._id.toString()
        });
      }
    } catch (error) {
      console.error('Failed to emit socket notification for job update:', error);
      // Continue with the response even if notification fails
    }

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Send real-time notification to all user's connected devices
    try {
      const io = req.app.get('io');
      if (io) {
        const userRoom = `user-${req.user._id}`;
        console.log(`Emitting job deletion notification to room: ${userRoom}`);
        io.to(userRoom).emit('notification', {
          message: `Job application deleted: ${job.position} at ${job.company}`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          jobId: job._id.toString()
        });
      }
    } catch (error) {
      console.error('Failed to emit socket notification for job deletion:', error);
      // Continue with the response even if notification fails
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
});

export default router;