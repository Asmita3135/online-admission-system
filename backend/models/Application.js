const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['CSE', 'ECE', 'IT'],
        message: 'Department must be one of: CSE, ECE, IT'
      }
    },
    marks: {
      type: Number,
      required: [true, 'Marks percentage is required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot be greater than 100']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    documentName: {
      type: String,
      required: [true, 'Document original name is required']
    },
    documentPath: {
      type: String,
      required: [true, 'Document path is required']
    },
    status: {
      type: String,
      enum: {
        values: ['Submitted', 'Review', 'Selected', 'Rejected'],
        message: 'Status must be one of: Submitted, Review, Selected, Rejected'
      },
      default: 'Submitted'
    }
  },
  {
    timestamps: true
  }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
