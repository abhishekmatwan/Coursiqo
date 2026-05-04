const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // "pdf" | "link" | "note"
    type: {
      type: String,
      enum: ["pdf", "link", "note"],
      required: true,
    },
    // For pdf: Cloudinary secure_url. For link: the URL itself. For note: null.
    url: {
      type: String,
      default: null,
    },
    // For note type only
    content: {
      type: String,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
