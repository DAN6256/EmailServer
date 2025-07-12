const moment = require('moment');

// Application confirmation email template
const applicationConfirmationTemplate = (data) => {
  const { to_name, courses, submission_date } = data;
  
  const subject = 'Peer Tutor Application Confirmation - Ashesi University';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Peer Tutor Application Confirmation</h2>
      
      <p>Dear <strong>${to_name}</strong>,</p>
      
      <p>Thank you for applying to be a Peer Tutor at Ashesi University. We have received your application with the following details:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Courses Selected:</strong> ${courses}</p>
        <p><strong>Submission Date:</strong> ${submission_date}</p>
      </div>
      
      <p>Your application is currently under review by the academic advisor's office. We will contact you shortly with further instructions or to confirm your tutor status.</p>
      
      <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="color: #2c3e50; margin-top: 0;">Key Next Steps:</h4>
        <ul>
          <li>Await review confirmation</li>
          <li>Prepare for potential tutor training</li>
        </ul>
      </div>
      
      <p>Best regards,<br>
      <strong>Peer Tutoring Program</strong><br>
      Ashesi University</p>
    </div>
  `;
  
  const textContent = `
Dear ${to_name},

Thank you for applying to be a Peer Tutor at Ashesi University. We have received your application with the following details:

Courses Selected: ${courses}
Submission Date: ${submission_date}

Your application is currently under review by the academic advisor's office. We will contact you shortly with further instructions or to confirm your tutor status.

Key Next Steps:
- Await review confirmation
- Prepare for potential tutor training

Best regards,
Peer Tutoring Program
Ashesi University
  `;
  
  return { subject, htmlContent, textContent };
};

// Tutor booking notification email template
const tutorBookingNotificationTemplate = (data) => {
  const { 
    tutor_name, 
    student_name,
    student_email, 
    subject, 
    topic, 
    selected_time 
  } = data;
  
  const emailSubject = `New Tutoring Request: ${subject}`;
  const formattedTime = moment(selected_time).format('MMMM Do YYYY, h:mm A');
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">New Tutoring Session Request</h2>
      
      <p>Hello <strong>${tutor_name}</strong>,</p>
      
      <p>You have received a new tutoring request from <strong>${student_name}</strong> (<strong>${student_email}</strong>).</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="color: #2c3e50; margin-top: 0;">Session Details:</h4>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Requested Time:</strong> ${formattedTime}</p>
        <p><strong>Student:</strong> ${student_name} (${student_email})</p>
      </div>
      
      <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #bee5eb;">
        <h4 style="color: #2c3e50; margin-top: 0;">Next Steps:</h4>
        <ul>
          <li>Stay in touch with the student to arrange the meeting venue</li>
          <li>Prepare any necessary materials for the topic</li>
        </ul>
      </div>
      
      <p>This session is scheduled for 1 hour. Please coordinate directly with the student.</p>
      
      <p>Best regards,<br>
      <strong>Peer Tutoring System</strong><br>
      Ashesi University</p>
    </div>
  `;
  
  const textContent = `
Hello ${tutor_name},

You have received a new tutoring request from ${student_name} (${student_email}).

Session Details:
- Subject: ${subject}
- Topic: ${topic}
- Requested Time: ${formattedTime}
- Student: ${student_name} (${student_email})

Next Steps:
- Please confirm your availability for this session
- Contact the student to arrange the meeting venue
- Prepare any necessary materials for the topic

This session is scheduled for 1 hour. Please reach out to the student directly to confirm and coordinate.

Best regards,
Peer Tutoring System
Ashesi University
  `;
  
  return { subject: emailSubject, htmlContent, textContent };
};

// Student booking confirmation email template
const studentBookingConfirmationTemplate = (data) => {
  const { 
    student_name, 
    tutor_name, 
    tutor_email,
    tutor_number,
    subject, 
    topic, 
    selected_time 
  } = data;
  
  const emailSubject = `Booking Confirmed: ${subject} Session`;
  const formattedTime = moment(selected_time).format('MMMM Do YYYY, h:mm A');
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Tutoring Session Confirmed!</h2>
      
      <p>Hello <strong>${student_name}</strong>,</p>
      
      <p>Great news! Your tutoring session has been successfully booked.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="color: #2c3e50; margin-top: 0;">Your Session Details:</h4>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Date & Time:</strong> ${formattedTime}</p>
        <p><strong>Tutor:</strong> ${tutor_name}</p>
        <p><strong>Duration:</strong> 1 hour</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h4 style="color: #2c3e50; margin-top: 0;">Important Next Steps:</h4>
        <ul>
          <li>Contact your tutor at <strong>${tutor_number}</strong> to confirm the venue</li>
          <li>Prepare specific questions about the topic</li>
          <li>Bring any relevant materials or challenges</li>
        </ul>
      </div>
      
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #c3e6cb;">
        <h4 style="color: #2c3e50; margin-top: 0;">Tutor Contact Information:</h4>
        <p><strong>Email:</strong> ${tutor_email}</p>
        <p><strong>Phone:</strong> ${tutor_number}</p>
      </div>
      
      <p>Your tutor has also received notification of this booking. Please coordinate with them for the final venue details.</p>
      
      <p>Best regards,<br>
      <strong>Peer Tutoring System</strong><br>
      Ashesi University</p>
    </div>
  `;
  
  const textContent = `
Hello ${student_name},

Great news! Your tutoring session has been successfully booked.

Your Session Details:
- Subject: ${subject}
- Topic: ${topic}
- Date & Time: ${formattedTime}
- Tutor: ${tutor_name}
- Duration: 1 hour

Important Next Steps:
- Contact your tutor at ${tutor_number} to confirm the venue
- Prepare specific questions about the topic
- Bring any relevant materials or assignments

Tutor Contact Information:
- Email: ${tutor_email}
- Phone: ${tutor_number}

Your tutor will also receive notification of this booking. Please coordinate with them for the final venue details.

Best regards,
Peer Tutoring System
Ashesi University
  `;
  
  return { subject: emailSubject, htmlContent, textContent };
};

module.exports = {
  applicationConfirmationTemplate,
  tutorBookingNotificationTemplate,
  studentBookingConfirmationTemplate
};