import { EMAILJS_CONFIG } from '../constants';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Send email notification for contact form submission using EmailJS
 */
export const sendContactNotification = async (
  formData: ContactFormData
): Promise<boolean> => {
  // Check if EmailJS is configured
  if (
    EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID' ||
    EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID' ||
    EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY'
  ) {
    console.warn('EmailJS not configured. Skipping email notification.');
    return false;
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          to_email: EMAILJS_CONFIG.recipientEmail,
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          reply_to: formData.email,
        },
      }),
    });

    if (response.ok) {
      console.log('Email notification sent successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Failed to send email notification:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

