const fs = require('fs');
const mongoose = require('mongoose');
const Application = require('../models/Application');

// Helper function to delete orphan files from uploads folder
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete orphan file:', err);
    });
  }
};

// @desc    Submit a new admission application
// @route   POST /api/applications
// @access  Public
exports.createApplication = async (req, res) => {
  const file = req.file;

  try {
    const { name, email, phone, dateOfBirth, department, marks, address } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your marksheet document (PDF, JPG, JPEG, or PNG).'
      });
    }

    const uploadedFilePath = file.path;
    const errors = [];

    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Please enter your full name.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address.');
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
      errors.push('Please enter a valid phone number (10 to 15 digits).');
    }

    if (!dateOfBirth) {
      errors.push('Please enter your date of birth.');
    } else {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime()) || dob >= new Date()) {
        errors.push('Date of birth must be a valid past date.');
      }
    }

    const allowedDepartments = ['CSE', 'ECE', 'IT'];
    if (!department || !allowedDepartments.includes(department)) {
      errors.push('Department must be one of: CSE, ECE, IT.');
    }

    const marksNum = Number(marks);
    if (marks === undefined || marks === null || isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      errors.push('Marks must be a valid number between 0 and 100.');
    }

    if (!address || typeof address !== 'string' || !address.trim()) {
      errors.push('Please enter your address.');
    }

    if (errors.length > 0) {
      deleteFile(uploadedFilePath);
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors: errors
      });
    }

    const documentName = file.originalname;
    const documentPath = `/uploads/${file.filename}`;

    const application = new Application({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dateOfBirth: new Date(dateOfBirth),
      department: department,
      marks: marksNum,
      address: address.trim(),
      documentName: documentName,
      documentPath: documentPath
    });

    await application.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application._id
    });

  } catch (error) {
    if (file && file.path) {
      deleteFile(file.path);
    }

    console.error('Error submitting application:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit application. Please try again later.'
    });
  }
};

// @desc    Get all applications (Newest first)
// @route   GET /api/applications
// @access  Public
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications.'
    });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Public
exports.getApplicationById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application ID.'
    });
  }

  try {
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application by ID:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve application details.'
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Public
exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application ID.'
    });
  }

  const allowedStatuses = ['Submitted', 'Review', 'Selected', 'Rejected'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value. Allowed status: Submitted, Review, Selected, Rejected.'
    });
  }

  try {
    const application = await Application.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Error updating application status:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status.'
    });
  }
};
