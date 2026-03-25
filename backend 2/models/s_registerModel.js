const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true }, 
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  district: { type: String, default: "", trim: true },
  preferredJobCategories: [{ type: String, trim: true }],
  skills: [{ type: String, trim: true }],
  university: { type: String, default: "", trim: true },
  course: { type: String, default: "", trim: true },
  year: { type: String, default: "", trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);