export interface CalendarEvent {
  title: string;
  description: string;
  dateStr: string;
  shiftStr: string;
}

export const getEventDatesUTC = (dateStr: string, shiftStr: string) => {
  const [day, month] = dateStr.split(' - ')[0].split('/');
  const year = 2026;

  let startHour = 9;
  let endHour = 14;

  if (shiftStr.includes('Manhã')) { 
    startHour = 9; 
    endHour = 14; 
  } else if (shiftStr.includes('Tarde')) { 
    startHour = 14; 
    endHour = 20; 
  } else if (shiftStr.includes('Integral')) { 
    startHour = 9; 
    endHour = 18; 
  }

  // Convert to UTC (Sao Paulo is UTC-3)
  const startUTC = startHour + 3;
  const endUTC = endHour + 3;

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Format: YYYYMMDDThhmmssZ
  const dtStart = `${year}${pad(parseInt(month))}${pad(parseInt(day))}T${pad(startUTC)}0000Z`;
  const dtEnd = `${year}${pad(parseInt(month))}${pad(parseInt(day))}T${pad(endUTC)}0000Z`;

  return { dtStart, dtEnd, year, month, day, startHour };
};

export const generateICS = (events: CalendarEvent[]): string => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mega Bazar//Voluntariado//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    const { dtStart, dtEnd, year, month, day, startHour } = getEventDatesUTC(event.dateStr, event.shiftStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const uid = `${year}${pad(parseInt(month))}${pad(parseInt(day))}T${pad(startHour)}0000-${event.title.replace(/\s+/g, '')}@megabazar`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${event.title}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

export const getGoogleCalendarUrl = (event: CalendarEvent): string => {
  const { dtStart, dtEnd } = getEventDatesUTC(event.dateStr, event.shiftStr);
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(event.title);
  const dates = `${dtStart}/${dtEnd}`;
  const details = encodeURIComponent(event.description);
  return `${baseUrl}&text=${text}&dates=${dates}&details=${details}`;
};

export const getAppleCalendarDataUri = (events: CalendarEvent[]): string => {
  const ics = generateICS(events);
  return `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
};

export const downloadICS = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
