const moment = require('moment');

// Generate ICS calendar content
function generateICS(eventDetails) {
  const { subject, teacher, topic, selectedTime, duration = 60 } = eventDetails;
  
  const startDate = moment(selectedTime);
  const endDate = moment(selectedTime).add(duration, 'minutes');
  
  const formatDate = (date) => date.utc().format('YYYYMMDDTHHmmss[Z]');
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ashesi University//Peer Tutoring//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@ashesi.edu.gh
DTSTAMP:${formatDate(moment())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${subject} - Tutoring Session
DESCRIPTION:Tutoring session for ${topic} with ${teacher}\\n\\nPlease coordinate with your tutor for the venue details.
LOCATION:TBD - Contact tutor for venue details
ORGANIZER:CN=Peer Tutoring Program:MAILTO:tutoring@ashesi.edu.gh
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:${teacher}@ashesi.edu.gh
STATUS:CONFIRMED
SEQUENCE:0
PRIORITY:5
CLASS:PUBLIC
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
  generateICS
};