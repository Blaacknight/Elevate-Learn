const Course = require('../models/course.model');
const Material = require('../models/material.model');
const Progress = require('../models/progress.model');
const puppeteer = require('puppeteer');

exports.checkCertificateEligibility = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    const total = await Material.countDocuments({ course: courseId });
    const progress = await Progress.findOne({ course: courseId, student: studentId });

    const completed = progress?.completedMaterials.length || 0;

    const eligible = total > 0 && completed === total;

    res.status(200).json({ eligible });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check eligibility', error: err.message });
  }
};



exports.downloadCertificate = async (req, res) => {
  try {
    const student = req.user;
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId).populate('tutor', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const html = `
      <html>
        <head>
          <style>
            body { text-align: center; font-family: sans-serif; padding: 40px; }
            h1 { color: #2c3e50; }
            .cert-box { border: 2px solid #2c3e50; padding: 30px; border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h1>🎓 Certificate of Completion</h1>
            <p>This certifies that <strong>${student.name}</strong></p>
            <p>has successfully completed the course</p>
            <h2>${course.title}</h2>
            <p><em>Instructor: ${course.tutor.name}</em></p>
            <p style="margin-top: 50px;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${course.title}_certificate.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate certificate', error: err.message });
  }
};

