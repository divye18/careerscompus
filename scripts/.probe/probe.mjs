const SITES = {
  'iit-delhi': ['https://home.iitd.ac.in/', 'https://home.iitd.ac.in/about-iitd.php'],
  'iit-bombay': ['https://www.iitb.ac.in/', 'https://www.iitb.ac.in/en/about-iit-bombay/history'],
  'iit-madras': ['https://www.iitm.ac.in/', 'https://www.iitm.ac.in/about'],
  'iit-kanpur': ['https://www.iitk.ac.in/', 'https://www.iitk.ac.in/new/about-iitk'],
  'iit-kharagpur': ['https://www.iitkgp.ac.in/', 'https://www.iitkgp.ac.in/about'],
  'iit-guwahati': ['https://www.iitg.ac.in/', 'https://www.iitg.ac.in/home/about/about_iitg'],
  'iisc': ['https://iisc.ac.in/', 'https://iisc.ac.in/about/'],
  'du': ['https://www.du.ac.in/', 'https://www.du.ac.in/index.php?page=about-us'],
  'aiims-delhi': ['https://www.aiims.edu/', 'https://www.aiims.edu/index.php/en/about-us'],
  'nlu-delhi': ['https://nludelhi.ac.in/'],
  'spa-delhi': ['https://spa.ac.in/'],
  'nlsiu': ['https://www.nls.ac.in/'],
  'anna': ['https://www.annauniv.edu/'],
  'iim-a': ['https://www.iima.ac.in/', 'https://www.iima.ac.in/about-us'],
  'nid': ['https://www.nid.edu/', 'https://www.nid.edu/about/about-nid'],
  'bits': ['https://www.bits-pilani.ac.in/', 'https://www.bits-pilani.ac.in/about-bits-pilani/'],
  'jadavpur': ['https://jadavpuruniversity.in/'],
  'calcutta': ['https://www.caluniv.ac.in/'],
  'bhu': ['https://www.bhu.ac.in/', 'https://www.bhu.ac.in/Site/Page/1_1_1_About-Us'],
  'aiims-bhopal': ['https://www.aiimsbhopal.edu.in/'],
  'ashoka': ['https://www.ashoka.edu.in/'],
  'manipal': ['https://manipal.edu/'],
  'vit': ['https://vit.ac.in/'],
  'nus': ['https://nus.edu.sg/'],
  'toronto': ['https://www.utoronto.ca/'],
  'oxford': ['https://www.ox.ac.uk/'],
};
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ');
for (const [id, urls] of Object.entries(SITES)) {
  for (const u of urls) {
    try {
      const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (CareersCompus data verification)' } });
      const t = strip(await r.text());
      const find = (re) => { const m = t.match(re); return m ? t.slice(Math.max(0, m.index - 60), m.index + 110) : null; };
      console.log(`${id} ${r.status} ${u} len=${t.length}`);
      for (const [k, re] of [['INI', /national importance/i], ['deemed', /deemed/i], ['est', /(established|founded|since|estd\.?)\s*(in\s*)?(\(?\d{4}\)?)/i], ['year', /\b(1[89]\d\d)\b/]]) { const f = find(re); if (f) console.log(`   ${k}: ${f}`); }
    } catch (e) { console.log(`${id} ERR ${u} ${e.cause?.code || e.message}`); }
  }
}
