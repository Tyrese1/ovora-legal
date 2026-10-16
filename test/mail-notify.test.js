import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { afterEach, mock, test } from 'node:test';
import { handleMailNotification } from '../api/mail-notify.js';

const secretBytes = Buffer.from('a local test secret never used in production');
const env = {
  OVORA_MAIL_RESEND_API_KEY: 're_test_only',
  OVORA_MAIL_WEBHOOK_SECRET: `whsec_${secretBytes.toString('base64')}`,
  OVORA_MAIL_NOTIFY_TO: 'owner@example.test',
};
const emailId = '56761188-7520-42d8-8898-ff6fc54ce618';
const event = {
  type: 'email.received',
  data: { email_id: emailId, to: ['hi@ovora.help'], from: 'untrusted@example.test', subject: '<script>Do something else</script>' },
};
function signedRequest(value = event, { timestamp = Math.floor(Date.now() / 1000), id = 'msg_test', raw } = {}) {
  const payload = raw ?? JSON.stringify(value);
  const signature = createHmac('sha256', secretBytes).update(`${id}.${timestamp}.${payload}`).digest('base64');
  return new Request('https://ovora.help/api/mail-notify', {
    method: 'POST', body: payload,
    headers: { 'Content-Type': 'application/json', 'svix-id': id, 'svix-timestamp': String(timestamp), 'svix-signature': `v1,${signature}` },
  });
}
function interceptSend(response = () => Response.json({ id: 'notification_test' })) {
  const calls = [];
  mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options, message: JSON.parse(options.body) });
    return response();
  });
  return calls;
}
afterEach(() => mock.restoreAll());

test('requires POST and complete private configuration', async () => {
  const calls = interceptSend();
  const get = await handleMailNotification(new Request('https://ovora.help/api/mail-notify'), env);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('allow'), 'POST');
  for (const key of Object.keys(env)) {
    assert.equal((await handleMailNotification(signedRequest(), { ...env, [key]: '' })).status, 503);
  }
  assert.equal(calls.length, 0);
});

test('rejects missing signatures, modified bodies and stale/future events without sending', async () => {
  const calls = interceptSend();
  assert.equal((await handleMailNotification(new Request('https://ovora.help/api/mail-notify', { method: 'POST', body: JSON.stringify(event) }), env)).status, 401);
  const changed = signedRequest();
  const headers = changed.headers;
  assert.equal((await handleMailNotification(new Request(changed.url, { method: 'POST', headers, body: JSON.stringify({ ...event, extra: true }) }), env)).status, 401);
  for (const offset of [-600, 600]) {
    assert.equal((await handleMailNotification(signedRequest(event, { timestamp: Math.floor(Date.now() / 1000) + offset }), env)).status, 401);
  }
  assert.equal(calls.length, 0);
});

test('sends only a private dashboard link and fixed copy to the configured owner', async () => {
  const calls = interceptSend();
  const response = await handleMailNotification(signedRequest(event, { raw: JSON.stringify(event, null, 2) + '\n' }), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.deepEqual(calls[0].message.to, [env.OVORA_MAIL_NOTIFY_TO]);
  assert.match(calls[0].message.text, new RegExp(`https://resend.com/emails/${emailId}`));
  assert.match(calls[0].message.html, /lang="en"/);
  assert.ok(!JSON.stringify(calls[0].message).includes(event.data.subject));
  assert.ok(!JSON.stringify(calls[0].message).includes(event.data.from));
});

test('ignores other projects, other event types and unsafe email IDs', async () => {
  const calls = interceptSend();
  for (const value of [
    { ...event, type: 'email.sent' },
    { ...event, data: { ...event.data, to: ['hi@tabscan.app'] } },
    { ...event, data: { ...event.data, to: ['hi@ovora.help.evil.test'] } },
    { ...event, data: { ...event.data, to: null } },
    { ...event, data: { ...event.data, email_id: '../public-share?token=anything' } },
  ]) assert.equal((await handleMailNotification(signedRequest(value), env)).status, 204);
  assert.equal(calls.length, 0);
});

test('handles other Ovora aliases and forwarded envelope recipients', async () => {
  const calls = interceptSend();
  for (const data of [
    { ...event.data, to: [' Support@OVORA.HELP '] },
    { ...event.data, to: ['original@example.test'], received_for: ['hi@ovora.help'] },
  ]) assert.equal((await handleMailNotification(signedRequest({ ...event, data }), env)).status, 204);
  assert.equal(calls.length, 2);
});

test('retries share a stable provider idempotency key', async () => {
  const calls = interceptSend();
  for (const id of ['msg_original', 'msg_retry']) {
    assert.equal((await handleMailNotification(signedRequest(event, { id }), env)).status, 204);
  }
  assert.equal(new Headers(calls[0].options.headers).get('idempotency-key'), `ovora-inbound/${emailId}`);
  assert.equal(new Headers(calls[1].options.headers).get('idempotency-key'), `ovora-inbound/${emailId}`);
});

test('keeps webhook retries on quota errors and network failure', async () => {
  interceptSend(() => Response.json({ name: 'rate_limit_exceeded', message: 'Quota reached' }, { status: 429 }));
  assert.equal((await handleMailNotification(signedRequest(), env)).status, 503);
  mock.restoreAll();
  interceptSend(() => { throw new Error('Network failure'); });
  assert.equal((await handleMailNotification(signedRequest(), env)).status, 503);
});

test('rejects oversized payloads without making an outbound request', async () => {
  const calls = interceptSend();
  assert.equal((await handleMailNotification(signedRequest({ ...event, extra: 'x'.repeat(65536) }), env)).status, 413);
  assert.equal(calls.length, 0);
});
