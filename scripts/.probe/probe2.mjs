const SITES = {
  'iit-delhi': 'https://home.iitd.ac.in/', 'iit-bombay': 'https://www.iitb.ac.in/', 'iit-madras': 'https://www.iitm.ac.in/', 'iit-kanpur': 'https://www.iitk.ac.in/',
  'iit-kharagpur': 'https://www.iitkgp.ac.in/', 'iit-guwahati': 'https://www.iitg.ac.in/', 'iisc': 'https://iisc.ac.in/', 'du': 'https://www.du.ac.in/',
  'aiims-delhi': 'https://www.aiims.edu/', 'spa-delhi': 'https://spa.ac.in/', 'nlsiu': 'https://www.nls.ac.in/', 'anna': 'https://www.annauniv.edu/',
  'iim-a': 'https://www.iima.ac.in/', 'bits': 'https://www.bits-pilani.ac.in/', 'bhu': 'https://www.bhu.ac.in/', 'aiims-bhopal': 'https://www.aiimsbhopal.edu.in/',
  'vit': 'https://vit.ac.in/', 'calcutta': 'https://www.caluniv.ac.in/',
};
const UA = { 'user-agent': 'Mozilla/5.0 (CareersCompus data verification)' };
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ');
const get = async (u) => { for (let i = 0; i < 2; i++) { try { const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: UA }); return { status: r.status, url: r.url, html: await r.text() }; } catch (e) { if (i) return { status: 0, err: e.cause?.code || e.message, html: '' }; } } };
const RES = [['INI', /(institutions?|institutes?) of national importance/i], ['deemed', /deemed[- ]to[- ]be/i], ['est', /(established|founded|estd\.?|inception)[^.]{0,40}?\b(1[89]\d\d|20[0-2]\d)\b/i], ['central', /central university/i], ['state', /state university/i], ['city', /(New Delhi|Delhi|Mumbai|Powai|Chennai|Kanpur|Guwahati|Kharagpur|Bengaluru|Bangalore|Ahmedabad|Pilani|Varanasi|Bhopal|Vellore|Kolkata|Calcutta)/]];
for (const [id, home] of Object.entries(SITES)) {
  const h = await get(home);
  if (!h.status) { console.log(id, 'ERR', h.err); continue; }
  const links = [...h.html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((m) => [m[1], strip(m[2]).trim()]).filter(([href, t]) => /about|history|profile|overview|introduction|genesis|institute$/i.test(t) || /about|history|overview/i.test(href)).slice(0, 5);
  const urls = [home, ...new Set(links.map(([href]) => { try { return new URL(href, h.url).href; } catch { return null; } }).filter(Boolean))].slice(0, 5);
  console.log('==', id, urls.length);
  for (const u of urls) {
    const r = u === home ? h : await get(u); if (!r || !r.status) continue;
    const t = strip(r.html); const hits = [];
    for (const [k, re] of RES) { const m = t.match(re); if (m) hits.push(`${k}:"${t.slice(Math.max(0, m.index - 30), m.index + m[0].length + 25)}"`); }
    console.log(`  ${r.status} ${u.slice(0, 70)} len=${t.length} ${hits.join(' | ').slice(0, 420)}`);
  }
}
