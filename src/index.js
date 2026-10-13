// Maktab marketing site Worker. Pages and files are static assets; this only handles the two forms:
//   POST /api/contact   "I'm interested" form on the home page
//   POST /api/waitlist  waitlist survey (waitlist.html)
// Each submission is validated, rate limited, stored in D1 and emailed to CONTACT_TO through Resend
// (free plan; secret RESEND_API_KEY). Replies go straight to the visitor (Reply-To).

const MAX = { name: 100, email: 200, school: 160, text: 1500, other: 300 };

const ROLES = ['Principal or director', 'Administrator or office staff', 'Board member or treasurer', 'Teacher', 'Parent volunteer', 'Other'];
const SCHOOL_TYPES = ['Weekend or supplementary school', 'Full-time Islamic school', 'Hifz or Quran program', 'More than one program', 'Other'];
const SIZES = ['Under 50 students', '50 to 150', '150 to 300', '300 to 600', 'Over 600'];
const PAINS = [
  'A different system for every school or program',
  'Recording cash, check and Zelle payments by hand',
  'Registration and payments in different systems',
  'Grades and registration in separate systems',
  'Reports, receipts and year-end statements',
  'Following up on missed payments',
  'Sibling discounts and fee calculations',
  'Waitlists and class capacity',
  'Re-enrolling returning families each year',
  'Keeping student records, documents and contacts current',
  'Answering the same parent questions',
  'Keeping student data private',
];
const TOOLS = [
  'Google Forms', 'Spreadsheets (Excel or Google Sheets)', 'Paper forms', 'Jotform, Wufoo or similar',
  'FACTS', 'Gradelink', 'Blackbaud', 'PowerSchool', 'Sycamore', 'QuickSchools',
  'Zelle, Venmo or PayPal', 'Stripe, Square or a card reader', 'QuickBooks', 'A custom or in-house system',
];
const TIMELINES = ['Before this school year ends', 'Before next registration season', 'Just exploring for now'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact' || url.pathname === '/api/waitlist') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Use POST.' }, 405, { Allow: 'POST' });
      try {
        return await handleForm(url.pathname.slice(5), request, env);
      } catch (error) {
        console.error('form failure', error && error.stack ? error.stack : String(error));
        return json({ ok: false, error: 'Something went wrong on our side.' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleForm(kind, request, env) {
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: 'Forbidden.' }, 403);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.FORM_LIMIT) {
    const { success } = await env.FORM_LIMIT.limit({ key: `${kind}:${ip}` });
    if (!success) return json({ ok: false, error: 'Too many submissions. Please wait a minute and try again.' }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid form data.' }, 400);
  }
  // spam traps: a hidden field people never fill, and a minimum time on the page
  if (str(body.website)) return json({ ok: true });
  const elapsed = Date.now() - Number(body.started || 0);
  if (!Number.isFinite(elapsed) || elapsed < 2500) return json({ ok: true });

  const parsed = kind === 'contact' ? parseContact(body) : parseWaitlist(body);
  if (parsed.error) return json({ ok: false, error: parsed.error, field: parsed.field }, 400);
  const data = parsed.data;

  const { subject, text, html } = kind === 'contact' ? contactEmail(data) : waitlistEmail(data);

  let stored = false;
  if (env.DB) {
    try {
      await env.DB.prepare('INSERT INTO submissions (kind, name, email, school, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(kind, data.name, data.email, data.school || '', JSON.stringify(data), new Date().toISOString())
        .run();
      stored = true;
    } catch (error) {
      console.error('d1 insert failed', String(error));
    }
  }

  let emailed = false;
  try {
    await sendMail(env, { replyTo: data.email, subject, text, html });
    emailed = true;
  } catch (error) {
    console.error('email send failed', String(error));
  }

  if (!emailed && !stored) {
    return json({ ok: false, error: 'We could not send your message right now.', fallback: true }, 502);
  }
  return json({ ok: true });
}

// ------------------------------------------------------------------ validation
function str(v, max = 10000) {
  return typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '';
}
function pick(v, allowed) {
  const s = str(v);
  return allowed.includes(s) ? s : '';
}
function picks(v, allowed) {
  return Array.isArray(v) ? [...new Set(v.map(x => str(x)).filter(x => allowed.includes(x)))] : [];
}
function validEmail(e) {
  return /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/.test(e);
}
function person(body) {
  const name = str(body.name, MAX.name);
  const email = str(body.email, MAX.email).toLowerCase();
  if (!name) return { error: 'Please enter your name.', field: 'name' };
  if (!validEmail(email)) return { error: 'Please enter a valid email address.', field: 'email' };
  return { name, email };
}
function parseContact(body) {
  const p = person(body);
  if (p.error) return p;
  return { data: { ...p, school: str(body.school, MAX.school), message: str(body.message, MAX.text) } };
}
function parseWaitlist(body) {
  const p = person(body);
  if (p.error) return p;
  const school = str(body.school, MAX.school);
  if (!school) return { error: 'Please enter your school or organization.', field: 'school' };
  return {
    data: {
      ...p,
      school,
      role: pick(body.role, ROLES),
      schoolType: pick(body.schoolType, SCHOOL_TYPES),
      size: pick(body.size, SIZES),
      pains: picks(body.pains, PAINS),
      painsOther: str(body.painsOther, MAX.other),
      tools: picks(body.tools, TOOLS),
      toolsOther: str(body.toolsOther, MAX.other),
      timeline: pick(body.timeline, TIMELINES),
      notes: str(body.notes, MAX.text),
    },
  };
}

// ------------------------------------------------------------------ emails
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function rows(pairs) {
  const shown = pairs.filter(([, v]) => (Array.isArray(v) ? v.length : v));
  const text = shown.map(([k, v]) => `${k}: ${Array.isArray(v) ? '\n  - ' + v.join('\n  - ') : v}`).join('\n\n');
  const html = shown
    .map(([k, v]) => `<tr><th align="left" valign="top" style="padding:8px 16px 8px 0;color:#837867;font-weight:500;white-space:nowrap">${esc(k)}</th><td style="padding:8px 0;color:#2b251d">${
      Array.isArray(v) ? '<ul style="margin:0;padding-left:18px">' + v.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : esc(v).replace(/\n/g, '<br>')
    }</td></tr>`)
    .join('');
  return { text, html };
}
function wrap(title, table) {
  return `<div style="font-family:Inter,Arial,sans-serif;background:#f4f1eb;padding:24px"><div style="max-width:640px;margin:0 auto;background:#faf8f5;border:1px solid #dad4c8;border-radius:12px;padding:24px 28px"><p style="margin:0 0 4px;color:#467c5a;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Maktab website</p><h1 style="margin:0 0 16px;font-size:20px;color:#2b251d">${esc(title)}</h1><table style="border-collapse:collapse;font-size:14px;line-height:1.5">${table}</table><p style="margin:20px 0 0;color:#837867;font-size:12px">Reply to this email to answer them directly.</p></div></div>`;
}
function contactEmail(d) {
  const r = rows([['Name', d.name], ['Email', d.email], ['School', d.school], ['What they would like to make easier', d.message]]);
  return { subject: `Interested in Maktab: ${d.name}${d.school ? ` (${d.school})` : ''}`, text: `New interest from the Maktab website\n\n${r.text}\n`, html: wrap('Someone is interested in Maktab', r.html) };
}
function waitlistEmail(d) {
  const r = rows([
    ['Name', d.name], ['Email', d.email], ['School or organization', d.school], ['Role', d.role], ['Type of school', d.schoolType],
    ['Number of students', d.size], ['Biggest pain points', d.pains], ['Other pain points', d.painsOther],
    ['Software they use now', d.tools], ['Other software', d.toolsOther], ['Looking to switch', d.timeline], ['Anything else', d.notes],
  ]);
  return { subject: `Waitlist: ${d.school} (${d.name})`, text: `New waitlist signup from the Maktab website\n\n${r.text}\n`, html: wrap('New waitlist signup', r.html) };
}

// Resend REST API: https://resend.com/docs/api-reference/emails/send-email
async function sendMail(env, { replyTo, subject, text, html }) {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `Maktab website <${env.MAIL_FROM}>`, to: [env.CONTACT_TO], reply_to: replyTo, subject, text, html }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 300)}`);
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
}

export const OPTIONS = { ROLES, SCHOOL_TYPES, SIZES, PAINS, TOOLS, TIMELINES };
