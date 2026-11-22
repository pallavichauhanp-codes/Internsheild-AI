/**
 * Request validation middlewares for InternShield AI endpoints
 */

export function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Full name is required.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid email format.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  if (role && !['student', 'admin'].includes(role)) {
    errors.role = 'Role must be either student or admin.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors
    });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email is required.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
      errors
    });
  }

  next();
}

export function validateScanAnalyze(req, res, next) {
  const { 
    text, 
    image, 
    internshipTitle, 
    companyName, 
    internshipDescription, 
    hasUpfrontFee, 
    upfrontFeeAmount 
  } = req.body;
  const errors = {};

  const hasText = Boolean(text && typeof text === 'string' && text.trim().length > 0);
  const hasImage = Boolean(image && typeof image === 'string' && image.trim().length > 0);
  const hasLegacyDesc = Boolean(internshipDescription && typeof internshipDescription === 'string' && internshipDescription.trim().length >= 10);

  // Must provide either text, image, or legacy internshipDescription
  if (!hasText && !hasImage && !hasLegacyDesc) {
    errors.submission = 'Please provide internship text, upload a screenshot/image, or both to initiate the scan.';
  }

  // If in legacy structured form mode without text or image, enforce legacy required fields
  if (!hasText && !hasImage && hasLegacyDesc) {
    if (!internshipTitle || !internshipTitle.trim()) {
      errors.internshipTitle = 'Internship title is required.';
    }
    if (!companyName || !companyName.trim()) {
      errors.companyName = 'Company name is required.';
    }
  }

  if ((hasUpfrontFee === 'yes' || hasUpfrontFee === true) && (!upfrontFeeAmount || !String(upfrontFeeAmount).trim())) {
    errors.upfrontFeeAmount = 'Please specify the fee amount demanded.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.submission || 'Validation failed. Please fill in the required fields.',
      errors
    });
  }

  next();
}

export function validateReportCreate(req, res, next) {
  const { companyName, description } = req.body;
  const errors = {};

  if (!companyName || !companyName.trim()) {
    errors.companyName = 'Company name is required.';
  }
  if (!description || description.trim().length < 10) {
    errors.description = 'Please provide a detailed fraud description (at least 10 characters).';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please fill in all required fields.',
      errors
    });
  }

  next();
}

export function validateAdminReportStatus(req, res, next) {
  const { status } = req.body;
  const allowed = ['pending', 'verified_scam', 'rejected', 'under_review'];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${allowed.join(', ')}`
    });
  }

  next();
}
