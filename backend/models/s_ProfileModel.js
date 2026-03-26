const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },

  // Basic Info
  province: { type: String },
  district: { type: String },
  contactNumber: { type: String },
  profileImage: { type: String }, // store image as base64 or URL

  // School & University
  school: { type: String },
  localStream: { type: String },
  eduLevel: { type: String },
  university: { type: String },
  degree: { type: String },

  // Skills
  frontendSkills: [{ type: String }],
  backendSkills: [{ type: String }],
  databaseSkills: [{ type: String }],
  preferredField: { type: String },

  // Extra
  leadership: { type: String },
  awards: { type: String },
  bio: { type: String },

  // CV
  cv: { type: String }, // filename or URL

}, { timestamps: true });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
