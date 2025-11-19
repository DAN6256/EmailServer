const { transporter } = require('../config/emailConfig');
const { 
  applicationConfirmationTemplate,
  tutorBookingNotificationTemplate,
  studentBookingConfirmationTemplate
} = require('../templates/emailTemplates');
const { generateICS, generatePersonalizedICS } = require('../utils/calendarUtils');

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
/*
// Send booking confirmation emails with better calendar integration
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
    
    // Generate personalized calendar invites for better compatibility
    const tutorICS = generatePersonalizedICS({
      subject,
      tutorName: tutor_name,
      tutorEmail: tutor_email,
      studentName: student_name,
      studentEmail: student_email,
      topic,
      selectedTime: selected_time
    }, tutor_email, tutor_name);
    
    const studentICS = generatePersonalizedICS({
      subject,
      tutorName: tutor_name,
      tutorEmail: tutor_email,
      studentName: student_name,
      studentEmail: student_email,
      topic,
      selectedTime: selected_time
    }, student_email, student_name);
    
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
    
    // Send email to tutor with calendar invite
    const tutorMailOptions = {
      from: `"Peer Tutoring System" <${process.env.EMAIL_USER}>`,
      to: tutor_email,
      subject: tutorTemplate.subject,
      text: tutorTemplate.textContent,
      html: tutorTemplate.htmlContent,
      icalEvent: {
        filename: 'invite.ics',
        method: 'REQUEST',
        content: tutorICS
      },
      attachments: [
        {
          filename: 'tutoring-session.ics',
          content: Buffer.from(tutorICS, 'utf8'),
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ]
    };
    
    // Send email to student with calendar invite
    const studentMailOptions = {
      from: `"Peer Tutoring System" <${process.env.EMAIL_USER}>`,
      to: student_email,
      subject: studentTemplate.subject,
      text: studentTemplate.textContent,
      html: studentTemplate.htmlContent,
      icalEvent: {
        filename: 'invite.ics',
        method: 'REQUEST',
        content: studentICS
      },
      attachments: [
        {
          filename: 'tutoring-session.ics',
          content: Buffer.from(studentICS, 'utf8'),
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
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
*/
const sendBookingConfirmation = async (data) => {
  try {
    // Destructure and sanitize inputs
    let { 
      student_email, 
      student_name, 
      tutor_email,
      tutor_name,
      tutor_number,
      subject, 
      topic, 
      selected_time 
    } = data;

    // CRITICAL FIX: Trim whitespace. Copy-pasting emails often adds invisible spaces 
    // which causes delivery failures or bounces.
    student_email = student_email ? student_email.trim() : '';
    tutor_email = tutor_email ? tutor_email.trim() : '';

    // 1. Generate personalized calendar invites
    const tutorICS = generatePersonalizedICS({
      subject,
      tutorName: tutor_name,
      tutorEmail: tutor_email,
      studentName: student_name,
      studentEmail: student_email,
      topic,
      selectedTime: selected_time
    }, tutor_email, tutor_name);
    
    const studentICS = generatePersonalizedICS({
      subject,
      tutorName: tutor_name,
      tutorEmail: tutor_email,
      studentName: student_name,
      studentEmail: student_email,
      topic,
      selectedTime: selected_time
    }, student_email, student_name);
    
    // 2. Prepare templates
    const tutorTemplate = tutorBookingNotificationTemplate({
      tutor_name,
      student_name,
      student_email,
      subject,
      topic,
      selected_time
    });
    
    const studentTemplate = studentBookingConfirmationTemplate({
      student_name,
      tutor_name,
      tutor_email,
      tutor_number,
      subject,
      topic,
      selected_time
    });

    // 3. Define Sender Identity
    // Ensure this matches the authenticated user exactly
    const senderIdentity = `"Peer Tutoring System" <${process.env.EMAIL_USER}>`;
    
    // 4. Configure Tutor Email (Clean Configuration)
    const tutorMailOptions = {
      from: senderIdentity,
      to: tutor_email,
      replyTo: process.env.EMAIL_USER, // PROPER HEADERS: Increases trust score
      subject: tutorTemplate.subject,
      text: tutorTemplate.textContent, // MANDATORY: Spam filters block HTML-only emails
      html: tutorTemplate.htmlContent,
      icalEvent: {
        filename: 'invite.ics',
        method: 'REQUEST',
        content: tutorICS
      }
      // NOTE: 'attachments' array removed. Having both icalEvent and attachments 
      // often flags the email as "confusing/spam" in Exchange/Outlook servers.
    };
    
    // 5. Configure Student Email
    const studentMailOptions = {
      from: senderIdentity,
      to: student_email,
      replyTo: process.env.EMAIL_USER,
      subject: studentTemplate.subject,
      text: studentTemplate.textContent,
      html: studentTemplate.htmlContent,
      icalEvent: {
        filename: 'invite.ics',
        method: 'REQUEST',
        content: studentICS
      }
    };
    
    // 6. Send both emails
    await Promise.all([
      transporter.sendMail(tutorMailOptions),
      transporter.sendMail(studentMailOptions)
    ]);
    
    console.log(`Booking confirmation sent to Student: ${student_email} and Tutor: ${tutor_email}`);

    return { 
      success: true, 
      message: 'Booking confirmation emails sent successfully to both tutor and student' 
    };
    
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return { success: false, error: 'Failed to send email', details: error.message };
  }
};
// Alternative approach: Send personalized calendar invites
const sendBookingConfirmationWithPersonalizedInvites = async (data) => {
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
    
    // Generate separate ICS for tutor and student
    const tutorICS = generatePersonalizedICS({
      subject,
      tutorName: tutor_name,
      tutorEmail: tutor_email,
      studentName: student_name,
      studentEmail: student_email,
      topic,
      selectedTime: selected_time
    }, true);
    
    const studentICS = generatePersonalizedICS({
      subject,
      tutorName: tutor_name,
      tutorEmail: tutor_email,
      studentName: student_name,
      studentEmail: student_email,
      topic,
      selectedTime: selected_time
    }, false);
    
    // Prepare templates
    const tutorTemplate = tutorBookingNotificationTemplate({
      tutor_name,
      student_name,
      student_email,
      subject,
      topic,
      selected_time
    });
    
    const studentTemplate = studentBookingConfirmationTemplate({
      student_name,
      tutor_name,
      tutor_email,
      tutor_number,
      subject,
      topic,
      selected_time
    });
    
    // Send personalized emails
    const tutorMailOptions = {
      from: `"Peer Tutoring System" <${process.env.EMAIL_USER}>`,
      to: tutor_email,
      subject: tutorTemplate.subject,
      text: tutorTemplate.textContent,
      html: tutorTemplate.htmlContent,
      attachments: [
        {
          filename: 'tutoring-session.ics',
          content: tutorICS,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ],
      alternatives: [
        {
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
          content: tutorICS
        }
      ]
    };
    
    const studentMailOptions = {
      from: `"Peer Tutoring System" <${process.env.EMAIL_USER}>`,
      to: student_email,
      subject: studentTemplate.subject,
      text: studentTemplate.textContent,
      html: studentTemplate.htmlContent,
      attachments: [
        {
          filename: 'tutoring-session.ics',
          content: studentICS,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ],
      alternatives: [
        {
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
          content: studentICS
        }
      ]
    };
    
    await Promise.all([
      transporter.sendMail(tutorMailOptions),
      transporter.sendMail(studentMailOptions)
    ]);
    
    return { 
      success: true, 
      message: 'Personalized booking confirmation emails sent successfully' 
    };
    
  } catch (error) {
    console.error('Error sending personalized booking confirmation:', error);
    return { success: false, error: 'Failed to send email', details: error.message };
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendBookingConfirmation
};