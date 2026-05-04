const StudyMaterial = require("../models/StudyMaterial");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");
const cloudinary = require("cloudinary").v2;

// ─── Helper: upload any file to Cloudinary ────────────────────────────────────
const uploadToCloudinary = (file, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.tempFilePath,
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
exports.createStudyMaterial = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subSectionId, courseId, title, type, url, content } = req.body;

    if (!subSectionId || !courseId || !title || !type) {
      return res.status(400).json({
        success: false,
        message: "subSectionId, courseId, title and type are required",
      });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({ success: false, message: "SubSection not found" });
    }

    let materialUrl = null;
    let materialContent = null;

    if (type === "pdf") {
      if (!req.files || !req.files.studyFile) {
        return res.status(400).json({ success: false, message: "PDF file is required" });
      }
      const uploaded = await uploadToCloudinary(
        req.files.studyFile,
        process.env.FOLDER_NAME,
        "raw"   // "raw" allows Cloudinary to accept PDFs and other documents
      );
      materialUrl = uploaded.secure_url;
    } else if (type === "link") {
      if (!url) {
        return res.status(400).json({ success: false, message: "URL is required for link type" });
      }
      materialUrl = url;
    } else if (type === "note") {
      if (!content) {
        return res.status(400).json({ success: false, message: "Content is required for note type" });
      }
      materialContent = content;
    } else {
      return res.status(400).json({ success: false, message: "Invalid type. Use pdf, link or note" });
    }

    const studyMaterial = await StudyMaterial.create({
      title,
      type,
      url: materialUrl,
      content: materialContent,
      uploadedBy: userId,
    });

    await SubSection.findByIdAndUpdate(subSectionId, {
      $push: { studyMaterials: studyMaterial._id },
    });

    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          populate: { path: "studyMaterials" },
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Study material added successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error creating study material:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
exports.deleteStudyMaterial = async (req, res) => {
  try {
    const { studyMaterialId, subSectionId, courseId } = req.body;

    if (!studyMaterialId || !subSectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "studyMaterialId, subSectionId and courseId are required",
      });
    }

    await StudyMaterial.findByIdAndDelete(studyMaterialId);
    await SubSection.findByIdAndUpdate(subSectionId, {
      $pull: { studyMaterials: studyMaterialId },
    });

    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          populate: { path: "studyMaterials" },
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Study material deleted successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error deleting study material:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ─── GET BY SUBSECTION ───────────────────────────────────────────────────────
exports.getStudyMaterialsBySubSection = async (req, res) => {
  try {
    const { subSectionId } = req.body;
    if (!subSectionId) {
      return res.status(400).json({ success: false, message: "subSectionId is required" });
    }
    const subSection = await SubSection.findById(subSectionId).populate("studyMaterials");
    if (!subSection) {
      return res.status(404).json({ success: false, message: "SubSection not found" });
    }
    return res.status(200).json({ success: true, data: subSection.studyMaterials });
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
