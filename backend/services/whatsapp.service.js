// =============================================
// WHATSAPP API SERVICE (Mock/Integration Ready)
// =============================================

/**
 * Sends a WhatsApp message using a provider (e.g., Twilio, Meta API, or Baileys)
 * @param {string} to - The phone number to send the message to (e.g., +1234567890)
 * @param {string} message - The text content of the message
 */
export const sendWhatsAppMessage = async (to, message) => {
  if (!to) {
    console.warn('WhatsApp: Missing "to" phone number. Message aborted.');
    return false;
  }

  try {
    // ----------------------------------------------------------------------
    // In production, integrate your WhatsApp provider here:
    // e.g. Twilio:
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({ body: message, from: 'whatsapp:+14155238886', to: `whatsapp:${to}` });
    // ----------------------------------------------------------------------
    
    console.log(`[WhatsApp API] 📲 Message successfully sent to ${to}`);
    console.log(`[WhatsApp API] Content: "${message}"`);
    
    return true;
  } catch (error) {
    console.error(`[WhatsApp API] ❌ Failed to send message to ${to}:`, error.message);
    return false;
  }
};

/**
 * Send a structured template message (e.g. for Meta API)
 */
export const sendWhatsAppTemplate = async (to, templateName, variables) => {
  console.log(`[WhatsApp API] 📲 Template '${templateName}' sent to ${to} with vars:`, variables);
  return true;
};
