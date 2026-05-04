const express = require("express");
const router = express.Router();

const {
  createStudyMaterial,
  deleteStudyMaterial,
  getStudyMaterialsBySubSection,
} = require("../controllers/studyMaterial");

const { auth, isInstructor } = require("../middlewares/auth");
const { isDemo } = require("../middlewares/demo");

router.post("/create", auth, isInstructor, isDemo, createStudyMaterial);
router.delete("/delete", auth, isInstructor, isDemo, deleteStudyMaterial);
router.post("/getBySubSection", auth, getStudyMaterialsBySubSection);

module.exports = router;