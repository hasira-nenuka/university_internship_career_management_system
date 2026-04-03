const Review = require('../models/reviewModel');

const sanitizeReview = (reviewDoc) => ({
  _id: reviewDoc._id,
  companyId: reviewDoc.companyId,
  companyName: reviewDoc.companyName,
  studentId: reviewDoc.studentId,
  studentName: reviewDoc.studentName,
  reviewerType: reviewDoc.reviewerType,
  rating: reviewDoc.rating,
  title: reviewDoc.title,
  comment: reviewDoc.comment,
  status: reviewDoc.status,
  adminReply: reviewDoc.adminReply,
  repliedBy: reviewDoc.repliedBy,
  repliedByName: reviewDoc.repliedByName,
  repliedAt: reviewDoc.repliedAt,
  createdAt: reviewDoc.createdAt,
  updatedAt: reviewDoc.updatedAt,
});

exports.createCompanyReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    if (!req.company) {
      return res.status(401).json({ success: false, message: 'Company authentication required' });
    }

    if (!rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Rating, title, and comment are required' });
    }

    const review = await Review.create({
      companyId: req.company._id,
      companyName: req.company.companyName,
      reviewerType: 'Company',
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
    });

    return res.status(201).json({ success: true, data: sanitizeReview(review) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompanyReviews = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ success: false, message: 'Company authentication required' });
    }

    const reviews = await Review.find({ 
      companyId: req.company._id,
      reviewerType: 'Company' 
    }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: reviews.map(sanitizeReview) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudentReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    if (!req.student) {
      return res.status(401).json({ success: false, message: 'Student authentication required' });
    }

    if (!rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Rating, title, and comment are required' });
    }

    const review = await Review.create({
      studentId: req.student._id,
      studentName: `${req.student.firstName} ${req.student.lastName}`,
      reviewerType: 'Student',
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
    });

    return res.status(201).json({ success: true, data: sanitizeReview(review) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentReviews = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ success: false, message: 'Student authentication required' });
    }

    const reviews = await Review.find({ 
      studentId: req.student._id,
      reviewerType: 'Student' 
    }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: reviews.map(sanitizeReview) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: reviews.map(sanitizeReview) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const { adminReply, status } = req.body;

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.adminReply = adminReply.trim();
    review.status = status && ['pending', 'replied', 'closed'].includes(status) ? status : 'replied';
    review.repliedBy = req.admin?._id || null;
    review.repliedByName = req.admin?.fullName || '';
    review.repliedAt = new Date();

    await review.save();

    return res.status(200).json({ success: true, data: sanitizeReview(review) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid review status is required' });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    return res.status(200).json({ success: true, data: sanitizeReview(review) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
