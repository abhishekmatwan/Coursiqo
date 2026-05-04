// server/routes/certificate.js
// Add to index.js:
//   const certificateRoutes = require("./routes/certificate");
//   app.use("/api/v1/certificate", certificateRoutes);

const express = require("express");
const router = express.Router();

const {
  generateCertificate,
  getStudentCertificates,
  verifyCertificate,
} = require("../controllers/certificate");

const { auth, isStudent } = require("../middlewares/auth");

router.post("/generate", auth, isStudent, generateCertificate);
router.get("/my-certificates", auth, isStudent, getStudentCertificates);
router.get("/verify/:certificateId", verifyCertificate); // public route

module.exports = router;
