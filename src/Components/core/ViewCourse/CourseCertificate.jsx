// src/Components/core/ViewCourse/CourseCertificate.jsx
//
// Shows a "Get Certificate" button when all lectures are done.
// On click, generates the certificate and shows it with a download button.

import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { generateCertificate } from "../../../services/operations/certificateAPI";
import { FiDownload, FiAward } from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CourseCertificate = ({ courseId, totalLectures, completedLectures }) => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const certRef = useRef(null);

  const allCompleted =
    totalLectures > 0 && completedLectures >= totalLectures;

  const handleGenerate = async () => {
    setLoading(true);
    const data = await generateCertificate(courseId, token);
    setLoading(false);
    if (data) {
      setCertificate(data);
      setShowCert(true);
    }
  };

  const handleDownload = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${certificate?.course?.courseName}_Certificate.pdf`);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!allCompleted) return null;

  return (
    <div className="mt-8">
      {!showCert ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-yellow-50 bg-richblack-800 p-6 text-center">
          <FiAward size={48} className="text-yellow-50" />
          <p className="text-xl font-semibold text-richblack-5">
            🎉 Congratulations! You've completed the course!
          </p>
          <p className="text-richblack-300 text-sm">
            You have watched all lectures. Claim your certificate now.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-md bg-yellow-50 px-6 py-2 font-semibold text-richblack-900 hover:bg-yellow-100 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Get Certificate"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {/* ── Certificate Design ── */}
          <div
            ref={certRef}
            className="relative w-full max-w-[800px] bg-white text-richblack-900 rounded-xl overflow-hidden"
            style={{ aspectRatio: "1.414 / 1", fontFamily: "Georgia, serif" }}
          >
            {/* Border decoration */}
            <div className="absolute inset-0 border-[12px] border-yellow-400 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border-[3px] border-yellow-300 rounded-lg pointer-events-none" />

            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Content */}
            <div className="relative flex flex-col items-center justify-center h-full px-16 py-10 gap-3">
              {/* Platform name */}
              <p className="text-2xl font-bold tracking-widest text-yellow-600 uppercase">
                Coursiqo
              </p>

              <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
                Certificate of Completion
              </p>

              <div className="w-24 h-[2px] bg-yellow-400 my-2" />

              <p className="text-base text-gray-600">This is to certify that</p>

              <p className="text-4xl font-bold text-richblack-900 mt-1">
                {certificate?.student?.firstName} {certificate?.student?.lastName}
              </p>

              <p className="text-base text-gray-600 mt-1">
                has successfully completed the course
              </p>

              <p className="text-2xl font-semibold text-yellow-700 text-center mt-1">
                {certificate?.course?.courseName}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Instructed by{" "}
                <span className="font-semibold text-richblack-800">
                  {certificate?.instructor?.firstName}{" "}
                  {certificate?.instructor?.lastName}
                </span>
              </p>

              <div className="w-24 h-[2px] bg-yellow-400 my-2" />

              <div className="flex justify-between w-full mt-2 text-xs text-gray-500">
                <div className="text-center">
                  <p className="font-semibold text-richblack-800">
                    {formatDate(certificate?.completionDate)}
                  </p>
                  <p>Date of Completion</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-richblack-800">
                    {certificate?.certificateId}
                  </p>
                  <p>Certificate ID</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Buttons ── */}
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-md bg-yellow-50 px-6 py-2 font-semibold text-richblack-900 hover:bg-yellow-100"
            >
              <FiDownload size={18} />
              Download PDF
            </button>
            <button
              onClick={() => setShowCert(false)}
              className="rounded-md border border-richblack-500 px-6 py-2 text-richblack-300 hover:border-richblack-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCertificate;
