const UA = { 'user-agent': 'Mozilla/5.0 (CareersCompus data verification)' };
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ');
const URLS = ['https://iitsystem.ac.in/', 'https://www.iitk.ac.in/institute-overview', 'https://www.iitm.ac.in/about', 'https://home.iitd.ac.in/', 'https://www.iitg.ac.in/', 'https://www.bhu.ac.in/Site/Page/1_1_1_About-Us', 'https://www.bhu.ac.in/Site/Page/1_1_2_University-Act', 'https://www.du.ac.in/index.php?page=about-du-2', 'https://www.aiimsbhopal.edu.in/', 'https://aiimsbhopal.edu.in/index_controller/aboutBhopal', 'https://www.caluniv.ac.in/about-cu/about-cu.html', 'https://www.annauniv.edu/', 'https://www.iima.ac.in/the-institute/about-iima', 'https://www.nls.ac.in/about/about-nlsiu/', 'https://www.iisc.ac.in/about/', 'https://www.iisc.ac.in/about/foreword-from-the-director/', 'https://www.iitkgp.ac.in/about-iitkgp', 'https://www.bits-pilani.ac.in/about/bits-legacy/', 'https://vit.ac.in/about-vit'];
const RES = [['INI', /(institutions?|institutes?) of national importance/i], ['deemed', /deemed[- ]to[- ]be/i], ['central', /central university/i], ['act', /act of parliament|act,? \d{4}/i], ['eoe', /institutions? of eminence/i], ['est', /(established|founded|inception)[^.]{0,50}?\b(1[89]\d\d|20[0-2]\d)\b/i], ['1951', /\b(1951|1956|1958|1959|1961|1916|1857|1922|1909|1994|1984|1964)\b/]];
for (const u of URLS) {
  try {
    const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: UA }); const t = strip(await r.text());
    const hits = RES.map(([k, re]) => { const m = t.match(re); return m ? `${k}:"${t.slice(Math.max(0, m.index - 45), m.index + m[0].length + 30)}"` : null; }).filter(Boolean);
    console.log(r.status, u.slice(0, 70), 'len', t.length, '\n   ', hits.join('\n    ').slice(0, 900));
  } catch (e) { console.log('ERR', u, e.cause?.code || e.message); }
}
