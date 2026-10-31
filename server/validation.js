const allowedServices = new Set([
  'Project Execution',
  'Project design',
  'Design and execution',
]);

function cleanString(value) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim()
    : '';
}

export function validateLead(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Please provide your contact details.' };
  }

  const lead = {
    fullName: cleanString(body.fullName),
    phoneNumber: cleanString(body.phoneNumber),
    email: cleanString(body.email).toLowerCase(),
    serviceRequired: cleanString(body.serviceRequired),
  };

  if (!lead.fullName || lead.fullName.length > 100) {
    return { error: 'Enter your name (up to 100 characters).' };
  }
  if (!lead.phoneNumber || lead.phoneNumber.length > 30 || !/^[+()\d.\s-]+$/.test(lead.phoneNumber)
      || (lead.phoneNumber.match(/\d/g) || []).length < 7 || (lead.phoneNumber.match(/\d/g) || []).length > 15) {
    return { error: 'Enter a valid phone number.' };
  }
  if (lead.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (!allowedServices.has(lead.serviceRequired)) {
    return { error: 'Choose one of the listed services.' };
  }

  return { lead };
}
