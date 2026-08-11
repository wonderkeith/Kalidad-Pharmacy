const { IncomingForm } = require('formidable');
const fs = require('fs');
const { Resend } = require('resend');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new IncomingForm({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ error: 'Could not read application form.' });
      return;
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const firstName = fields.firstname?.[0] || fields.firstname || '';
      const surname = fields.surname?.[0] || fields.surname || '';
      const position = fields.position?.[0] || fields.position || 'Career Application';
      const applicantName = `${firstName} ${surname}`.trim();

      const getField = (name) => fields[name]?.[0] || fields[name] || 'Not provided';

      const attachments = [];
      const cv = files.cv?.[0] || files.cv;

      if (cv && cv.filepath) {
        attachments.push({
          filename: cv.originalFilename || 'CV',
          content: fs.readFileSync(cv.filepath)
        });
      }

      await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: process.env.APPLICATION_EMAIL,
        subject: `New Career Application — ${applicantName || position}`,
        text: `
NEW KALIDAD PHARMACY CAREER APPLICATION

Applicant Details
Surname: ${getField('surname')}
First name: ${getField('firstname')}
Other names: ${getField('othernames')}
Gender: ${getField('gender')}
Date of birth: ${getField('dob')}
Nationality: ${getField('nationality')}

Position
${getField('position')}

Experience
${getField('experience')}

Qualification
${getField('qualification')}

Why they want to join
${getField('message')}
        `.trim(),
        attachments
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Unable to send your application. Please try again.' });
    }
  });
};
