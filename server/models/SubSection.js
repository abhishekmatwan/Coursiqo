const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
  title: { type: String },
  timeDuration: { type: String },
  description: { type: String },
  videoUrl: { type: String },
  // ── NEW ──────────────────────────────────────────────
  studyMaterials: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyMaterial",
    },
  ],
  // ─────────────────────────────────────────────────────
});

module.exports = mongoose.model("SubSection", SubSectionSchema);
