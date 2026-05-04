// server/controllers/certificate.js

const Certificate = require("../models/Certificate");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

// ─── Generate or fetch existing certificate ───────────────────────────────────
exports.generateCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    // Check if certificate already exists for this student + course
    const existing = await Certificate.findOne({ student: userId, course: courseId })
      .populate({ path: "student", select: "firstName lastName email" })
      .populate({ path: "course", select: "courseName" })
      .populate({ path: "instructor", select: "firstName lastName" });

    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    // Verify student has completed all lectures
    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Collect all subSection IDs
    const allSubSectionIds = course.courseContent.flatMap((section) =>
      section.subSection.map((sub) => sub._id.toString())
    );

    // Get student's progress
    const progress = await CourseProgress.findOne({
      userID: userId,
      courseID: courseId,
    });

    const completedIds = progress?.completedVideos?.map((id) => id.toString()) || [];

    // Check if all lectures are completed
    const allCompleted = allSubSectionIds.every((id) => completedIds.includes(id));

    if (!allCompleted) {
      return res.status(400).json({
        success: false,
        message: "Please complete all lectures to get the certificate",
        completed: completedIds.length,
        total: allSubSectionIds.length,
      });
    }

    // Generate unique certificate ID
    const certificateId = "SN-" + uuidv4().split("-")[0].toUpperCase();

    // Create certificate
    const certificate = await Certificate.create({
      certificateId,
      student: userId,
      course: courseId,
      instructor: course.instructor,
      completionDate: new Date(),
    });

    const populated = await Certificate.findById(certificate._id)
      .populate({ path: "student", select: "firstName lastName email" })
      .populate({ path: "course", select: "courseName" })
      .populate({ path: "instructor", select: "firstName lastName" });

    return res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ─── Get all certificates of a student ───────────────────────────────────────
exports.getStudentCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.find({ student: userId })
      .populate({ path: "student", select: "firstName lastName email" })
      .populate({ path: "course", select: "courseName thumbnail" })
      .populate({ path: "instructor", select: "firstName lastName" });

    return res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Verify a certificate by ID (public) ─────────────────────────────────────
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate({ path: "student", select: "firstName lastName" })
      .populate({ path: "course", select: "courseName" })
      .populate({ path: "instructor", select: "firstName lastName" });

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    return res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
