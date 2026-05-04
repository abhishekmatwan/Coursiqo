import React, { useState } from "react";
import { FiFileText, FiLink, FiClipboard, FiChevronDown, FiChevronUp, FiDownload, FiExternalLink } from "react-icons/fi";

const TYPE_CONFIG = {
  pdf: {
    icon: <FiFileText size={16} />,
    label: "PDF",
    color: "text-yellow-50",
    bg: "bg-yellow-900/30",
    border: "border-yellow-700",
  },
  link: {
    icon: <FiLink size={16} />,
    label: "Link",
    color: "text-blue-300",
    bg: "bg-blue-900/30",
    border: "border-blue-700",
  },
  note: {
    icon: <FiClipboard size={16} />,
    label: "Note",
    color: "text-green-300",
    bg: "bg-green-900/30",
    border: "border-green-700",
  },
};

const NoteCard = ({ material }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-md border ${TYPE_CONFIG.note.border} ${TYPE_CONFIG.note.bg} p-3`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-x-2 text-green-300">
          <FiClipboard size={16} />
          <span className="text-sm font-medium">{material.title}</span>
        </div>
        {open ? <FiChevronUp size={16} className="text-richblack-300" /> : <FiChevronDown size={16} className="text-richblack-300" />}
      </button>
      {open && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-richblack-100 leading-relaxed">
          {material.content}
        </p>
      )}
    </div>
  );
};

const StudyMaterialViewer = ({ studyMaterials = [] }) => {
  if (!studyMaterials || studyMaterials.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-base font-semibold text-richblack-5">
        📚 Study Materials
      </h3>
      <div className="space-y-2">
        {studyMaterials.map((mat) => {
          if (mat.type === "note") {
            return <NoteCard key={mat._id} material={mat} />;
          }

          const cfg = TYPE_CONFIG[mat.type] || TYPE_CONFIG.link;

          return (
            <a
              key={mat._id}
              href={mat.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between rounded-md border ${cfg.border} ${cfg.bg} px-3 py-2 transition-opacity hover:opacity-80`}
            >
              <div className={`flex items-center gap-x-2 ${cfg.color}`}>
                {cfg.icon}
                <span className="text-sm font-medium text-richblack-5">
                  {mat.title}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-semibold ${cfg.color} bg-richblack-700`}
                >
                  {cfg.label}
                </span>
              </div>
              {mat.type === "pdf" ? (
                <FiDownload size={15} className="text-richblack-300" />
              ) : (
                <FiExternalLink size={15} className="text-richblack-300" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default StudyMaterialViewer;
