const StudentProfile = require("../models/s_ProfileModel");
const mongoose = require("mongoose");

const ARRAY_FIELDS = ["frontendSkills", "backendSkills", "databaseSkills"];
const normalizeEmail = (email) => email?.trim().toLowerCase();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const FILE_FIELDS = ["cv", "profileImage"];

const normalizeStoredFileReference = (value) => {
  if (typeof value !== "string") return value;

  const trimmedValue = value.trim();
  if (!trimmedValue) return "";
  if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;

  const normalizedSlashes = trimmedValue.replace(/\\/g, "/");
  const uploadsIndex = normalizedSlashes.toLowerCase().lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return normalizedSlashes.slice(uploadsIndex + "/uploads/".length);
  }

  const uploadIndex = normalizedSlashes.toLowerCase().lastIndexOf("/upload/");
  if (uploadIndex >= 0) {
    return normalizedSlashes.slice(uploadIndex + "/upload/".length);
  }

  return normalizedSlashes.split("/").filter(Boolean).pop() || normalizedSlashes;
};

const serializeStudentProfile = (student) => {
  if (!student) return student;

  const serializedStudent = typeof student.toObject === "function"
    ? student.toObject()
    : { ...student };

  FILE_FIELDS.forEach((field) => {
    serializedStudent[field] = normalizeStoredFileReference(serializedStudent[field]);
  });

  return serializedStudent;
};

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const applyProfilePayload = (student, req) => {
  ARRAY_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      student[field] = parseArrayField(req.body[field]);
    }
  });

  Object.keys(req.body).forEach((key) => {
    if (!ARRAY_FIELDS.includes(key) && key !== "_id") {
      student[key] = req.body[key];
    }
  });

  if (req.body.email) {
    student.email = normalizeEmail(req.body.email);
  }

  if (req.files?.cv?.[0]) {
    student.cv = req.files.cv[0].filename;
  }

  if (req.files?.profileImage?.[0]) {
    student.profileImage = req.files.profileImage[0].filename;
  }
};

exports.createStudentProfile = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    req.body.email = normalizedEmail;
    let student = await StudentProfile.findOne({ email: normalizedEmail });
    const isExistingProfile = Boolean(student);

    if (!student) {
      student = new StudentProfile();
    }

    applyProfilePayload(student, req);
    await student.save();
    const savedStudent = await StudentProfile.findById(student._id);

    res.status(isExistingProfile ? 200 : 201).json(serializeStudentProfile(savedStudent));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student profile id" });
    }

    const student = await StudentProfile.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(serializeStudentProfile(student));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentProfileByEmail = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ email: normalizeEmail(req.params.email) });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(serializeStudentProfile(student));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllStudentProfiles = async (req, res) => {
  try {
    const students = await StudentProfile.find().sort({ createdAt: -1 });
    res.json(students.map(serializeStudentProfile));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student profile id" });
    }

    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    applyProfilePayload(student, req);

    await student.save();
    const savedStudent = await StudentProfile.findById(student._id);
    res.json(serializeStudentProfile(savedStudent));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStudentProfile = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student profile id" });
    }

    const student = await StudentProfile.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
