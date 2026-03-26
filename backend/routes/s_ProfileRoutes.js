const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const profileController = require("../controllers/s_ProfileController");
const uploadDir = path.join(__dirname, "..", "upload");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post(
  "/create",
  upload.fields([{ name: "cv" }, { name: "profileImage" }]),
  profileController.createStudentProfile
);

router.get("/all", profileController.getAllStudentProfiles);
router.get("/", profileController.getAllStudentProfiles);
router.get("/email/:email", profileController.getStudentProfileByEmail);
router.get("/:id", profileController.getStudentProfile);

router.put(
  "/update/:id",
  upload.fields([{ name: "cv" }, { name: "profileImage" }]),
  profileController.updateStudentProfile
);

router.delete("/:id", profileController.deleteStudentProfile);

module.exports = router;
