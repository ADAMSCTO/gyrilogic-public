
// ANCHOR: DHLL-APP-FILE — CLEANED
import React, { useEffect, useMemo, useState } from 'react';

function getAPI(){
  if (typeof window !== 'undefined') {
    const v = window.localStorage.getItem('dhll_api_base') || process.env.NEXT_PUBLIC_API_BASE || '';
    return String(v || '').replace(/\/$/, '');
  }
  return String(process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
}

// Modes & Policy
const MODES = ['off','minimal','full','tech','artistic'];
const POLICY = ['off','advisory','enforce'];

// Tone labels
const TONES = [
  {label:'Neutral', value:'neutral'},
  {label:'Poetic', value:'poetic'},
  {label:'Humorous', value:'humorous'},
  {label:'Reflective', value:'reflective'},
  {label:'Professional', value:'professional'},
  {label:'Empathetic', value:'empathetic'},
  {label:'Solemn', value:'solemn'},
  {label:'Celebratory', value:'celebratory'},
  {label:'Persuasive', value:'persuasive'},
  {label:'Clinical', value:'clinical'},
  {label:'Casual', value:'casual'},
  {label:'Formal', value:'formal'},
  {label:'Inspirational', value:'inspirational'},
  {label:'Authoritative', value:'authoritative'},
  {label:'Compassionate', value:'compassionate'},
  {label:'Reassuring', value:'reassuring'},
  {label:'Urgent', value:'urgent'}
];

// Culture groups
const CULTURE_GROUPS = {
  Regions: [
    {label:'West Africa', value:'west_africa'},
    {label:'East Africa', value:'east_africa'},
    {label:'Southern Africa', value:'southern_africa'},
    {label:'Latin America', value:'latin_america'},
    {label:'Western Europe', value:'western_europe'},
    {label:'Eastern Europe', value:'eastern_europe'},
    {label:'Southeast Asia', value:'south_east_asia'},
    {label:'South Asia', value:'south_asia'},
    {label:'East Asia', value:'east_asia'},
    {label:'Middle East', value:'middle_east'},
    {label:'North America', value:'north_america'}
  ],
  Faith: [
    {label:'Muslim', value:'muslim'},
    {label:'Christian', value:'christian'},
    {label:'Jewish', value:'jewish'},
    {label:'Hindu', value:'hindu'},
    {label:'Buddhist', value:'buddhist'}
  ],
  Countries: [
    {label:'United States', value:'us'},
    {label:'Japan', value:'jp'},
    {label:'Mexico', value:'mx'},
    {label:'France', value:'fr'},
    {label:'Nigeria', value:'ng'},
    {label:'South Africa', value:'za'},
    {label:'Kenya', value:'ke'},
    {label:'Brazil', value:'br'},
    {label:'India', value:'in'},
    {label:'Indonesia', value:'id'}
  ]
};
const CULTURE_FLAT = [{label:'None', value:'NONE'}, ...Object.values(CULTURE_GROUPS).flat()];

// Circumstances groups → environment tags array
const CIRCUMSTANCE_GROUPS = [
  { key:'time', label:'Time of Day',
    items:[
      {label:'Dawn', value:'time_dawn'},
      {label:'Morning', value:'time_morning'},
      {label:'Noon', value:'time_noon'},
      {label:'Dusk', value:'time_dusk'},
      {label:'Night', value:'time_night'}
    ]
  },
  { key:'weather', label:'Weather',
    items:[
      {label:'Sunshine', value:'weather_sunshine'},
      {label:'Rain', value:'weather_rain'},
      {label:'Snow', value:'weather_snow'},
      {label:'Storm', value:'weather_storm'},
      {label:'Fog', value:'weather_fog'},
      {label:'Windy', value:'weather_windy'}
    ]
  },
  { key:'location', label:'Location',
    items:[
      {label:'Indoors', value:'loc_indoors'},
      {label:'Outdoors', value:'loc_outdoors'},
      {label:'Beach', value:'loc_beach'},
      {label:'Mountain', value:'loc_mountain'},
      {label:'Forest', value:'loc_forest'},
      {label:'City Street', value:'loc_city'},
      {label:'Stadium', value:'loc_stadium'},
      {label:'Office', value:'loc_office'},
      {label:'House of Worship', value:'loc_worship'}
    ]
  },
  { key:'occasion', label:'Occasion / Event',
    items:[
      {label:'Wedding', value:'occ_wedding'},
      {label:'Funeral', value:'occ_funeral'},
      {label:'Baptism', value:'occ_baptism'},
      {label:'Business Meetings', value:'occ_business'},
      {label:'Customer Service Emails', value:'occ_customer_service_email'},
      {label:'Job Application Emails', value:'occ_job_application_email'},
      {label:'Product Tagline', value:'occ_product_tagline'},
      {label:'Resume Bullet', value:'occ_resume_bullet'},
      {label:'Casual', value:'occ_casual'},
      {label:'Party', value:'occ_party'},
      {label:'Conference', value:'occ_conference'},
      {label:'Graduation', value:'occ_graduation'},
      {label:'Festival', value:'occ_festival'},
      {label:'Sports Game', value:'occ_sports_game'},
      {label:'Concert', value:'occ_concert'}
    ]
  }
];

// Keyword → tag(s) mapping for auto-detect
const KEYWORD_MAP = {
  "dawn": ["time_dawn"], "morning": ["time_morning"], "noon": ["time_noon"], "dusk":["time_dusk"], "night": ["time_night"],
  "sunny": ["weather_sunshine"], "sunshine":["weather_sunshine"], "rain": ["weather_rain"], "snow": ["weather_snow"],
  "storm": ["weather_storm"], "fog": ["weather_fog"], "wind": ["weather_windy"], "windy":["weather_windy"],
  "indoor": ["loc_indoors"], "indoors": ["loc_indoors"], "inside":["loc_indoors"],
  "outdoor":["loc_outdoors"], "outdoors":["loc_outdoors"], "outside":["loc_outdoors"],
  "beach":["loc_beach","loc_outdoors"], "mountain":["loc_mountain","loc_outdoors"], "forest":["loc_forest","loc_outdoors"],
  "city":["loc_city","loc_outdoors"], "street":["loc_city","loc_outdoors"], "stadium":["loc_stadium","loc_outdoors"],
  "office":["loc_office","loc_indoors"], "church":["loc_worship","loc_indoors"], "mosque":["loc_worship","loc_indoors"], "temple":["loc_worship","loc_indoors"],
  "wedding":["occ_wedding"], "funeral":["occ_funeral"], "baptism":["occ_baptism"],
  "business":["occ_business"], "casual":["occ_casual"], "party":["occ_party"],
  "conference":["occ_conference"], "graduation":["occ_graduation"], "festival":["occ_festival"],
  "concert":["occ_concert"], "game":["occ_sports_game"], "soccer":["occ_sports_game"], "football":["occ_sports_game"],
  "business meeting":["occ_business"], "business meetings":["occ_business"],
  "customer service":["occ_customer_service_email"], "customer service email":["occ_customer_service_email"], "customer support":["occ_customer_service_email"],
  "job application":["occ_job_application_email"], "job application email":["occ_job_application_email"],
  "product tagline":["occ_product_tagline"], "tagline":["occ_product_tagline"],
  "resume bullet":["occ_resume_bullet"], "resume bullets":["occ_resume_bullet"]
};

function uniq(arr){ return Array.from(new Set(arr)); }
function shellEscapeSingleQuotes(s){ return String(s).replace(/'/g, "'\\''"); }
// --- Session audit helpers ---
function persistAudit(next){ try{ localStorage.setItem('dhll_session_audit', JSON.stringify(next)); }catch{} }
function loadAuditFromStorage(){ try{ const s = localStorage.getItem('dhll_session_audit'); return s ? JSON.parse(s) : []; }catch{ return []; } }
function uniqByStringify(arr){
  const seen = new Set(); const out = [];
  for(const x of arr){ const k = JSON.stringify(x); if(!seen.has(k)){ seen.add(k); out.push(x); } }
  return out;
}

// --- Response normalizers so the UI can render regardless of backend shape ---
function getPath(obj, path) {
  try { return path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj); }
  catch { return undefined; }
}
function pick(obj, paths, fallback) {
  for (const p of paths) {
    const v = getPath(obj, p);
    if (Array.isArray(v) ? v.length : (v !== undefined && v !== null && v !== '')) return v;
  }
  return fallback;
}
function normalizeEnhanceResponse(data) {
  const enriched = pick(data, [
    'enhanced','enhanced_text','enhancedText','enhancedOutput',
    'output','result.enhanced','data.enhanced','modified','original'
  ], '');
  const tags = pick(data, ['tags','tagList','result.tags','data.tags','wave_b.matched'], []);
  const rationale = pick(data, ['rationale','rationaleText','result.rationale','data.rationale'], '');
  const actions = pick(data, ['actions','actionItems','result.actions','data.actions','wave_b.do'], []);
  const policy_result = pick(data, ['policy_result','policyResult'], null)
      || { allowed: true, mode: pick(data, ['mode'], 'advisory') };
  return { enriched, tags, rationale, actions, policy_result, raw: data };
}

export default function Home(){
  // UI creative mode is separate: send policyMode to backend; send UI mode in options.dhll_mode
  const [text,setText]=useState('');
  const [mode,setMode]=useState('full');                 // UI/creative
  const [policyMode,setPolicyMode]=useState('advisory'); // backend: off/advisory/enforce
  const [tone,setTone]=useState('neutral');

  const [cultureQuery,setCultureQuery]=useState('');
  const [culture,setCulture]=useState('NONE');

  const [circumstances,setCircumstances]=useState([]);
  const [autoDetect,setAutoDetect]=useState(true);

  const [loading,setLoading]=useState(false);
  const [enhanced,setEnhanced]=useState(null);
  const [policy,setPolicy]=useState(null);
  const [audit,setAudit]=useState([]);
  const [error,setError]=useState(null);
  const [copied,setCopied]=useState(false);
  const [copiedTags,setCopiedTags]=useState(false);
  const [copiedAll,setCopiedAll]=useState(false);
  const [copiedCurl,setCopiedCurl]=useState(false);
  const [copiedPolicyCurl,setCopiedPolicyCurl]=useState(false);
  const [copiedAuditCurl,setCopiedAuditCurl]=useState(false); // NEW

  const options = useMemo(()=>({ tone, environment: circumstances, dhll_mode: mode }),[tone, circumstances, mode]);

  function toggleCirc(tag){
    setCircumstances(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag]);
  }

  // Auto-detect circumstances from text
  useEffect(()=>{
    if(!autoDetect) return;
    const tl = text.toLowerCase();
    let found = [];
    for(const [key, vals] of Object.entries(KEYWORD_MAP)){
      if(tl.includes(key)) found.push(...vals);
    }
    if(found.length){
      setCircumstances(prev => uniq([...prev, ...found]));
    }
  }, [text, autoDetect]);

  async function runEnhance(){
    setLoading(true); setError(null);
    setCopied(false); setCopiedTags(false); setCopiedAll(false);
    setCopiedCurl(false); setCopiedPolicyCurl(false); setCopiedAuditCurl(false);
    try{
      // 1) Enhance
      const r = await fetch(`${getAPI()}/enhance`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text, mode: policyMode, culture, options })
      });
      if(!r.ok) throw new Error('Enhance failed: '+r.status);
      const data = await r.json();
      const norm = normalizeEnhanceResponse(data);
      setEnhanced(norm);

      // 2) Policy (404 must not block)
      let policyObj = null;
      try{
        const rp = await fetch(`${getAPI()}/policy/apply`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ text, mode: policyMode })
        });
        if (rp.status === 404) {
          policyObj = {
            action: norm.policy_result.allowed ? 'allow' : 'block',
            policy_mode: norm.policy_result.mode || policyMode,
            notes: 'policy_endpoint_missing_fallback'
          };
        } else if (rp.ok) {
          const pdata = await rp.json();
          policyObj = {
            action: (pdata.allowed === false) ? 'block' : 'allow',
            policy_mode: pdata.mode || policyMode,
            notes: pdata.reason || ''
          };
        } else {
          policyObj = {
            action: norm.policy_result.allowed ? 'allow' : 'block',
            policy_mode: norm.policy_result.mode || policyMode,
            notes: `policy_http_${rp.status}`
          };
        }
      }catch(_){
        policyObj = {
          action: norm.policy_result.allowed ? 'allow' : 'block',
          policy_mode: norm.policy_result.mode || policyMode,
          notes: 'policy_network_fallback'
        };
      }
      setPolicy(policyObj);
      // Record a session audit entry (client-side)
      const entry = {
        ts: new Date().toISOString(),
        input: text,
        options: { mode: policyMode, tone, culture, environment: circumstances, dhll_mode: mode },
        result: { enriched: norm.enriched, tags: norm.tags, rationale: norm.rationale, actions: norm.actions },
        policy: policyObj
      };
      setAudit(prev => { const next = [entry, ...prev]; persistAudit(next); return next; });
    }catch(e){
      setError(e.message||'Unknown error');
    } finally{
      setLoading(false);
    }
  }

  async function loadAudit(){
    try{
      const r = await fetch(`${getAPI()}/audit/log?limit=50`);
      if(!r.ok) throw new Error('Audit fetch failed: '+r.status);
      const json = await r.json();
      const serverItems = json.items || json || [];
      setAudit(prev => uniqByStringify([...(prev||[]), ...serverItems]));
    }catch(e){ setError(e.message||'Audit error'); }
  }

  function clearAudit(){
    setAudit([]);
    try{ localStorage.removeItem('dhll_session_audit'); }catch{}
  }

  async function copyEnhanced(){
    if(!enhanced) return;
    try{
      await navigator.clipboard.writeText(enhanced.enriched || '');
      setCopied(true); setTimeout(()=>setCopied(false),1500);
    }catch{ alert('Copy failed'); }
  }

  async function copyTags(){
    if(!enhanced || !enhanced.tags) return;
    try{
      await navigator.clipboard.writeText(JSON.stringify(enhanced.tags, null, 2));
      setCopiedTags(true); setTimeout(()=>setCopiedTags(false),1500);
    }catch{ alert('Copy failed'); }
  }

  async function copyAll(){
    if(!enhanced) return;
    const payload = {
      enriched: enhanced.enriched || '',
      tags: enhanced.tags || {},
      policy: policy ? { action: policy.action, policy_mode: policy.policy_mode, notes: policy.notes } : {}
    };
    try{
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopiedAll(true); setTimeout(()=>setCopiedAll(false),1500);
    }catch{ alert('Copy failed'); }
  }

  // >>> BEGIN CURL HELPERS
  async function copyCurl(){
    try{
      const payload = {
        text: text || "Rainy   night   outdoor   party!!!",
        mode: policyMode,
        culture,
        options
      };
      const json = JSON.stringify(payload);
      const cmd = `curl -s '${getAPI()}/enhance' -X POST -H 'Content-Type: application/json' -d '${shellEscapeSingleQuotes(json)}'`;
      await navigator.clipboard.writeText(cmd);
      setCopiedCurl(true); setTimeout(()=>setCopiedCurl(false), 1500);
    }catch(e){
      setError('Failed to copy cURL: ' + String(e));
    }
  }

  async function copyPolicyCurl(){
    try{
      const payload = { text: text || "Rainy   night   outdoor   party!!!", mode: policyMode };
      const json = JSON.stringify(payload);
      const cmd = `curl -s '${getAPI()}/policy/apply' -X POST -H 'Content-Type: application/json' -d '${shellEscapeSingleQuotes(json)}'`;
      await navigator.clipboard.writeText(cmd);
      setCopiedPolicyCurl(true); setTimeout(()=>setCopiedPolicyCurl(false), 1500);
    }catch(e){
      setError('Failed to copy cURL: ' + String(e));
    }
  }

  async function copyAuditCurl(){
    try{
      const cmd = `curl -s '${getAPI()}/audit/log?limit=50'`;
      await navigator.clipboard.writeText(cmd);
      setCopiedAuditCurl(true); setTimeout(()=>setCopiedAuditCurl(false), 1500);
    }catch(e){ setError('Failed to copy cURL: ' + String(e)); }
  }
  // >>> END CURL HELPERS

  function downloadJSON(){
    if(!enhanced) return;
    const payload = { enriched: enhanced.enriched || '', tags: enhanced.tags || {} };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const ts = new Date();
    const pad = (n)=>String(n).padStart(2,'0');
    const filename = `dhll_enhanced_${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

async function downloadAudit(){
  try{
    // start with what's currently in memory (session + any merged server)
    let data = Array.isArray(audit) ? audit : [];

    // optionally fetch latest from server and merge
    try{
      const r = await fetch(`${getAPI()}/audit/log?limit=100`);
      if(r.ok){
        const json = await r.json();
        const server = json.items || json || [];
        data = uniqByStringify([...(data||[]), ...server]);
      }
    }catch(_){ /* ignore network issues for download */ }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const ts = new Date();
    const pad = (n)=>String(n).padStart(2,'0');
    const filename = `dhll_audit_${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }catch(e){ setError(e.message||'Audit download error'); }
}

  function resetAll(){
    setText(''); setMode('full'); setPolicyMode('advisory'); setTone('neutral');
    setCultureQuery(''); setCulture('NONE'); setCircumstances([]); setAutoDetect(true);
    setEnhanced(null); setPolicy(null); setAudit([]); setError(null);
    setCopied(false); setCopiedTags(false); setCopiedAll(false);
    setCopiedCurl(false); setCopiedPolicyCurl(false); setCopiedAuditCurl(false);
  }

  function onTextKeyDown(e){
    if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); runEnhance(); }
  }
  // Initialize audit from localStorage
  useEffect(()=>{
    setAudit(loadAuditFromStorage());
  },[]);

  useEffect(()=>{
    function onGlobalKey(e){
      if(e.altKey && (e.key === 'l' || e.key === 'L')){ e.preventDefault(); loadAudit(); }
    }
    window.addEventListener('keydown', onGlobalKey);
    return ()=>window.removeEventListener('keydown', onGlobalKey);
  }, []);

  return (
<>
{/* ANCHOR: GYRI-NAVY-THEME-START */}
<style jsx global>{`
  :root {
    --gyr-bg: #0b1220;   /* DHLL navy */
    --gyr-fg: #e5e7eb;   /* light text */
    --gyr-border: #334155;
  }
  html, body, #__next { height: 100%; }
  body { background: var(--gyr-bg); color: var(--gyr-fg); }

  /* Inputs readable on dark bg */
  input, select, textarea {
    background: #0f172a;
    color: var(--gyr-fg);
    border-color: var(--gyr-border);
  }

  fieldset { border-color: var(--gyr-border); }
  legend { color: var(--gyr-fg); }
  label, h1, h3, p, small, span { color: var(--gyr-fg); }

  /* Keep text dark inside white cards */
  .gyri-card, .gyri-card h1, .gyri-card h3, .gyri-card p,
  .gyri-card small, .gyri-card label, .gyri-card span {
    color: #111827 !important;
  }
.gyri-card textarea {
  color: #111827 !important;
  background: #fff !important;
  border-color: #d1d5db !important;
}
`}</style>
{/* ANCHOR: GYRI-NAVY-THEME-END */}
    <div style={{maxWidth:1100,margin:'40px auto',padding:16,fontFamily:'Inter,system-ui,Arial,sans-serif'}}>
      {/* ANCHOR: HEADER-WITH-LOGO-START */}
<div style={{display:'flex', alignItems:'center', gap:12}}>
  <img src="/gyrilogic-logo.png" alt="Gyrilogic logo" style={{ width: 160, maxWidth: '40vw', height: 'auto', borderRadius: 8 }} />
  <h1 style={{margin:0}}>Gyrilogic — Default Human Logic Layer (Public)</h1>
</div>
{/* ANCHOR: HEADER-WITH-LOGO-END */}
<div style={{display:'flex', gap:12, marginTop:8, marginBottom:12}}>
  <button style={{padding:'6px 12px', borderRadius:8, border:'1px solid var(--gyr-border)', color:'var(--gyr-fg)', background:'transparent'}} onClick={()=>alert('Access panel TBD')}>

    Access
  </button>
  <button style={{padding:'6px 12px', borderRadius:8, border:'1px solid var(--gyr-border)', color:'var(--gyr-fg)', background:'transparent'}} onClick={()=>alert('API panel TBD')}>
    API
  </button>
  <span style={{padding:'6px 12px', borderRadius:8, background:'#e5fbe5', color:'#065f46', fontWeight:600}}>
    Free Mode ●
  </span>
  {/* Later this can toggle to Pro and show green dot when active */}
</div>

      <p style={{ margin:'8px 0 12px', opacity:0.85 }}>
  For quick demos. <span style={{opacity:0.7}}>No login required.</span>
</p>

      <p style={{opacity:0.8}}>Ctrl+Enter runs Enhance.</p>

      <section style={{display:'grid',gridTemplateColumns:'1fr',gap:12,marginTop:16}}>
        {/* BEGIN GYRILOGIC INPUT CARD */}
<div className="gyri-card" style={{
  background:'#fff',
  border:'1px solid #e5e7eb',
  borderRadius:12,
  padding:16,
  boxShadow:'0 1px 2px rgba(0,0,0,0.04)',
  overflow:'hidden'            // prevents child overlap with rounded corners
}}>
  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
    <h3 style={{margin:0}}>Input</h3>
    <small style={{opacity:0.7}}>Tip: <b>Ctrl+Enter</b> runs Enhance</small>
  </div>

  <textarea
    placeholder="Write or paste text here (e.g., 'Wedding toast at sunset, elegant and warm')"
    value={text}
    onChange={e=>setText(e.target.value)}
    onKeyDown={onTextKeyDown}
    rows={8}
    style={{
      width:'100%',
      display:'block',
      boxSizing:'border-box',   // ensures padding/border don't overflow the card
      background:'#fff',
      border:'1px solid #d1d5db',
      borderRadius:10,
      padding:'10px 12px',
      fontSize:16,
      lineHeight:1.5,
      outline:'none'
    }}
  />
  {/* Inner Enhance button removed on purpose */}
</div>
{/* END GYRILOGIC INPUT CARD */}


        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          <label>
            <div>DHLL Mode</div>
            <select value={mode} onChange={e=>setMode(e.target.value)}>
              {MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <label>
            <div>Ethical Defaults (Policy)</div>
            <select value={policyMode} onChange={e=>setPolicyMode(e.target.value)}>
              {POLICY.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <label>
            <div>Tone Style</div>
            <select value={tone} onChange={e=>setTone(e.target.value)}>
              {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>

          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>Cultural Context</div>
              <input
                placeholder="Search culture..."
                value={cultureQuery}
                onChange={e=>setCultureQuery(e.target.value)}
                style={{width:'55%', padding:'4px 8px'}}
              />
            </div>
            <select value={culture} onChange={e=>setCulture(e.target.value)} style={{width:'100%', marginTop:6}}>
              <option value="NONE">None</option>
                <optgroup label="Regions">
                  {CULTURE_GROUPS.Regions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
                <optgroup label="Faith">
                  {CULTURE_GROUPS.Faith.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
                <optgroup label="Countries">
                  {CULTURE_GROUPS.Countries.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
            </select>
          </div>
        </div>

        {/* Circumstances */}
        <div style={{border:'1px solid var(--gyr-border)',borderRadius:8,padding:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <h3 style={{margin:0}}>Circumstances</h3>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <label style={{display:'flex',gap:6,alignItems:'center'}}>
                <input type="checkbox" checked={autoDetect} onChange={e=>setAutoDetect(e.target.checked)} />
                <span>Auto-detect from text</span>
              </label>
              <small style={{opacity:0.7}}>{circumstances.length} selected</small>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {CIRCUMSTANCE_GROUPS.map(group => (
              <fieldset key={group.key} style={{border:'1px dashed #ccc',borderRadius:8,padding:8}}>
                <legend style={{padding:'0 6px'}}>{group.label}</legend>
                {group.items.map(item => (
                  <label key={item.value} style={{display:'flex',gap:8,alignItems:'center',margin:'6px 0'}}>
                    <input
                      type="checkbox"
                      checked={circumstances.includes(item.value)}
                      onChange={()=>toggleCirc(item.value)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        </div>

        <div style={{display:'flex',gap:10,alignItems:'center'}}>
  <button onClick={runEnhance} disabled={loading} style={{padding:'10px 16px'}}>
    {loading ? 'Running…' : 'Enhance'}
  </button>
  <button onClick={()=>setText('')} disabled={loading} style={{padding:'8px 12px'}}>
    Clear
  </button>
</div>
      </section>

      {error && <p style={{color:'crimson'}}>Error: {error}</p>}

      <section style={{display:'grid',gridTemplateColumns:'1fr',gap:16,marginTop:24}}>
{/* BEGIN GYRILOGIC RESULT CARD */}
<div className="gyri-card" style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8, marginBottom:8}}>
    <h3 style={{margin:0}}>Result</h3>
    <button onClick={copyEnhanced} disabled={!enhanced} style={{padding:'6px 10px'}}>
      Copy
    </button>
  </div>
  <div style={{whiteSpace:'pre-wrap', minHeight:120, color:'#111827'}}>
    {enhanced ? (enhanced.enriched || '') : 'applied Default Human Logic Layer result.'}
  </div>
</div>
{/* END GYRILOGIC RESULT CARD */}

      </section>

      <footer style={{marginTop:24, textAlign:'center', opacity:0.85}}>
  <div>For general audiences. <b>Safety first.</b></div>
  <div style={{marginTop:4}}>Powered by Gyrilogic</div>
</footer>
    </div>
  </> );
}

// ANCHOR: END DHLL-APP-FILE — CLEANED

