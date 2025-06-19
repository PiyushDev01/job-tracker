import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot be more than 100 characters']
  },
  status: {
    type: String,
    enum: ['applied', 'interview', 'offer', 'rejected', 'accepted'],
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    required: [true, 'Applied date is required'],
    default: Date.now
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  salary: {
    type: String,
    trim: true,
    maxlength: [50, 'Salary cannot be more than 50 characters']
  },
  jobUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Job URL must be a valid URL'
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['applied', 'interview', 'offer', 'rejected', 'accepted']
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Add status to history when status changes
jobSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date()
    });
  }
  next();
});

// Indexes for better query performance
jobSchema.index({ user: 1, appliedDate: -1 });
jobSchema.index({ user: 1, status: 1 });
jobSchema.index({ user: 1, company: 1 });

export default mongoose.model('Job', jobSchema);