const moment = require('moment');

// Generate ICS calendar content with proper attendee handling
function generateICS(eventDetails) {
  const { 
    subject, 
    tutorName, 
    tutorEmail,
    studentName,
    studentEmail,
    topic, 
    selectedTime, 
    duration = 60 
  } = eventDetails;

  const startDate = moment(selectedTime);
  const endDate = moment(selectedTime).add(duration, 'minutes');

  const formatDate = (date) => date.utc().format('YYYYMMDDTHHmmss[Z]');

  // Generate unique UID for the event
  const uid = `tutoring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@ashesi.edu.gh`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ashesi University//Peer Tutoring System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(moment())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${subject} - Tutoring Session
DESCRIPTION:Tutoring session for ${topic}\\n\\nTutor: ${tutorName}\\nStudent: ${studentName}\\n\\nPlease coordinate with each other for the venue details.
LOCATION:TBD - Contact each other for venue details
ORGANIZER;CN=Peer Tutoring System:MAILTO:booktutor.ashesi@gmail.com
ATTENDEE;CN=${tutorName};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:${tutorEmail}
ATTENDEE;CN=${studentName};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:${studentEmail}
STATUS:TENTATIVE
SEQUENCE:0
PRIORITY:5
CLASS:PUBLIC
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Tutoring session reminder - 15 minutes
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Tutoring session reminder - 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

// Generate personalized ICS for individual recipients (better for Outlook/Exchange)
function generatePersonalizedICS(eventDetails, recipientEmail, recipientName) {
  const { 
    subject, 
    tutorName, 
    tutorEmail,
    studentName,
    studentEmail,
    topic, 
    selectedTime, 
    duration = 60 
  } = eventDetails;

  const startDate = moment(selectedTime);
  const endDate = moment(selectedTime).add(duration, 'minutes');

  const formatDate = (date) => date.utc().format('YYYYMMDDTHHmmss[Z]');

  // Generate unique UID for the event
  const uid = `tutoring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@ashesi.edu.gh`;

  // Determine the other participant
  const isForTutor = recipientEmail === tutorEmail;
  const otherParticipant = isForTutor ? 
    { name: studentName, email: studentEmail } : 
    { name: tutorName, email: tutorEmail };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ashesi University//Peer Tutoring System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(moment())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${subject} - Tutoring Session
DESCRIPTION:Tutoring session for ${topic}\\n\\n${isForTutor ? 'Student' : 'Tutor'}: ${otherParticipant.name} (${otherParticipant.email})\\n\\nPlease coordinate with each other for the venue details.
LOCATION:TBD - Contact each other for venue details
ORGANIZER;CN=Peer Tutoring System:MAILTO:booktutor.ashesi@gmail.com
ATTENDEE;CN=${recipientName};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:${recipientEmail}
ATTENDEE;CN=${otherParticipant.name};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:${otherParticipant.email}
STATUS:TENTATIVE
SEQUENCE:0
PRIORITY:5
CLASS:PUBLIC
TRANSP:OPAQUE
REQUEST-STATUS:2.0;Success
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Tutoring session reminder - 15 minutes
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Tutoring session reminder - 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

module.exports = {
  generateICS,
  generatePersonalizedICS
};