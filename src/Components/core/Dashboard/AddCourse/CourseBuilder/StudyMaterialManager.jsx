import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { VscTrash } from "react-icons/vsc";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { FiLink, FiFileText, FiClipboard } from "react-icons/fi";
import { setCourse } from "../../../../../slices/courseSlice";
import {
  addStudyMaterial,
  removeStudyMaterial,
} from "../../../../../services/operations/studyMaterialAPI";

const TYPE_ICON = {
  pdf:  <FiFileText className="text-yellow-50" size={16} />,
  link: <FiLink     className="text-yellow-50" size={16} />,
  note: <FiClipboard className="text-yellow-50" size={16} />,
};

const StudyMaterialManager = ({ subSectionId, viewOnly = false }) => {
  const { token }  = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);
  const dispatch   = useDispatch();

  // ── Always read materials live from Redux so UI updates instantly ──────────
  const existingMaterials = useMemo(() => {
    if (!course) return [];
    for (const section of course.courseContent) {
      const sub = section.subSection.find((s) => s._id === subSectionId);
      if (sub) return sub.studyMaterials || [];
    }
    return [];
  }, [course, subSectionId]);

  const [showForm,     setShowForm]     = useState(false);
  const [type,         setType]         = useState("pdf");
  const [title,        setTitle]        = useState("");
  const [url,          setUrl]          = useState("");
  const [noteContent,  setNoteContent]  = useState("");
  const [file,         setFile]         = useState(null);
  const [uploading,    setUploading]    = useState(false);

  const reset = () => {
    setTitle(""); setUrl(""); setNoteContent("");
    setFile(null); setType("pdf"); setShowForm(false);
  };

  const handleAdd = async () => {
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append("subSectionId", subSectionId);
    formData.append("courseId",     course._id);
    formData.append("title",        title.trim());
    formData.append("type",         type);

    if (type === "pdf") {
      if (!file) return;
      formData.append("studyFile", file);
    } else if (type === "link") {
      if (!url.trim()) return;
      formData.append("url", url.trim());
    } else if (type === "note") {
      if (!noteContent.trim()) return;
      formData.append("content", noteContent.trim());
    }

    setUploading(true);
    const updatedCourse = await addStudyMaterial(formData, token);
    setUploading(false);

    if (updatedCourse) {
      dispatch(setCourse(updatedCourse));
      reset();
    }
  };

  const handleRemove = async (studyMaterialId) => {
    const updatedCourse = await removeStudyMaterial(
      { studyMaterialId, subSectionId, courseId: course._id },
      token
    );
    if (updatedCourse) dispatch(setCourse(updatedCourse));
  };

  return (
    <div className="mt-6 flex flex-col space-y-3">
      <p className="text-sm font-semibold text-richblack-5">Study Materials</p>

      {/* ── Existing materials list ── */}
      {existingMaterials.length > 0 ? (
        <ul className="space-y-2">
          {existingMaterials.map((mat) => (
            <li
              key={mat._id}
              className="flex items-center justify-between rounded-md bg-richblack-700 px-3 py-2"
            >
              <div className="flex items-center gap-x-2">
                {TYPE_ICON[mat.type]}
                {mat.type === "note" ? (
                  <span className="text-sm text-richblack-5">{mat.title}</span>
                ) : (
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-yellow-50 underline hover:text-yellow-200"
                  >
                    {mat.title}
                  </a>
                )}
                <span className="rounded-full bg-richblack-600 px-2 py-0.5 text-[10px] uppercase text-richblack-300">
                  {mat.type}
                </span>
              </div>
              {!viewOnly && (
                <button
                  type="button"
                  onClick={() => handleRemove(mat._id)}
                  className="text-pink-300 hover:text-pink-100"
                >
                  <VscTrash size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-richblack-400">No study materials yet.</p>
      )}

      {/* ── Add form (hidden in view-only mode) ── */}
      {!viewOnly && (
        showForm ? (
          <div className="rounded-md border border-richblack-600 bg-richblack-700 p-4 space-y-3">
            {/* Type selector */}
            <div className="flex gap-x-3">
              {["pdf", "link", "note"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-x-1 rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                    type === t
                      ? "bg-yellow-50 text-richblack-900"
                      : "bg-richblack-600 text-richblack-200 hover:bg-richblack-500"
                  }`}
                >
                  {TYPE_ICON[t]}
                  {t}
                </button>
              ))}
            </div>

            {/* Title */}
            <input
              type="text"
              placeholder="Material title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-style w-full"
            />

            {/* Conditional input */}
            {type === "pdf" && (
              <div>
                <label className="text-xs text-richblack-300">Upload PDF *</label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-richblack-300 file:mr-4 file:rounded-md file:border-0 file:bg-richblack-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-yellow-50 hover:file:bg-richblack-500"
                />
                {file && (
                  <p className="mt-1 text-xs text-richblack-400">{file.name}</p>
                )}
              </div>
            )}

            {type === "link" && (
              <input
                type="url"
                placeholder="https://example.com *"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="form-style w-full"
              />
            )}

            {type === "note" && (
              <textarea
                placeholder="Write your note here *"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                className="form-style w-full resize-none"
              />
            )}

            <div className="flex gap-x-3">
              <button
                type="button"
                disabled={uploading}
                onClick={handleAdd}
                className="rounded-md bg-yellow-50 px-4 py-1.5 text-sm font-semibold text-richblack-900 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Add"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-sm text-richblack-300 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex w-fit items-center gap-x-1 text-sm font-semibold text-yellow-50 hover:text-yellow-200"
          >
            <AiOutlinePlusCircle size={18} />
            Add Study Material
          </button>
        )
      )}
    </div>
  );
};

export default StudyMaterialManager;
