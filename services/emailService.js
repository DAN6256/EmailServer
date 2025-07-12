const { transporter } = require('../config/emailConfig');
const { 
  applicationConfirmationTemplate,
  tutorBookingNotificationTemplate,
  studentBookingConfirmationTemplate
} = require('../templates/emailTemplates');
const { generateICS } = require('../utils/calendarUtils');

// Send application confirmation email
const sendApplicationConfirmation = async (data) => {
  try {
    const { to_email, to_name, courses, submission_date } = data;
    
    const template = applicationConfirmationTemplate({ to_name, courses, submission_date });
    
    const mailOptions = {
      from: `"Peer Tutoring Program" <${process.env.EMAIL_USER}>`,
      to: to_email,
      subject: template.subject,
      text: template.textContent,
      html: template.htmlContent
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Application confirmation email sent successfully' };
    
  } catch (error) {
    console.error('Error sending application confirmation:', error);
    return { success: false, error: 'Failed to send email', details: error.message };
  }
};

// Send booking confirmation emails (both tutor and student)
const sendBookingConfirmation = async (data) => {
  try {
    const { 
      student_email, 
      student_name, 
      tutor_email,
      tutor_name,
      tutor_number,
      subject, 
      topic, 
      selected_time 
    } = data;
    
    // Generate calendar invite
    const icsContent = generateICS({
      subject,
      teacher: tutor_name,
      topic,
      selectedTime: selected_time
    });
    
    // Prepare tutor notification email
    const tutorTemplate = tutorBookingNotificationTemplate({
      tutor_name,
      student_name,
      student_email,
      subject,
      topic,
      selected_time
    });
    
    // Prepare student confirmation email
    const studentTemplate = studentBookingConfirmationTemplate({
      student_name,
      tutor_name,
      tutor_email,
      tutor_number,
      subject,
      topic,
      selected_time
    });
    
    // Send email to tutor
    const tutorMailOptions = {
      from: `"Peer Tutoring System" <${process.env.EMAIL_USER}>`,
      to: tutor_email,
      subject: tutorTemplate.subject,
      text: tutorTemplate.textContent,
      html: tutorTemplate.htmlContent,
      attachments: [
        {
          filename: 'tutoring-session.ics',
          content: icsContent,
          contentType: 'text/calendar'
        }
      ]
    };
    
    // Send email to student
    const studentMailOptions = {
      from: `"Peer Tutoring System" <${process.env.EMAIL_USER}>`,
      to: student_email,
      subject: studentTemplate.subject,
      text: studentTemplate.textContent,
      html: studentTemplate.htmlContent,
      attachments: [
        {
          filename: 'tutoring-session.ics',
          content: icsContent,
          contentType: 'text/calendar'
        }
      ]
    };
    
    // Send both emails
    await Promise.all([
      transporter.sendMail(tutorMailOptions),
      transporter.sendMail(studentMailOptions)
    ]);
    
    return { 
      success: true, 
      message: 'Booking confirmation emails sent successfully to both tutor and student' 
    };
    
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return { success: false, error: 'Failed to send email', details: error.message };
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendBookingConfirmation
};