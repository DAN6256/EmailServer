const moment = require('moment');
const { sendEmailJS } = require('../config/emailConfig');

// Constants from your setup
const SERVICE_ID = process.env.SERVICE_ID;
const TUTOR_TEMPLATE_ID = process.env.TUTOR_TEMPLATE_ID;
const STUDENT_TEMPLATE_ID = process.env.STUDENT_TEMPLATE_ID;

// --- HELPER: Generate Google Calendar Link ---
const generateGoogleCalendarLink = (subject, details, time) => {
  try {
    const startDate = new Date(time);
    // Assume 1 hour duration
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    // Format dates to YYYYMMDDTHHMMSSZ (Required by Google)
    const format = (d) => d.toISOString().replace(/-|:|\.\d{3}/g, '');
    
    const startStr = format(startDate);
    const endStr = format(endDate);
    
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', subject);
    url.searchParams.append('dates', `${startStr}/${endStr}`);
    url.searchParams.append('details', details);
    
    return url.toString();
  } catch (e) {
    console.error("Error generating calendar link", e);
    return "https://calendar.google.com"; // Fallback
  }
};

// Send application confirmation email
// NOTE: You need to create a template in EmailJS for this if you want it to work.
// For now, I have commented it out or you can map it to a generic template.
const sendApplicationConfirmation = async (data) => {
    console.log("Application confirmation pending template creation in EmailJS");
    return { success: true, message: 'Log only: EmailJS template needed' };
};

// Main Booking Confirmation Function
const sendBookingConfirmation = async (data) => {
  try {
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

    // 1. Sanitize inputs
    student_email = student_email ? student_email.trim() : '';
    tutor_email = tutor_email ? tutor_email.trim() : '';

    // 2. Format the date nicely for the email text (e.g., "Monday, Nov 25th 2025, 2:00 PM")
    const formatted_time = moment(selected_time).format('dddd, MMM Do YYYY, h:mm A');

    // 3. Generate Calendar Links
    const tutorCalLink = generateGoogleCalendarLink(
      `Tutoring: ${subject} with ${student_name}`, 
      `Topic: ${topic}\nStudent: ${student_name} (${student_email})`, 
      selected_time
    );

    const studentCalLink = generateGoogleCalendarLink(
      `Tutoring: ${subject} with ${tutor_name}`, 
      `Topic: ${topic}\nTutor: ${tutor_name}\nContact: ${tutor_number}`, 
      selected_time
    );

    // 4. Prepare Data for Student Email (template_rbtg2jf)
    const studentParams = {
      to_email: student_email,
      student_name: student_name,
      tutor_name: tutor_name,
      tutor_email: tutor_email,
      tutor_number: tutor_number,
      subject: subject,
      topic: topic,
      formatted_time: formatted_time,
      calendar_link: studentCalLink
    };

    // 5. Prepare Data for Tutor Email (template_93kap4p)
    const tutorParams = {
      to_email: tutor_email,
      tutor_name: tutor_name,
      student_name: student_name,
      student_email: student_email,
      subject: subject,
      topic: topic,
      formatted_time: formatted_time,
      calendar_link: tutorCalLink
    };

    // 6. Send Requests to EmailJS
    const [studentRes, tutorRes] = await Promise.all([
      sendEmailJS(STUDENT_TEMPLATE_ID, studentParams),
      sendEmailJS(TUTOR_TEMPLATE_ID, tutorParams)
    ]);

    // Check results
    if (studentRes.success && tutorRes.success) {
      console.log(`Emails sent via EmailJS to ${student_email} and ${tutor_email}`);
      return { success: true, message: 'Booking confirmation emails sent successfully' };
    } else {
      console.error('Partial or full failure in EmailJS sending');
      return { 
        success: false, 
        error: 'Email sending failed', 
        details: { student: studentRes, tutor: tutorRes } 
      };
    }

  } catch (error) {
    console.error('Error in booking confirmation service:', error);
    return { success: false, error: 'Internal Server Error', details: error.message };
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendBookingConfirmation
};