const moment = require('moment');
const { sendEmailJS } = require('../config/emailConfig');

const SERVICE_ID = process.env.SERVICE_ID; 
const TUTOR_TEMPLATE_ID = process.env.TUTOR_TEMPLATE_ID;
const STUDENT_TEMPLATE_ID = process.env.STUDENT_TEMPLATE_ID;

const generateGoogleCalendarLink = (subject, details, time) => {
  try {
    const startDate = new Date(time);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const format = (d) => d.toISOString().replace(/-|:|\.\d{3}/g, '');
    
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', subject);
    url.searchParams.append('dates', `${format(startDate)}/${format(endDate)}`);
    url.searchParams.append('details', details);
    
    return url.toString();
  } catch (e) {
    console.error("Error generating calendar link", e);
    return "https://calendar.google.com";
  }
};

//I will implement this later
const sendApplicationConfirmation = async (data) => {
    console.log("Application confirmation log only (Template not set up)");
    return { success: true, message: 'Log only: EmailJS template needed' };
};


const sendBookingConfirmation = async (data) => {
  try {
    let { 
      student_email, student_name, 
      tutor_email, tutor_name, tutor_number, 
      subject, topic, selected_time 
    } = data;

    student_email = student_email ? student_email.trim() : '';
    tutor_email = tutor_email ? tutor_email.trim() : '';

    const formatted_time = moment(selected_time).format('dddd, MMM Do YYYY, h:mm A');

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

    const [studentRes, tutorRes] = await Promise.all([
      sendEmailJS(SERVICE_ID, STUDENT_TEMPLATE_ID, studentParams),
      sendEmailJS(SERVICE_ID, TUTOR_TEMPLATE_ID, tutorParams)
    ]);

   
    if (studentRes.success && tutorRes.success) {
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