// Worker: serves static assets + comments API backed by D1.

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

async function listComments(env) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, body, created_at FROM comments WHERE hidden = 0 ORDER BY created_at DESC LIMIT 200'
  ).all();
  return json({ comments: results });
}

async function verifyTurnstile(token, ip, secret) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token || '',
      remoteip: ip || '',
    }),
  });
  const data = await res.json();
  return data.success === true;
}

async function addComment(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  // Honeypot — if the hidden "website" field is filled, silently accept.
  if (data.website) return json({ ok: true });

  const name = String(data.name || '').trim().slice(0, 60);
  const body = String(data.body || '').trim().slice(0, 500);

  if (name.length < 1 || body.length < 2) {
    return json({ error: 'name and testimony are required' }, 400);
  }

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(
      data.turnstileToken,
      request.headers.get('cf-connecting-ip'),
      env.TURNSTILE_SECRET
    );
    if (!ok) return json({ error: 'captcha failed' }, 400);
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const recent = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM comments WHERE ip = ? AND created_at > ?'
  )
    .bind(ip, tenMinAgo)
    .first();
  if (recent && recent.c >= 3) {
    return json({ error: 'too many submissions — slow down, legend' }, 429);
  }

  const created_at = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO comments (name, body, ip, created_at, hidden) VALUES (?, ?, ?, ?, 0)'
  )
    .bind(name, body, ip, created_at)
    .run();

  return json({ ok: true });
}

function requireAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${env.ADMIN_TOKEN}`;
}

async function adminList(env) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, body, ip, created_at, hidden FROM comments ORDER BY created_at DESC LIMIT 500'
  ).all();
  return json({ comments: results });
}

async function adminHide(request, env) {
  const { id } = await request.json();
  if (!id) return json({ error: 'id required' }, 400);
  await env.DB.prepare('UPDATE comments SET hidden = 1 WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

async function adminDelete(request, env) {
  const { id } = await request.json();
  if (!id) return json({ error: 'id required' }, 400);
  await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/comments' && request.method === 'GET') {
      return listComments(env);
    }
    if (path === '/api/comments' && request.method === 'POST') {
      return addComment(request, env);
    }

    if (path.startsWith('/api/admin/')) {
      if (!requireAdmin(request, env)) return json({ error: 'unauthorized' }, 401);
      if (path === '/api/admin/comments' && request.method === 'GET') return adminList(env);
      if (path === '/api/admin/hide' && request.method === 'POST') return adminHide(request, env);
      if (path === '/api/admin/delete' && request.method === 'POST') return adminDelete(request, env);
      return json({ error: 'not found' }, 404);
    }

    if (path.startsWith('/api/')) return json({ error: 'not found' }, 404);

    return env.ASSETS.fetch(request);
  },
};
