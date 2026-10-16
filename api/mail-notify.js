import { Resend } from 'resend';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
const respond = (status) => new Response(null, {
  status,
  headers: { 'Cache-Control': 'no-store', ...(status === 405 ? { Allow: 'POST' } : {}) },
});

/** Only signed incoming-mail metadata can trigger one fixed notification to the owner. */
export async function handleMailNotification(request, env = process.env) {
  if (request.method !== 'POST') return respond(405);
  const { OVORA_MAIL_RESEND_API_KEY: key, OVORA_MAIL_WEBHOOK_SECRET: secret, OVORA_MAIL_NOTIFY_TO: owner } = env;
  if (!key || !secret || !EMAIL.test(owner ?? '')) return respond(503);

  const resend = new Resend(key);
  let event;
  try {
    const payload = await request.text();
    if (Buffer.byteLength(payload) > 65536) return respond(413);
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get('svix-id') ?? '',
        timestamp: request.headers.get('svix-timestamp') ?? '',
        signature: request.headers.get('svix-signature') ?? '',
      },
      webhookSecret: secret,
    });
  } catch {
    return respond(401);
  }

  if (event.type !== 'email.received') return respond(204);
  const data = event.data ?? {};
  const recipients = [data.to, data.received_for].filter(Array.isArray).flat();
  const forOvora = recipients.some((address) => typeof address === 'string' &&
    /^[^@\s<>]+@ovora\.help$/i.test(address.trim()));
  if (!forOvora || typeof data.email_id !== 'string' || !UUID.test(data.email_id)) return respond(204);

  // A dashboard link requires the owner's Resend login. Never create public email-share links.
  const link = `https://resend.com/emails/${data.email_id}`;
  try {
    const result = await resend.emails.send({
      from: 'Ovora notifications <hi@ovora.help>',
      to: [owner],
      subject: 'New email for Ovora',
      text: `A new message has arrived in your Ovora inbox.\n\nView the email securely:\n${link}\n\nSign in to your Tabscan Resend account to read it. This alert does not include the original message or attachments.`,
      html: `<!doctype html><html lang="en"><body style="margin:0;padding:32px;background:#fcf5f7;font-family:Arial,sans-serif;color:#38212b"><h1 style="font-size:24px">New Ovora email</h1><p>A new message has arrived in your Ovora inbox.</p><p><a href="${link}" style="display:inline-block;background:#b83f66;color:#fff;padding:14px 22px;border-radius:14px;text-decoration:none">View email in Resend</a></p><p style="font-size:14px">Sign in to your Tabscan Resend account to read it.</p><p style="font-size:12px;color:#6c5660">This alert does not include the original message or attachments.</p></body></html>`,
    }, { idempotencyKey: `ovora-inbound/${data.email_id}` });
    // Preserve Resend's retries if sending fails or the shared free quota is exhausted.
    return respond(result.error ? 503 : 204);
  } catch {
    return respond(503);
  }
}

export default { fetch: (request) => handleMailNotification(request) };
