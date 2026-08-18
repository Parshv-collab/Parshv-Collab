type ContactInquiry = {
  name: string;
  email: string;
  message: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export function buildContactEmail(inquiry: ContactInquiry) {
  const name = escapeHtml(inquiry.name);
  const email = escapeHtml(inquiry.email);
  const message = escapeHtml(inquiry.message).replace(/\n/g, "<br />");
  return {
    subject: `New portfolio inquiry from ${inquiry.name}`,
    html: `<h2>New portfolio inquiry</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><p><strong>Message:</strong></p><p>${message}</p>`,
    text: `New portfolio inquiry\n\nName: ${inquiry.name}\nEmail: ${inquiry.email}\n\nMessage:\n${inquiry.message}`,
  };
}

export async function sendContactEmail(inquiry: ContactInquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return { delivered: false, reason: "Email delivery is not configured." } as const;

  const content = buildContactEmail(inquiry);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: inquiry.email, ...content }),
    });
    if (!response.ok) return { delivered: false, reason: "Email delivery could not be confirmed." } as const;
    return { delivered: true } as const;
  } catch {
    return { delivered: false, reason: "Email delivery could not be confirmed." } as const;
  }
}
