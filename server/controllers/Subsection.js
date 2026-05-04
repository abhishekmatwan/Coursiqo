// controllers/Subsection.js  (UPDATED — adds studyMaterials populate everywhere)
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Helper so we never forget to populate studyMaterials
const populatedCourse = (courseId) =>
  Course.findById(courseId)
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
        populate: { path: "studyMaterials" },   // ← NEW
      },
    })
    .exec();

// ─── CREATE ──────────────────────────────────────────────────────────────────
exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description, courseId } = req.body;
    const video = req.files.videoFile;

    if (!sectionId || !title || !description || !video || !courseId) {
      return res
        .status(404)
        .json({ success: false, message: "All Fields are Required" });
    }

    const ifsection = await Section.findById(sectionId);
    if (!ifsection) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_VIDEO
    );

    const SubSectionDetails = await SubSection.create({
      title,
      description,
      videoUrl: uploadDetails.secure_url,
      studyMaterials: [],           // ← NEW: start empty
    });

    await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    );

    const updatedCourse = await populatedCourse(courseId);
    return res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────
exports.updateSubSection = async (req, res) => {
  try {
    const { SubsectionId, title, description, courseId } = req.body;
    const video = req?.files?.videoFile;

    let uploadDetails = null;
    if (video) {
      uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_VIDEO
      );
    }

    await SubSection.findByIdAndUpdate(
      { _id: SubsectionId },
      {
        title: title || SubSection.title,
        description: description || SubSection.description,
        videoUrl: uploadDetails?.secure_url || SubSection.videoUrl,
      },
      { new: true }
    );

    const updatedCourse = await populatedCourse(courseId);
    return res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error("Error updating sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, courseId, sectionId } = req.body;

    if (!subSectionId || !sectionId) {
      return res
        .status(404)
        .json({ success: false, message: "All fields are required" });
    }

    const ifsubSection = await SubSection.findById(subSectionId);
    const ifsection = await Section.findById(sectionId);

    if (!ifsubSection) {
      return res
        .status(404)
        .json({ success: false, message: "Sub-section not found" });
    }
    if (!ifsection) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    await SubSection.findByIdAndDelete(subSectionId);
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $pull: { subSection: subSectionId } },
      { new: true }
    );

    const updatedCourse = await populatedCourse(courseId);
    return res
      .status(200)
      .json({ success: true, message: "Sub-section deleted", data: updatedCourse });
  } catch (error) {
    console.error("Error deleting sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
