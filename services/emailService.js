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
};*/
const createGoogleCalendarLink = (subject, topic, time, type) => {
  const dateObj = new Date(time);
  
  // Format start/end times for Google URL (YYYYMMDDTHHMMSSZ)
  const start = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
  
  // Assume 1 hour duration
  const endDate = new Date(dateObj.getTime() + 60 * 60 * 1000); 
  const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
  
  const title = encodeURIComponent(`Tutoring: ${subject} (${type})`);
  const details = encodeURIComponent(`Topic: ${topic}\n\nThis is a confirmed peer tutoring session.`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
};

const sendBookingConfirmation = async (data) => {
  try {
    let { 
      student_email, student_name, tutor_email, tutor_name, 
      tutor_number, subject, topic, selected_time 
    } = data;

    // Clean inputs
    student_email = student_email ? student_email.trim() : '';
    tutor_email = tutor_email ? tutor_email.trim() : '';

    // GENERATE LINKS INSTEAD OF FILES (Spam Filter Friendly)
    const studentCalLink = createGoogleCalendarLink(subject, topic, selected_time, "Student");
    const tutorCalLink = createGoogleCalendarLink(subject, topic, selected_time, "Tutor");

    // Prepare simple HTML messages
    // We inject the link directly into the HTML
    const footer = `
      <br><br>
      <hr>
      <p style="font-size: 14px; color: #555;">
        <strong>📅 Add to Calendar:</strong> <a href="${studentCalLink}" target="_blank">Click here to add to Google Calendar</a>
      </p>
    `;

    const tutorFooter = `
      <br><br>
      <hr>
      <p style="font-size: 14px; color: #555;">
        <strong>📅 Add to Calendar:</strong> <a href="${tutorCalLink}" target="_blank">Click here to add to Google Calendar</a>
      </p>
    `;

    // Send to TUTOR
    const tutorMailOptions = {
      from: `"Peer Tutoring" <${process.env.EMAIL_USER}>`, // Simplified name
      to: tutor_email,
      replyTo: process.env.EMAIL_USER,
      subject: `New Booking: ${student_name} for ${subject}`,
      // Simple text body
      text: `You have a new booking.\nStudent: ${student_name}\nSubject: ${subject}\nTime: ${selected_time}\n\nAdd to calendar: ${tutorCalLink}`, 
      // HTML body
      html: `<p>Hi ${tutor_name},</p><p>You have a new booking with <strong>${student_name}</strong>.</p><p><strong>Subject:</strong> ${subject}<br><strong>Topic:</strong> ${topic}<br><strong>Time:</strong> ${selected_time}</p>${tutorFooter}`
    };

    // Send to STUDENT
    const studentMailOptions = {
      from: `"Peer Tutoring" <${process.env.EMAIL_USER}>`,
      to: student_email,
      replyTo: process.env.EMAIL_USER,
      subject: `Booking Confirmed: ${subject} with ${tutor_name}`,
      text: `Booking Confirmed.\nTutor: ${tutor_name}\nSubject: ${subject}\nTime: ${selected_time}\n\nAdd to calendar: ${studentCalLink}`,
      html: `<p>Hi ${student_name},</p><p>Your session is confirmed.</p><p><strong>Tutor:</strong> ${tutor_name}<br><strong>Contact:</strong> ${tutor_number}<br><strong>Time:</strong> ${selected_time}</p>${footer}`
    };

    // Send emails WITHOUT 'icalEvent' or 'attachments'
    await Promise.all([
      transporter.sendMail(tutorMailOptions),
      transporter.sendMail(studentMailOptions)
    ]);

    console.log(`Safe-mode emails sent to ${student_email} and ${tutor_email}`);
    return { success: true, message: 'Emails sent successfully (Safe Mode)' };

  } catch (error) {
    console.error('Error sending email:', error);
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