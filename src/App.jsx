// ═══════════════════════════════════════════════════════════════════
//  GRYND V5 — App.jsx  (Supabase-backed, production-ready)
//  All user data persists in the cloud across every device.
// ═══════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  supabase, signUp, signIn, signOut,
  loadProfile, saveProfile, loadTasks, saveTask, deleteTask,
} from './supabase'

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const K = {
  bg:'#0B0C0E', panel:'#13151A', card:'#191C22', border:'#232730',
  ink:'#ECEEF2', inkM:'#858994', inkD:'#373B46',
  lime:'#C8F441', limeBg:'rgba(200,244,65,0.08)',
  red:'#F05252', redBg:'rgba(240,82,82,0.09)', redB:'rgba(240,82,82,0.28)',
  yel:'#F5A623', yelBg:'rgba(245,166,35,0.09)', yelB:'rgba(245,166,35,0.28)',
  grn:'#34D399', grnBg:'rgba(52,211,153,0.09)', grnB:'rgba(52,211,153,0.28)',
  blue:'#60A5FA', blueBg:'rgba(96,165,250,0.09)', blueB:'rgba(96,165,250,0.28)',
  pur:'#A78BFA', purBg:'rgba(167,139,250,0.09)',
  amb:'#F59E0B',
}

const URG = {
  high:   { bg:K.redBg, border:K.redB, text:K.red, label:'HIGH' },
  medium: { bg:K.yelBg, border:K.yelB, text:K.yel, label:'MED'  },
  low:    { bg:K.grnBg, border:K.grnB, text:K.grn, label:'LOW'  },
}
const INT_COLS = {
  Light:  { bg:K.grnBg, bd:K.grnB, tx:K.grn },
  Medium: { bg:K.yelBg, bd:K.yelB, tx:K.yel },
  Heavy:  { bg:K.redBg, bd:K.redB, tx:K.red },
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const SPORTS = [
  'Strength / Gym','Running','Cycling','Swimming','HIIT',
  'Tennis','Soccer','Basketball','Volleyball','Boxing / MMA','CrossFit','Other',
]
const SESSION_TYPES = ['Training','Practice','Match / Game','Conditioning','Recovery']
const INTENSITY_OPTS = ['Light','Medium','Heavy']
const CARDIO_TYPES = ['Running','Cycling','Swimming','HIIT','Rowing','Jump Rope','Other']

// ─── CSS ───────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#060708;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'DM Sans',sans-serif;}
#gw{width:390px;height:844px;background:#0B0C0E;border-radius:46px;overflow:hidden;display:flex;flex-direction:column;position:relative;box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 48px 120px rgba(0,0,0,0.85);}
@media(max-width:420px){#gw{width:100vw;height:100dvh;border-radius:0;}}
#gw *::-webkit-scrollbar{display:none;}
@keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes sc{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
@keyframes bk{0%,100%{opacity:1}50%{opacity:0.15}}
@keyframes sp{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(200,244,65,0.35)}50%{box-shadow:0 0 0 8px rgba(200,244,65,0)}}
.up{animation:up 0.36s cubic-bezier(0.22,1,0.36,1) both;}
.sc{animation:sc 0.3s cubic-bezier(0.22,1,0.36,1) both;}
.fi{animation:fi 0.2s ease both;}
.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}.d4{animation-delay:.24s}.d5{animation-delay:.30s}
.scr{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;}
.card{background:#191C22;border:1px solid #232730;border-radius:14px;padding:16px;}
.btn{border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;border-radius:11px;transition:transform 0.12s,opacity 0.12s;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:13px 16px;font-size:14px;}
.btn:active{transform:scale(0.97);opacity:0.82;}
.bLime{background:#C8F441;color:#0B0C0E;font-weight:700;}
.bDark{background:#191C22;color:#ECEEF2;border:1px solid #232730;}
.bSm{padding:8px 13px;font-size:12px;border-radius:9px;width:auto;}
.inp{width:100%;background:#13151A;border:1.5px solid #232730;border-radius:10px;padding:11px 13px;font-size:13px;font-family:'DM Sans',sans-serif;color:#ECEEF2;outline:none;transition:border-color 0.15s;}
.inp:focus{border-color:#C8F441;}
.inp::placeholder{color:#373B46;}
textarea.inp{resize:none;line-height:1.6;}
select.inp{cursor:pointer;appearance:none;-webkit-appearance:none;}
.lbl{font-size:10px;font-weight:600;letter-spacing:0.09em;text-transform:uppercase;color:#858994;}
.ilbl{font-size:11px;font-weight:600;color:#858994;margin-bottom:5px;display:block;}
.hd{font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.02em;}
.chip{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:9px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}
.ubadge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:5px;font-size:9px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;}
#nav{position:absolute;bottom:0;left:0;right:0;background:#13151A;border-top:1px solid #232730;padding:8px 8px 26px;display:flex;justify-content:space-around;z-index:50;}
.nb{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 8px;border-radius:10px;cursor:pointer;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#373B46;transition:all 0.15s;-webkit-tap-highlight-color:transparent;}
.nb.on{background:rgba(200,244,65,0.08);color:#C8F441;}
#sb{height:48px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:relative;}
#nc{position:absolute;left:50%;transform:translateX(-50%);top:10px;width:88px;height:26px;background:#000;border-radius:999px;}
.ptrack{height:3px;background:#232730;border-radius:999px;overflow:hidden;}
.pfill{height:100%;border-radius:999px;transition:width 0.5s cubic-bezier(0.22,1,0.36,1);}
.trow{display:flex;align-items:flex-start;gap:11px;padding:11px 0;border-bottom:1px solid #232730;cursor:pointer;}
.trow:last-child{border-bottom:none;} .trow:active{opacity:0.65;}
.ck{width:20px;height:20px;border-radius:50%;border:1.5px solid #232730;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;cursor:pointer;}
.ck.on{background:#C8F441;border-color:#C8F441;}
.tg{display:flex;background:#13151A;border-radius:999px;padding:3px;border:1px solid #232730;}
.topt{flex:1;padding:7px;border-radius:999px;font-size:11px;font-weight:600;text-align:center;cursor:pointer;color:#858994;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
.topt.on{background:#191C22;color:#ECEEF2;box-shadow:0 1px 6px rgba(0,0,0,0.4);}
.bmsg{max-width:84%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.6;animation:up 0.25s ease both;}
.bmsg.ai{background:#191C22;border:1px solid #232730;border-bottom-left-radius:3px;color:#ECEEF2;}
.bmsg.usr{background:#C8F441;color:#0B0C0E;font-weight:500;border-bottom-right-radius:3px;}
.sdot{height:3px;border-radius:999px;background:#232730;transition:all 0.3s;width:14px;}
.sdot.on{background:#C8F441;}
.spin{animation:sp 0.8s linear infinite;}
.cblk{border-radius:8px;padding:8px 11px;margin-bottom:4px;border-left:3px solid;}
.sdiv{height:1px;background:#232730;margin:14px 0;}
.fzone{border:2px dashed #232730;border-radius:11px;padding:18px;text-align:center;cursor:pointer;transition:border-color 0.15s;background:#13151A;}
.fzone:hover{border-color:#C8F441;}
.sw{width:44px;height:24px;border-radius:999px;position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;}
.sw-k{position:absolute;top:3px;width:18px;height:18px;background:white;border-radius:50%;transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.4);}
#topbar{padding:0 18px 6px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
.sess-card{background:#13151A;border:1px solid #232730;border-radius:12px;padding:13px;margin-bottom:8px;}
.sess-card.active{border-color:rgba(200,244,65,0.3);}
.day-pill{padding:5px 10px;border-radius:999px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid #232730;background:transparent;color:#858994;transition:all 0.15s;font-family:'DM Sans',sans-serif;white-space:nowrap;}
.day-pill.on{border-color:#C8F441;background:rgba(200,244,65,0.08);color:#C8F441;}
.int-btn{flex:1;padding:8px 0;text-align:center;border-radius:9px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;border:1.5px solid #232730;color:#858994;}
.errmsg{font-size:12px;color:#F05252;background:rgba(240,82,82,0.09);border:1px solid rgba(240,82,82,0.28);padding:8px 12px;border-radius:8px;margin-top:8px;}
.sync-dot{width:6px;height:6px;border-radius:50%;background:#34D399;flex-shrink:0;}
`

// ─── HELPERS ───────────────────────────────────────────────────────
function tMin(t){if(!t)return 0;const[h,m]=t.split(':').map(Number);return(h||0)*60+(m||0)}
function mToT(m){return`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}
function addMin(t,n){return mToT(tMin(t)+n)}

function calcUrgency(task){
  if(!task.due_date&&!task.dueDate)return'low'
  const dateStr=task.due_date||task.dueDate
  const hrs=Math.max(0,(new Date(dateStr+'T23:59:00')-new Date())/3600000)
  const est=parseFloat(task.est_hours||task.estHours)||1
  const ratio=hrs/Math.max(est,0.5)
  if(hrs<12||ratio<1.5)return'high'
  if(hrs<40||ratio<3)return'medium'
  return'low'
}

function calcStreak(tasks){
  const done=tasks.filter(t=>(t.done)&&(t.done_at||t.doneAt))
  if(!done.length)return 0
  const days=new Set(done.map(t=>new Date(t.done_at||t.doneAt).toDateString()))
  let streak=0, d=new Date()
  d.setHours(0,0,0,0)
  while(days.has(d.toDateString())){streak++;d.setDate(d.getDate()-1)}
  return streak
}

function buildRoutine({schoolStart,schoolEnd,trainingSessions=[],cardioSessions=[],extraSessions=[]}){
  const routine={}
  DAYS.forEach((day,di)=>{
    const blocks=[]
    if(di<5&&schoolStart&&schoolEnd){
      blocks.push({id:`sch-${di}`,type:'school',label:'School',start:schoolStart,end:schoolEnd,color:K.blue})
      blocks.push({id:`ln-${di}`,type:'break',label:'Lunch',start:'12:00',end:'12:45',color:K.inkD})
    }
    trainingSessions.filter(s=>s.day===day).forEach((s,i)=>{
      blocks.push({id:`tr-${di}-${i}`,type:'training',label:`${s.sport||'Training'} — ${s.sessionType||'Training'}`,start:s.start,end:s.end,color:K.lime,intensity:s.intensity||'Medium',sport:s.sport,sessionType:s.sessionType})
    })
    cardioSessions.filter(s=>s.day===day).forEach((s,i)=>{
      blocks.push({id:`ca-${di}-${i}`,type:'cardio',label:`${s.type||'Cardio'}`,start:s.start,end:s.end,color:K.pur,intensity:s.intensity||'Medium'})
    })
    extraSessions.filter(s=>s.day===day).forEach((s,i)=>{
      blocks.push({id:`ex-${di}-${i}`,type:'extra',label:s.name,start:s.start,end:s.end,color:K.amb})
    })
    blocks.sort((a,b)=>tMin(a.start)-tMin(b.start))
    const heavyToday=[...trainingSessions,...cardioSessions].filter(s=>s.day===day).some(s=>s.intensity==='Heavy')
    const medToday=[...trainingSessions,...cardioSessions].filter(s=>s.day===day).some(s=>s.intensity==='Medium')
    const maxStudy=heavyToday?55:medToday?85:120
    const occupiedEnd=blocks.reduce((mx,b)=>Math.max(mx,tMin(b.end)),0)
    const studyStart=Math.max(occupiedEnd+15,di<5?tMin('16:00'):tMin('09:30'))
    if(studyStart<tMin('21:30')-30){
      const dur=Math.min(maxStudy,tMin('21:30')-studyStart)
      if(dur>=30) blocks.push({id:`st-${di}`,type:'study',label:'Study Block',start:mToT(studyStart),end:mToT(studyStart+dur),color:K.inkM,isStudy:true})
    }
    if(di>=5&&!heavyToday) blocks.push({id:`wst-${di}`,type:'study',label:'Morning Study',start:'09:30',end:'11:00',color:K.inkM,isStudy:true})
    blocks.sort((a,b)=>tMin(a.start)-tMin(b.start))
    routine[day]=blocks
  })
  return routine
}

function todayEnergy(routine,dayName){
  const blocks=(routine||{})[dayName]||[]
  let e=90
  blocks.forEach(b=>{
    if(b.type==='training'){e-=b.intensity==='Heavy'?27:b.intensity==='Light'?8:16}
    if(b.type==='cardio')  {e-=b.intensity==='Heavy'?18:b.intensity==='Light'?5:10}
  })
  return Math.max(25,Math.min(100,e))
}

// Map DB snake_case task to camelCase for the UI (and back)
function dbToTask(r){return{id:r.id,title:r.title,subject:r.subject,dueDate:r.due_date,estHours:r.est_hours,diff:r.difficulty,notes:r.notes,done:r.done,doneAt:r.done_at,createdAt:r.created_at}}
function taskToDb(t,uid){return{id:t.id,user_id:uid,title:t.title||'',subject:t.subject||'',due_date:t.dueDate||null,est_hours:parseFloat(t.estHours)||1,difficulty:t.diff||'Medium',notes:t.notes||'',done:!!t.done,done_at:t.doneAt||null}}

// ─── SVG ICONS ─────────────────────────────────────────────────────
function Ico({d,s=18,c='currentColor',w=1.8}){return(<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{d}</svg>)}
const IC={
  home:<><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1z"/><path d="M9 21V12h6v9"/></>,
  cal:<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  tsk:<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
  hw:<><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>,
  coa:<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
  snd:<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor" stroke="none"/></>,
  chk:<><polyline points="20,6 9,17 4,12"/></>,
  cr:<><polyline points="9,18 15,12 9,6"/></>,
  cd:<><polyline points="6,9 12,15 18,9"/></>,
  zap:<><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" fill="currentColor" stroke="none"/></>,
  wrn:<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  pls:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  eof:<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  out:<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  img:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></>,
  edt:<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  del:<><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
  brn:<><path d="M9.5 2A2.5 2.5 0 007 4.5v.5A2.5 2.5 0 004.5 7.5v1A2.5 2.5 0 002 11v2a2.5 2.5 0 002.5 2.5v.5A2.5 2.5 0 007 18.5v.5a2.5 2.5 0 002.5 2.5h5a2.5 2.5 0 002.5-2.5v-.5a2.5 2.5 0 002.5-2.5V13a2.5 2.5 0 00-2.5-2.5v-1A2.5 2.5 0 0014.5 7v-.5A2.5 2.5 0 0012 4v-.5A2.5 2.5 0 009.5 2z"/></>,
  bk:<><polyline points="15,18 9,12 15,6"/></>,
}

// ─── STATUS BAR ────────────────────────────────────────────────────
function SBar(){return(<div id="sb"><div id="nc"/><span style={{fontFamily:'DM Sans',fontSize:12,fontWeight:600,color:K.ink,zIndex:1}}>9:41</span><div style={{display:'flex',alignItems:'center',gap:5,zIndex:1}}><div style={{display:'flex',gap:1.5,alignItems:'flex-end'}}>{[3,4,5,4].map((h,i)=><div key={i} style={{width:3,height:h,background:K.inkM,borderRadius:1,opacity:i===3?0.3:1}}/>)}</div><div style={{width:22,height:11,border:`1.5px solid ${K.inkM}`,borderRadius:3,padding:'1.5px 2px',position:'relative'}}><div style={{position:'absolute',right:-3,top:'50%',transform:'translateY(-50%)',width:2,height:5,background:K.inkM,borderRadius:1,opacity:0.35}}/><div style={{width:'70%',height:'100%',background:K.lime,borderRadius:1}}/></div></div></div>)}

// ─── SHARED MINI COMPONENTS ────────────────────────────────────────
function Toggle({on,onChange}){return(<div className="sw" style={{background:on?K.lime:K.border}} onClick={()=>onChange(!on)}><div className="sw-k" style={{left:on?22:3}}/></div>)}

function IntBtn({val,onChange}){return(<div style={{display:'flex',gap:6}}>{INTENSITY_OPTS.map(o=>{const on=val===o;const c=INT_COLS[o];return(<div key={o} className="int-btn" onClick={()=>onChange(o)} style={{borderColor:on?c.bd:K.border,background:on?c.bg:'transparent',color:on?c.tx:K.inkM}}>{o}</div>)})}</div>)}

function Spinner(){return(<div className="spin" style={{width:20,height:20,border:`2px solid rgba(11,12,14,0.3)`,borderTopColor:K.bg,borderRadius:'50%'}}/>)}

// ─── AUTH ──────────────────────────────────────────────────────────
function Auth({onAuth}){
  const [mode,setMode]=useState('login')
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [show,setShow]=useState(false)
  const [err,setErr]=useState('')
  const [busy,setBusy]=useState(false)

  const go=async()=>{
    setErr('')
    if(!email.trim()||!pass.trim()){setErr('Fill in all fields.');return}
    if(mode==='signup'&&!name.trim()){setErr('Enter your name.');return}
    if(pass.length<6){setErr('Password needs at least 6 characters.');return}
    setBusy(true)
    try{
      if(mode==='signup'){
        await signUp(email.trim(),pass,name.trim())
        // After sign up, Supabase sends a confirmation email by default.
        // For demo/dev you can disable email confirmation in Supabase dashboard
        // Auth → Settings → "Enable email confirmations" → OFF
        setErr('')
        setMode('login')
        setErr('Account created! Check your email to confirm, then log in. (Or disable email confirmation in Supabase for instant access.)')
      } else {
        const data=await signIn(email.trim(),pass)
        if(data.user) onAuth(data.user)
      }
    }catch(e){
      setErr(e.message||'Something went wrong.')
    }
    setBusy(false)
  }

  return(
    <div className="scr sc" style={{flex:1,padding:'28px 24px 32px',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{width:50,height:50,background:K.lime,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:22}}>
          <span style={{fontFamily:'Barlow Condensed',fontSize:22,fontWeight:800,color:K.bg}}>G</span>
        </div>
        <div className="hd" style={{fontSize:30,color:K.ink,lineHeight:1.1,marginBottom:6}}>
          {mode==='login'?'Welcome back.':'Create your account.'}
        </div>
        <div style={{fontSize:13,color:K.inkM,lineHeight:1.6,marginBottom:22}}>
          {mode==='login'?'Sign in to GRYND — your data syncs everywhere.':'Your performance system, accessible on any device.'}
        </div>
        <div style={{display:'flex',marginBottom:20,borderBottom:`1px solid ${K.border}`}}>
          {['login','signup'].map(m=>(
            <div key={m} onClick={()=>{setMode(m);setErr('')}} style={{flex:1,paddingBottom:10,textAlign:'center',fontSize:13,fontWeight:600,cursor:'pointer',color:mode===m?K.lime:K.inkM,borderBottom:mode===m?`2px solid ${K.lime}`:'2px solid transparent',marginBottom:-1,transition:'all 0.2s'}}>
              {m==='login'?'Log In':'Sign Up'}
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:9}}>
          {mode==='signup'&&<input className="inp up" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}/>}
          <input className="inp" placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}/>
          <div style={{position:'relative'}}>
            <input className="inp" placeholder="Password (min 6 chars)" type={show?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} style={{paddingRight:42}}/>
            <div onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',cursor:'pointer'}}>
              <Ico d={show?IC.eof:IC.eye} s={15} c={K.inkM}/>
            </div>
          </div>
        </div>
        {err&&<div className="errmsg" style={{color:err.includes('created')?K.grn:K.red,background:err.includes('created')?K.grnBg:K.redBg,borderColor:err.includes('created')?K.grnB:K.redB}}>{err}</div>}
        <button className="btn bLime" onClick={go} disabled={busy} style={{marginTop:18,opacity:busy?0.7:1}}>
          {busy?<Spinner/>:(mode==='login'?'Log In →':'Create Account →')}
        </button>
        <div style={{marginTop:13,fontSize:12,color:K.inkM,textAlign:'center'}}>
          {mode==='login'?<>No account? <span style={{color:K.lime,cursor:'pointer',fontWeight:600}} onClick={()=>setMode('signup')}>Sign up free</span></>:<>Have one? <span style={{color:K.lime,cursor:'pointer',fontWeight:600}} onClick={()=>setMode('login')}>Log in</span></>}
        </div>
        <div style={{marginTop:18,padding:'10px 12px',background:K.limeBg,border:'1px solid rgba(200,244,65,0.14)',borderRadius:10,fontSize:11,color:K.inkM,lineHeight:1.55}}>
          <strong style={{color:K.lime}}>Real cloud accounts.</strong> Your data syncs across all your devices automatically.
        </div>
      </div>
    </div>
  )
}

// ─── SESSION EDITOR (per-day, flexible) ───────────────────────────
function SessionEditor({sessions,onChange,mode}){
  const [expandDay,setExpandDay]=useState(null)
  const sessionForDay=day=>sessions.find(s=>s.day===day)||null
  const toggleDay=day=>{
    const existing=sessionForDay(day)
    if(existing){onChange(sessions.filter(s=>s.day!==day));if(expandDay===day)setExpandDay(null)}
    else{
      const defaults=mode==='training'
        ?{day,sport:'Strength / Gym',sessionType:'Training',start:'17:00',end:'18:30',intensity:'Medium'}
        :{day,type:'Running',start:'07:00',end:'07:45',intensity:'Medium'}
      onChange([...sessions,defaults])
      setExpandDay(day)
    }
  }
  const upd=(day,patch)=>onChange(sessions.map(s=>s.day===day?{...s,...patch}:s))
  return(
    <div>
      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:14}}>
        {DAYS.map((day,i)=>(
          <div key={day} className={`day-pill ${sessionForDay(day)?'on':''}`} onClick={()=>toggleDay(day)}>{DAY_SHORT[i]}</div>
        ))}
      </div>
      {DAYS.filter(day=>sessionForDay(day)).map(day=>{
        const s=sessionForDay(day);const open=expandDay===day
        return(
          <div key={day} className={`sess-card ${open?'active':''}`}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setExpandDay(open?null:day)}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:K.lime}}>{day}</div>
                <div style={{fontSize:11,color:K.inkM,marginTop:1}}>{s.start}–{s.end} · {mode==='training'?(s.sport||'Sport'):(s.type||'Cardio')} · {s.intensity}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <div onClick={e=>{e.stopPropagation();onChange(sessions.filter(ss=>ss.day!==day))}} style={{cursor:'pointer',padding:4}}><Ico d={IC.del} s={13} c={K.red}/></div>
                <Ico d={open?IC.cd:IC.cr} s={14} c={K.inkM}/>
              </div>
            </div>
            {open&&(
              <div className="fi" style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${K.border}`}}>
                {mode==='training'&&(
                  <>
                    <span className="ilbl">Sport / Activity</span>
                    <select className="inp" value={s.sport||''} onChange={e=>upd(day,{sport:e.target.value})} style={{marginBottom:10}}>
                      {SPORTS.map(sp=><option key={sp} value={sp}>{sp}</option>)}
                    </select>
                    <span className="ilbl">Session type</span>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
                      {SESSION_TYPES.map(t=>{const on=s.sessionType===t;return(<div key={t} onClick={()=>upd(day,{sessionType:t})} style={{padding:'5px 10px',borderRadius:999,border:`1.5px solid ${on?K.lime:K.border}`,background:on?K.limeBg:'transparent',fontSize:11,fontWeight:600,color:on?K.lime:K.inkM,cursor:'pointer',transition:'all 0.15s'}}>{t}</div>)})}
                    </div>
                  </>
                )}
                {mode==='cardio'&&(
                  <>
                    <span className="ilbl">Cardio type</span>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
                      {CARDIO_TYPES.map(t=>{const on=s.type===t;return(<div key={t} onClick={()=>upd(day,{type:t})} style={{padding:'5px 10px',borderRadius:999,border:`1.5px solid ${on?K.pur:K.border}`,background:on?K.purBg:'transparent',fontSize:11,fontWeight:600,color:on?K.pur:K.inkM,cursor:'pointer',transition:'all 0.15s'}}>{t}</div>)})}
                    </div>
                  </>
                )}
                <span className="ilbl">Time</span>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
                  <input className="inp" type="time" value={s.start||''} onChange={e=>upd(day,{start:e.target.value})} style={{flex:1,padding:'10px 11px'}}/>
                  <span style={{color:K.inkM,fontSize:12,flexShrink:0}}>to</span>
                  <input className="inp" type="time" value={s.end||''} onChange={e=>upd(day,{end:e.target.value})} style={{flex:1,padding:'10px 11px'}}/>
                </div>
                <span className="ilbl" style={{marginBottom:8,display:'block'}}>Intensity</span>
                <IntBtn val={s.intensity||'Medium'} onChange={v=>upd(day,{intensity:v})}/>
              </div>
            )}
          </div>
        )
      })}
      {sessions.length===0&&(
        <div style={{padding:'14px',background:K.panel,border:`1px solid ${K.border}`,borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:12,color:K.inkM}}>{mode==='training'?'Tap days above to add training sessions.':'Tap days above to add cardio sessions.'}</div>
        </div>
      )}
    </div>
  )
}

// ─── ONBOARDING ────────────────────────────────────────────────────
const OB_STEPS=['welcome','school','training','cardio','extras','done']

function Onboarding({authUser,onComplete}){
  const [step,setStep]=useState(0)
  const [schoolStart,setSchoolStart]=useState('08:00')
  const [schoolEnd,setSchoolEnd]=useState('15:00')
  const [timetable,setTimetable]=useState('')
  const [trainSessions,setTrainSessions]=useState([])
  const [cardioSessions,setCardioSessions]=useState([])
  const [hasCardio,setHasCardio]=useState(false)
  const [extras,setExtras]=useState([])
  const [extraName,setExtraName]=useState('')
  const [extraDay,setExtraDay]=useState('')
  const [extraStart,setExtraStart]=useState('')
  const [extraEnd,setExtraEnd]=useState('')
  const [saving,setSaving]=useState(false)

  const cur=OB_STEPS[step]
  const TOTAL=4
  const snum=Math.max(0,step-1)
  const next=()=>step<OB_STEPS.length-1&&setStep(s=>s+1)
  const back=()=>step>0&&setStep(s=>s-1)

  const finish=async()=>{
    setSaving(true)
    const routine=buildRoutine({schoolStart,schoolEnd,trainingSessions:trainSessions,cardioSessions:hasCardio?cardioSessions:[],extraSessions:extras})
    const profileData={
      name:authUser.user_metadata?.name||authUser.email.split('@')[0],
      onboarded:true,
      school_start:schoolStart, school_end:schoolEnd, timetable,
      training_sessions:trainSessions,
      cardio_sessions:hasCardio?cardioSessions:[],
      extra_sessions:extras,
      routine,
    }
    try{
      await saveProfile(authUser.id,profileData)
      onComplete(profileData)
    }catch(e){console.error(e)}
    setSaving(false)
  }

  if(cur==='welcome')return(
    <div className="scr sc" style={{flex:1,padding:'34px 24px 30px',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{width:50,height:50,background:K.lime,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:22}}>
          <span style={{fontFamily:'Barlow Condensed',fontSize:22,fontWeight:800,color:K.bg}}>G</span>
        </div>
        <div className="hd" style={{fontSize:34,color:K.ink,lineHeight:1.1,marginBottom:12}}>
          Hey {(authUser.user_metadata?.name||authUser.email).split(' ')[0]}.<br/>Let's build<br/>your system.
        </div>
        <div style={{fontSize:14,color:K.inkM,lineHeight:1.7,marginBottom:22}}>We'll collect your real schedule and build a personalized weekly routine. No defaults, no guessing.</div>
        {[['📚','Your actual school timetable'],['⚡','Training — different times per day'],['🏃','Cardio — per session scheduling'],['☁️','Everything syncs across all your devices']].map(([ic,tx],i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 13px',background:K.panel,border:`1px solid ${K.border}`,borderRadius:10,marginBottom:7}}>
            <span style={{fontSize:17}}>{ic}</span><span style={{fontSize:13,color:K.ink}}>{tx}</span>
          </div>
        ))}
      </div>
      <button className="btn bLime" onClick={next} style={{marginTop:20}}>Start setup →</button>
    </div>
  )

  if(cur==='done')return(
    <div className="scr sc" style={{flex:1,padding:'40px 24px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:72,height:72,background:K.lime,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,animation:'glow 2s infinite'}}>
        <Ico d={IC.chk} s={32} c={K.bg} w={2.8}/>
      </div>
      <div className="hd" style={{fontSize:30,color:K.ink,textAlign:'center',marginBottom:10}}>Built for you,<br/>{(authUser.user_metadata?.name||'').split(' ')[0]||'Athlete'}.</div>
      <div style={{fontSize:14,color:K.inkM,textAlign:'center',lineHeight:1.7,maxWidth:270,marginBottom:32}}>Your personalized routine is ready and saved to the cloud. Log in from any device to see it.</div>
      <button className="btn bLime" style={{maxWidth:270,opacity:saving?0.7:1}} onClick={finish}>
        {saving?<Spinner/>:'Open my dashboard →'}
      </button>
    </div>
  )

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'6px 20px 10px',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {step>1&&<div onClick={back} style={{cursor:'pointer',display:'flex'}}><Ico d={IC.bk} s={16} c={K.inkM}/></div>}
            <span className="lbl">Step {snum} of {TOTAL}</span>
          </div>
          <div style={{display:'flex',gap:5}}>{Array.from({length:TOTAL}).map((_,i)=><div key={i} className={`sdot ${i<snum?'on':''}`}/>)}</div>
        </div>
        <div className="ptrack"><div className="pfill" style={{width:`${(snum/TOTAL)*100}%`,background:K.lime}}/></div>
      </div>

      <div className="scr up" style={{flex:1,padding:'4px 20px 20px'}}>
        {cur==='school'&&(
          <>
            <div className="hd" style={{fontSize:24,color:K.ink,marginBottom:4}}>📚 School Schedule</div>
            <div style={{fontSize:13,color:K.inkM,marginBottom:16,lineHeight:1.6}}>Your school hours so we can plan around them.</div>
            <span className="ilbl">School hours (Mon–Fri)</span>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:14}}>
              <input className="inp" type="time" value={schoolStart} onChange={e=>setSchoolStart(e.target.value)} style={{flex:1,padding:'10px 11px'}}/>
              <span style={{color:K.inkM,fontSize:12,flexShrink:0}}>to</span>
              <input className="inp" type="time" value={schoolEnd} onChange={e=>setSchoolEnd(e.target.value)} style={{flex:1,padding:'10px 11px'}}/>
            </div>
            <div className="sdiv"/>
            <span className="ilbl">Subjects / timetable (optional)</span>
            <textarea className="inp" rows={4} placeholder={'Monday: Math 8-9, English 9-10\nTuesday: Chemistry 8-9, PE 10-11\n...'} value={timetable} onChange={e=>setTimetable(e.target.value)} style={{marginBottom:10}}/>
            <div className="fzone"><Ico d={IC.img} s={22} c={K.inkM}/><div style={{fontSize:12,color:K.inkM,marginTop:6,fontWeight:500}}>Upload timetable photo</div><div style={{fontSize:10,color:K.inkD,marginTop:2}}>AI will extract your subjects</div></div>
            {timetable&&<div style={{marginTop:10,padding:'9px 12px',background:K.limeBg,border:'1px solid rgba(200,244,65,0.18)',borderRadius:8,fontSize:11,color:K.lime,fontWeight:600}}>✓ Timetable saved — study blocks will be built around your subjects</div>}
          </>
        )}
        {cur==='training'&&(
          <>
            <div className="hd" style={{fontSize:24,color:K.ink,marginBottom:4}}>⚡ Training Sessions</div>
            <div style={{fontSize:13,color:K.inkM,marginBottom:6,lineHeight:1.6}}>Select days and set exact times. Each day can be completely different.</div>
            <div style={{padding:'9px 12px',background:K.panel,border:`1px solid ${K.border}`,borderRadius:9,fontSize:11,color:K.inkM,marginBottom:14,lineHeight:1.5}}>
              💡 Mon: Strength 6–7:30 PM · Wed: Soccer Practice 4–5:30 PM · Sat: Long Run 9–11 AM
            </div>
            <SessionEditor sessions={trainSessions} onChange={setTrainSessions} mode="training"/>
          </>
        )}
        {cur==='cardio'&&(
          <>
            <div className="hd" style={{fontSize:24,color:K.ink,marginBottom:4}}>🏃 Cardio Sessions</div>
            <div style={{fontSize:13,color:K.inkM,marginBottom:14,lineHeight:1.6}}>Separate cardio outside your main training — each day on its own schedule.</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:K.panel,border:`1px solid ${K.border}`,borderRadius:11,marginBottom:14}}>
              <div><div style={{fontSize:13,fontWeight:600,color:K.ink}}>I do separate cardio sessions</div><div style={{fontSize:11,color:K.inkM}}>Running, cycling, swimming, HIIT, etc.</div></div>
              <Toggle on={hasCardio} onChange={setHasCardio}/>
            </div>
            {hasCardio&&<div className="fi"><SessionEditor sessions={cardioSessions} onChange={setCardioSessions} mode="cardio"/></div>}
            {!hasCardio&&<div style={{padding:'20px',background:K.panel,border:`1px solid ${K.border}`,borderRadius:12,textAlign:'center'}}><div style={{fontSize:22,marginBottom:6}}>🏃</div><div style={{fontSize:13,color:K.inkM,lineHeight:1.6}}>Toggle on to configure separate cardio sessions. These are tracked independently from training and affect your energy score each day.</div></div>}
          </>
        )}
        {cur==='extras'&&(
          <>
            <div className="hd" style={{fontSize:24,color:K.ink,marginBottom:4}}>📌 Other Commitments</div>
            <div style={{fontSize:13,color:K.inkM,marginBottom:16,lineHeight:1.6}}>Tutoring, clubs, part-time work, fixed classes. Skip if none.</div>
            <div style={{background:K.panel,border:`1px solid ${K.border}`,borderRadius:12,padding:14,marginBottom:12}}>
              <span className="ilbl">Activity name</span>
              <input className="inp" placeholder="e.g. Math Tutoring" value={extraName} onChange={e=>setExtraName(e.target.value)} style={{marginBottom:10}}/>
              <div style={{marginBottom:10}}>
                <span className="ilbl">Day</span>
                <select className="inp" value={extraDay} onChange={e=>setExtraDay(e.target.value)} style={{padding:'10px 11px'}}>
                  <option value="">Select day</option>
                  {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <span className="ilbl">Time</span>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
                <input className="inp" type="time" value={extraStart} onChange={e=>setExtraStart(e.target.value)} style={{flex:1,padding:'10px 11px'}}/>
                <span style={{color:K.inkM,fontSize:12,flexShrink:0}}>to</span>
                <input className="inp" type="time" value={extraEnd} onChange={e=>setExtraEnd(e.target.value)} style={{flex:1,padding:'10px 11px'}}/>
              </div>
              <button className="btn bDark bSm" onClick={()=>{
                if(!extraName.trim()||!extraDay)return
                setExtras(ex=>[...ex,{name:extraName.trim(),day:extraDay,start:extraStart||'17:00',end:extraEnd||'18:00'}])
                setExtraName('');setExtraDay('');setExtraStart('');setExtraEnd('')
              }}>+ Add commitment</button>
            </div>
            {extras.map((ex,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 13px',background:K.card,border:`1px solid ${K.border}`,borderRadius:10,marginBottom:7}}>
                <div><div style={{fontSize:13,fontWeight:600,color:K.ink}}>{ex.name}</div><div style={{fontSize:11,color:K.inkM}}>{ex.day} · {ex.start}–{ex.end}</div></div>
                <div onClick={()=>setExtras(e=>e.filter((_,j)=>j!==i))} style={{cursor:'pointer',padding:6}}><Ico d={IC.del} s={14} c={K.red}/></div>
              </div>
            ))}
            {extras.length===0&&<div style={{padding:'14px',background:K.panel,border:`1px solid ${K.border}`,borderRadius:10,textAlign:'center'}}><div style={{fontSize:12,color:K.inkM}}>No commitments added. You can skip.</div></div>}
          </>
        )}
      </div>

      <div style={{padding:'8px 20px 28px',flexShrink:0,borderTop:`1px solid ${K.border}`}}>
        <button className="btn bLime" onClick={next}>Continue →</button>
      </div>
    </div>
  )
}

// ─── DASHBOARD ─────────────────────────────────────────────────────
function Dashboard({authUser,profile,tasks,setTasks,onNav,onTaskToggle}){
  const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayName=DAY_NAMES[new Date().getDay()]
  const routine=profile?.routine||{}
  const todayBlocks=routine[todayName]||[]
  const energy=todayEnergy(routine,todayName)
  const eCol=energy>=70?K.grn:energy>=45?K.yel:K.red
  const streak=calcStreak(tasks)
  const urgTasks=tasks.filter(t=>!t.done&&calcUrgency(t)==='high')
  const pending=tasks.filter(t=>!t.done)
  const hasHeavy=todayBlocks.some(b=>b.intensity==='Heavy')
  const insight=urgTasks.length>0&&energy>=70?'High energy + urgent tasks — start your hardest work now.':urgTasks.length>0&&energy<50?'Low energy + urgent tasks — break into 25-min blocks.':hasHeavy&&energy<60?'Heavy session today — keep study blocks short.':energy>=80?'Peak energy — ideal for your hardest tasks.':''

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
      <div className="scr" style={{flex:1,paddingBottom:90}}>
        <div style={{padding:'4px 18px 20px'}}>
          <div className="up" style={{marginBottom:16}}>
            <div style={{fontSize:12,color:K.inkM,marginBottom:3}}>{todayName} · {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'})}</div>
            <div className="hd" style={{fontSize:30,color:K.ink,lineHeight:1.15}}>
              {energy>=70?'Let\'s perform,':'Take it steady,'}<br/>{(profile?.name||authUser.email.split('@')[0]).split(' ')[0]}.
            </div>
          </div>

          {/* Energy + Streak */}
          <div className="up d1" style={{display:'flex',gap:10,marginBottom:13}}>
            <div className="card" style={{flex:1}}>
              <div className="lbl" style={{marginBottom:7}}>Energy Score</div>
              <div style={{display:'flex',alignItems:'baseline',gap:3,marginBottom:8}}>
                <span className="hd" style={{fontSize:34,color:eCol,lineHeight:1}}>{energy}</span>
                <span style={{fontSize:12,color:K.inkM}}>/100</span>
              </div>
              <div className="ptrack"><div className="pfill" style={{width:`${energy}%`,background:eCol}}/></div>
              <div style={{fontSize:10,color:K.inkM,marginTop:5}}>{energy>=70?'High focus capacity':'Pace yourself today'}</div>
            </div>
            <div className="card" style={{width:90,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3}}>
              <div className="lbl">Streak</div>
              {streak>0?(<><div className="hd" style={{fontSize:32,color:K.lime,lineHeight:1}}>{streak}</div><div style={{fontSize:14}}>🔥</div></>):(<><div className="hd" style={{fontSize:28,color:K.inkD,lineHeight:1}}>0</div><div style={{fontSize:9,color:K.inkM,marginTop:2,textAlign:'center',lineHeight:1.3}}>finish a task</div></>)}
            </div>
          </div>

          {insight&&<div className="up d2" style={{marginBottom:13,padding:'11px 13px',background:K.limeBg,border:'1px solid rgba(200,244,65,0.18)',borderRadius:12}}><div style={{fontSize:10,fontWeight:700,color:K.lime,letterSpacing:'0.08em',marginBottom:3}}>⚡ GRYND INSIGHT</div><div style={{fontSize:12,color:K.ink,lineHeight:1.5}}>{insight}</div></div>}

          {urgTasks.length>0&&(
            <div className="up d2" style={{marginBottom:13}}>
              <div style={{background:K.redBg,border:`1px solid ${K.redB}`,borderRadius:13,padding:'12px 15px',display:'flex',alignItems:'center',gap:11,cursor:'pointer'}} onClick={()=>onNav('tasks')}>
                <div style={{width:34,height:34,background:K.red,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.wrn} s={15} c="white"/></div>
                <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:K.red,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:2}}>{urgTasks.length} HIGH URGENCY TASK{urgTasks.length>1?'S':''}</div><div style={{fontSize:12,color:K.inkM,lineHeight:1.4}}>{urgTasks[0].title}{urgTasks.length>1&&` +${urgTasks.length-1} more`}</div></div>
                <Ico d={IC.cr} s={13} c={K.inkM}/>
              </div>
            </div>
          )}

          {/* Today */}
          <div className="up d3" style={{marginBottom:13}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
              <span className="lbl">Today's Plan</span>
              <span style={{fontSize:11,color:K.lime,cursor:'pointer',fontWeight:600}} onClick={()=>onNav('calendar')}>Full week →</span>
            </div>
            {todayBlocks.length===0?(<div style={{padding:'20px',background:K.card,border:`1px solid ${K.border}`,borderRadius:13,textAlign:'center',color:K.inkM,fontSize:13}}>Rest day — nothing scheduled</div>):(
              <div className="card" style={{padding:'6px 14px'}}>
                {todayBlocks.slice(0,5).map((b,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:i<Math.min(todayBlocks.length,5)-1?`1px solid ${K.border}`:'none'}}>
                    <span style={{fontSize:10,color:K.inkM,width:34,flexShrink:0}}>{b.start}</span>
                    <span style={{padding:'3px 10px',borderRadius:999,fontSize:11,fontWeight:600,background:`${b.color}18`,color:b.color,border:`1px solid ${b.color}28`,whiteSpace:'nowrap'}}>{b.label}</span>
                  </div>
                ))}
                {todayBlocks.length>5&&<div style={{fontSize:11,color:K.inkM,textAlign:'center',padding:'7px 0'}}>+{todayBlocks.length-5} more</div>}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="up d4" style={{marginBottom:13}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
              <span className="lbl">Assignments ({pending.length} pending)</span>
              <span style={{fontSize:11,color:K.lime,cursor:'pointer',fontWeight:600}} onClick={()=>onNav('tasks')}>All →</span>
            </div>
            {pending.length===0?(
              <div style={{padding:'16px',background:K.card,border:`1px solid ${K.border}`,borderRadius:12,textAlign:'center',color:K.inkM,fontSize:13}}>
                {tasks.length===0?'No assignments yet — add one in Tasks 📝':'All caught up 🎉'}
              </div>
            ):(
              <div className="card" style={{padding:'4px 14px'}}>
                {pending.slice(0,3).map(t=>{const ug=calcUrgency(t);const us=URG[ug];return(
                  <div key={t.id} className="trow">
                    <div className={`ck ${t.done?'on':''}`} onClick={e=>{e.stopPropagation();onTaskToggle(t.id)}}>{t.done&&<Ico d={IC.chk} s={10} c={K.bg} w={2.5}/>}</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:K.ink,marginBottom:2}}>{t.title}</div><div style={{fontSize:10,color:K.inkM}}>{t.subject&&`${t.subject} · `}{t.dueDate?`Due ${new Date(t.dueDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:'No deadline'}</div></div>
                    <span className="ubadge" style={{background:us.bg,color:us.text,border:`1px solid ${us.border}`}}>{us.label}</span>
                  </div>
                )})}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="up d5">
            <div className="lbl" style={{marginBottom:9}}>Quick Actions</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[{ic:IC.pls,lb:'Add Task',ac:()=>onNav('tasks'),col:K.lime},{ic:IC.brn,lb:'Homework AI',ac:()=>onNav('homework'),col:K.blue},{ic:IC.edt,lb:'Edit Routine',ac:()=>onNav('calendar'),col:K.yel},{ic:IC.coa,lb:'Ask Coach',ac:()=>onNav('coach'),col:K.pur}].map((a,i)=>(
                <div key={i} onClick={a.ac} style={{background:K.card,border:`1px solid ${K.border}`,borderRadius:12,padding:'13px',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:30,height:30,background:`${a.col}14`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={a.ic} s={14} c={a.col}/></div>
                  <span style={{fontSize:12,fontWeight:600,color:K.ink}}>{a.lb}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CALENDAR ──────────────────────────────────────────────────────
function CalView({profile,setProfile,authUser,tasks}){
  const [dayIdx,setDayIdx]=useState(()=>{const d=new Date().getDay();return d===0?6:d-1})
  const [editBlock,setEditBlock]=useState(null)
  const [editDraft,setEditDraft]=useState(null)
  const [saving,setSaving]=useState(false)
  const day=DAYS[dayIdx]
  const routine=profile?.routine||{}
  const blocks=routine[day]||[]
  const urgHigh=tasks.filter(t=>!t.done&&calcUrgency(t)==='high')
  const INT_COLS_LOC=INT_COLS
  const openEdit=(b,idx)=>{setEditBlock({block:b,day,idx});setEditDraft({start:b.start,end:b.end,intensity:b.intensity})}
  const saveBlockEdit=async()=>{
    if(!editBlock)return
    setSaving(true)
    const newRoutine={...profile.routine}
    const dayBlocks=[...(newRoutine[editBlock.day]||[])]
    dayBlocks[editBlock.idx]={...editBlock.block,...editDraft}
    dayBlocks.sort((a,b)=>tMin(a.start)-tMin(b.start))
    newRoutine[editBlock.day]=dayBlocks
    const newProfile={...profile,routine:newRoutine}
    setProfile(newProfile)
    if(authUser)await saveProfile(authUser.id,newProfile)
    setEditBlock(null)
    setSaving(false)
  }
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
      <div style={{padding:'4px 18px 11px',flexShrink:0}}>
        <div className="hd up" style={{fontSize:26,color:K.ink,marginBottom:13}}>Schedule</div>
        <div style={{display:'flex',gap:4}}>
          {DAYS.map((d,i)=>{const hasAny=(routine[d]||[]).some(b=>b.type==='training'||b.type==='cardio');return(
            <div key={i} onClick={()=>setDayIdx(i)} style={{flex:1,height:54,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderRadius:10,background:dayIdx===i?K.lime:K.card,border:`1px solid ${dayIdx===i?K.lime:K.border}`,cursor:'pointer',transition:'all 0.15s',gap:1}}>
              <span style={{fontSize:9,color:dayIdx===i?K.bg:K.inkM}}>{DAY_SHORT[i].slice(0,2)}</span>
              <span style={{fontSize:14,fontWeight:700,color:dayIdx===i?K.bg:K.ink}}>{19+i}</span>
              {hasAny&&<div style={{width:4,height:4,borderRadius:'50%',background:dayIdx===i?K.bg:K.lime}}/>}
            </div>
          )})}
        </div>
      </div>
      <div className="scr" style={{flex:1,padding:'0 18px',paddingBottom:90}}>
        <div style={{display:'flex',gap:10,marginBottom:11,flexWrap:'wrap'}}>
          {[[K.blue,'School'],[K.lime,'Training'],[K.pur,'Cardio'],[K.inkM,'Study'],[K.amb,'Extra']].map(([col,lb])=>(
            <div key={lb} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:2,background:col}}/><span style={{fontSize:10,color:K.inkM}}>{lb}</span></div>
          ))}
        </div>
        {blocks.length===0?(<div style={{padding:'30px 20px',background:K.card,border:`1px solid ${K.border}`,borderRadius:13,textAlign:'center'}}><div style={{fontSize:22,marginBottom:8}}>😴</div><div style={{fontSize:14,color:K.inkM}}>Rest day — nothing scheduled</div></div>):(
          blocks.map((b,i)=>{const col=b.color||K.inkM;return(
            <div key={b.id||i} className="up" style={{animationDelay:`${i*0.04}s`,display:'flex',gap:10,marginBottom:5,alignItems:'flex-start'}}>
              <div style={{width:34,flexShrink:0,paddingTop:9}}><div style={{fontSize:10,color:K.inkM,textAlign:'right'}}>{b.start}</div></div>
              <div className="cblk" style={{flex:1,borderLeftColor:col,background:`${col}0D`,cursor:'pointer'}} onClick={()=>openEdit(b,i)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1,marginRight:8}}><div style={{fontSize:12,fontWeight:600,color:K.ink,marginBottom:1,lineHeight:1.3}}>{b.label}</div><div style={{fontSize:10,color:K.inkM}}>{b.start} – {b.end}</div></div>
                  <div style={{display:'flex',gap:5,alignItems:'center',flexShrink:0}}>
                    {b.isStudy&&urgHigh.length>0&&<span className="ubadge" style={{background:K.redBg,color:K.red,border:`1px solid ${K.redB}`}}>URGENT</span>}
                    {b.intensity&&<span className="chip" style={{background:INT_COLS_LOC[b.intensity]?.bg||K.panel,color:INT_COLS_LOC[b.intensity]?.tx||K.inkM}}>{b.intensity}</span>}
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:col}}>{b.type}</span>
                    <Ico d={IC.edt} s={11} c={col} w={1.5}/>
                  </div>
                </div>
              </div>
            </div>
          )})
        )}
        <div style={{border:`1.5px dashed ${K.border}`,borderRadius:10,padding:12,textAlign:'center',cursor:'pointer',color:K.inkM,fontSize:12,marginTop:8,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
          <Ico d={IC.pls} s={13} c={K.inkM}/> Add custom block
        </div>
      </div>
      {editBlock&&(
        <div style={{position:'absolute',inset:0,background:'rgba(6,7,8,0.85)',zIndex:200,display:'flex',flexDirection:'column',justifyContent:'flex-end'}} onClick={e=>{if(e.target===e.currentTarget)setEditBlock(null)}}>
          <div className="sc" style={{background:K.panel,borderRadius:'18px 18px 0 0',padding:'20px 20px 38px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div className="hd" style={{fontSize:19,color:K.ink}}>Edit Block</div>
              <div onClick={()=>setEditBlock(null)} style={{cursor:'pointer',padding:6,borderRadius:8,background:K.card}}><Ico d={IC.del} s={13} c={K.inkM}/></div>
            </div>
            <div style={{fontSize:12,color:K.inkM,marginBottom:14,padding:'8px 11px',background:K.card,borderRadius:9,border:`1px solid ${K.border}`}}>{editBlock.block.label} · {editBlock.day}</div>
            <div style={{display:'flex',gap:8,alignItems:'flex-end',marginBottom:12}}>
              <div style={{flex:1}}><span className="ilbl">Start</span><input className="inp" type="time" value={editDraft?.start||''} onChange={e=>setEditDraft(d=>({...d,start:e.target.value}))}/></div>
              <div style={{flex:1}}><span className="ilbl">End</span><input className="inp" type="time" value={editDraft?.end||''} onChange={e=>setEditDraft(d=>({...d,end:e.target.value}))}/></div>
            </div>
            {(editBlock.block.type==='training'||editBlock.block.type==='cardio')&&(
              <><span className="ilbl" style={{marginBottom:8,display:'block'}}>Intensity</span><IntBtn val={editDraft?.intensity||'Medium'} onChange={v=>setEditDraft(d=>({...d,intensity:v}))}/></>
            )}
            <button className="btn bLime" onClick={saveBlockEdit} disabled={saving} style={{marginTop:16}}>{saving?<Spinner/>:'Save changes'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TASKS ─────────────────────────────────────────────────────────
function TasksView({authUser,tasks,setTasks}){
  const [exp,setExp]=useState(null)
  const [f,setF]=useState('All')
  const [adding,setAdding]=useState(false)
  const [nt,setNt]=useState({title:'',subject:'',dueDate:'',estHours:'1',diff:'Medium',notes:''})
  const [saving,setSaving]=useState(false)

  const doToggle=async(id)=>{
    const task=tasks.find(t=>t.id===id)
    if(!task)return
    const updated={...task,done:!task.done,doneAt:!task.done?new Date().toISOString():null}
    setTasks(ts=>ts.map(t=>t.id===id?updated:t))
    await saveTask(authUser.id,taskToDb(updated,authUser.id))
  }

  const doDelete=async(id)=>{
    setTasks(ts=>ts.filter(t=>t.id!==id))
    await deleteTask(authUser.id,id)
  }

  const doAdd=async()=>{
    if(!nt.title.trim())return
    setSaving(true)
    const newTask={...nt,id:Date.now().toString(),done:false,doneAt:null}
    setTasks(ts=>[newTask,...ts])
    await saveTask(authUser.id,taskToDb(newTask,authUser.id))
    setNt({title:'',subject:'',dueDate:'',estHours:'1',diff:'Medium',notes:''})
    setAdding(false)
    setSaving(false)
  }

  const vis=tasks.filter(t=>f==='Done'?t.done:f==='High'?!t.done&&calcUrgency(t)==='high':!t.done)

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'4px 18px 11px',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11}}>
          <div className="hd up" style={{fontSize:26,color:K.ink}}>Assignments</div>
          <button className="btn bLime bSm" onClick={()=>setAdding(a=>!a)}>{adding?'Cancel':'+ Add'}</button>
        </div>
        <div className="tg">{['All','High','Done'].map(x=><div key={x} className={`topt ${f===x?'on':''}`} onClick={()=>setF(x)}>{x}</div>)}</div>
      </div>
      <div className="scr" style={{flex:1,padding:'0 18px',paddingBottom:90}}>
        {adding&&(
          <div className="card fi" style={{marginBottom:13,borderColor:K.lime}}>
            <div className="lbl" style={{marginBottom:11,color:K.lime}}>New Assignment</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <input className="inp" placeholder="Assignment title *" value={nt.title} onChange={e=>setNt(n=>({...n,title:e.target.value}))}/>
              <div style={{display:'flex',gap:8}}>
                <input className="inp" placeholder="Subject" value={nt.subject} onChange={e=>setNt(n=>({...n,subject:e.target.value}))} style={{flex:1}}/>
                <input className="inp" type="date" value={nt.dueDate} onChange={e=>setNt(n=>({...n,dueDate:e.target.value}))} style={{flex:1}}/>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <div style={{flex:1}}><span className="ilbl">Est. hours</span><input className="inp" type="number" min="0.5" max="20" step="0.5" value={nt.estHours} onChange={e=>setNt(n=>({...n,estHours:e.target.value}))}/></div>
                <div style={{flex:2}}><span className="ilbl">Difficulty</span><div style={{display:'flex',gap:6}}>{['Easy','Medium','Hard'].map(d=><div key={d} onClick={()=>setNt(n=>({...n,diff:d}))} style={{flex:1,padding:'9px 0',textAlign:'center',borderRadius:8,border:`1.5px solid ${nt.diff===d?K.lime:K.border}`,background:nt.diff===d?K.limeBg:'transparent',fontSize:11,fontWeight:600,color:nt.diff===d?K.lime:K.inkM,cursor:'pointer'}}>{d}</div>)}</div></div>
              </div>
              <textarea className="inp" placeholder="Notes (optional)" value={nt.notes} onChange={e=>setNt(n=>({...n,notes:e.target.value}))} style={{minHeight:55}}/>
              <button className="btn bLime" onClick={doAdd} disabled={saving}>{saving?<Spinner/>:'Save assignment'}</button>
            </div>
          </div>
        )}
        {vis.length===0&&!adding&&(<div style={{padding:'30px 20px',background:K.card,border:`1px solid ${K.border}`,borderRadius:13,textAlign:'center'}}><div style={{fontSize:22,marginBottom:8}}>{f==='Done'?'✅':'📝'}</div><div style={{fontSize:14,color:K.inkM}}>{f==='Done'?'No completed tasks yet':'No tasks — add your first assignment'}</div></div>)}
        {vis.map((t,i)=>{
          const ug=calcUrgency(t);const us=URG[ug]
          const hrsLeft=t.dueDate?Math.max(0,(new Date(t.dueDate+'T23:59:00')-new Date())/3600000).toFixed(0):null
          return(
            <div key={t.id} className="card up" style={{marginBottom:10,animationDelay:`${i*0.06}s`,borderColor:ug==='high'?K.redB:K.border}}>
              <div style={{display:'flex',gap:11,alignItems:'flex-start',cursor:'pointer'}} onClick={()=>setExp(exp===t.id?null:t.id)}>
                <div className={`ck ${t.done?'on':''}`} style={{marginTop:2}} onClick={e=>{e.stopPropagation();doToggle(t.id)}}>{t.done&&<Ico d={IC.chk} s={10} c={K.bg} w={2.5}/>}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:5,alignItems:'center'}}>
                    <span className="ubadge" style={{background:us.bg,color:us.text,border:`1px solid ${us.border}`}}>{us.label}</span>
                    <span className="chip" style={{background:K.panel,color:K.inkM,border:`1px solid ${K.border}`}}>{t.diff||'Medium'}</span>
                    {hrsLeft!==null&&Number(hrsLeft)<24&&<span className="chip" style={{background:K.redBg,color:K.red}}>⏱ {hrsLeft}h left</span>}
                  </div>
                  <div style={{fontSize:14,fontWeight:600,color:t.done?K.inkM:K.ink,textDecoration:t.done?'line-through':'none',marginBottom:3,lineHeight:1.3}}>{t.title}</div>
                  <div style={{fontSize:11,color:K.inkM}}>{t.subject&&`${t.subject} · `}{t.dueDate?`Due ${new Date(t.dueDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:'No deadline'} · ~{t.estHours||1}h</div>
                </div>
                <Ico d={exp===t.id?IC.cd:IC.cr} s={14} c={K.inkM}/>
              </div>
              {exp===t.id&&(
                <div className="fi" style={{marginTop:11,paddingTop:11,borderTop:`1px solid ${K.border}`}}>
                  {t.notes&&<div style={{fontSize:12,color:K.inkM,lineHeight:1.6,marginBottom:10,background:K.panel,padding:'8px 11px',borderRadius:8}}>{t.notes}</div>}
                  <div style={{fontSize:11,color:K.inkM,marginBottom:10,padding:'8px 11px',background:K.panel,borderRadius:8}}><strong style={{color:us.text}}>Urgency: {ug.toUpperCase()}</strong>{hrsLeft!==null&&` · ${hrsLeft}h until deadline · ~${t.estHours||1}h needed`}</div>
                  <div style={{display:'flex',gap:7}}>
                    <button className="btn bLime bSm" style={{flex:1}}>Start session</button>
                    <button className="btn bDark bSm" style={{flex:1}}>Ask AI</button>
                    <button onClick={e=>{e.stopPropagation();doDelete(t.id)}} style={{background:K.redBg,border:`1px solid ${K.redB}`,borderRadius:9,padding:'8px 11px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico d={IC.del} s={13} c={K.red}/></button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── HOMEWORK AI ────────────────────────────────────────────────────
function HomeworkView(){
  const [msgs,setMsgs]=useState([{role:'ai',text:'Upload a photo of your homework or type your question. I\'ll guide you step-by-step — hints first, full solution only if you explicitly ask. 📖'}])
  const [input,setInput]=useState('')
  const [busy,setBusy]=useState(false)
  const [imgPrev,setImgPrev]=useState(null)
  const [imgB64,setImgB64]=useState(null)
  const fileRef=useRef(null)
  const ref=useRef(null)
  const SYS='You are GRYND Homework AI — an expert academic tutor. NEVER give the final answer immediately. Always start with a hint or first step only. Ask what the student thinks before continuing. Only give the full solution when explicitly asked. Break every problem into numbered steps. You are GRYND Homework AI — never say you are Claude or made by Anthropic.'
  const handleImg=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setImgB64(ev.target.result.split(',')[1]);setImgPrev(ev.target.result)};r.readAsDataURL(f)}
  const send=useCallback(async(text)=>{
    const q=(text||input).trim();if((!q&&!imgB64)||busy)return
    setInput('')
    const uc=[];if(imgB64)uc.push({type:'image',source:{type:'base64',media_type:'image/jpeg',data:imgB64}});if(q)uc.push({type:'text',text:q})
    if(!uc.length)return
    const um={role:'user',text:q||(imgPrev?'[Homework image]':''),img:imgPrev}
    const next=[...msgs,um];setMsgs(next);setImgB64(null);setImgPrev(null);setBusy(true)
    try{
      const hist=next.map((m,idx)=>{if(m.role==='ai')return{role:'assistant',content:m.text};if(m.img&&idx===next.length-1)return{role:'user',content:uc};return{role:'user',content:m.text||'[image]'}})
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:SYS,messages:hist})})
      const d=await res.json();setMsgs(m=>[...m,{role:'ai',text:d.content?.[0]?.text||'Let me think...'}])
    }catch{setMsgs(m=>[...m,{role:'ai',text:'Connection issue — try again.'}])}
    setBusy(false)
  },[msgs,input,imgB64,imgPrev,busy])
  useEffect(()=>{setTimeout(()=>ref.current?.scrollIntoView({behavior:'smooth'}),60)},[msgs,busy])
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'4px 18px 11px',flexShrink:0,borderBottom:`1px solid ${K.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:11}}>
          <div style={{width:40,height:40,background:K.blueBg,border:`1px solid ${K.blueB}`,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.brn} s={18} c={K.blue}/></div>
          <div><div className="hd" style={{fontSize:20,color:K.ink}}>Homework AI</div><div style={{fontSize:11,color:K.inkM}}>Guides step-by-step · hints before answers</div></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'13px 18px',display:'flex',flexDirection:'column',gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start',gap:4}}>
            {m.img&&<div style={{maxWidth:'84%',borderRadius:11,overflow:'hidden',border:`1px solid ${K.border}`,alignSelf:m.role==='user'?'flex-end':'flex-start'}}><img src={m.img} alt="hw" style={{width:'100%',display:'block'}}/></div>}
            {m.text&&(<div style={{display:'flex',alignItems:'flex-end',gap:7,flexDirection:m.role==='user'?'row-reverse':'row'}}>
              {m.role==='ai'&&<div style={{width:26,height:26,background:K.blueBg,border:`1px solid ${K.blueB}`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.brn} s={12} c={K.blue}/></div>}
              <div className={`bmsg ${m.role==='ai'?'ai':'usr'}`} style={{animationDelay:`${i*0.04}s`}}>{m.role==='ai'&&<div style={{fontSize:9,fontWeight:700,color:K.blue,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:4}}>HOMEWORK AI</div>}{m.text}</div>
            </div>)}
          </div>
        ))}
        {busy&&<div style={{display:'flex',alignItems:'flex-end',gap:7}}><div style={{width:26,height:26,background:K.blueBg,border:`1px solid ${K.blueB}`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.brn} s={12} c={K.blue}/></div><div className="bmsg ai" style={{display:'flex',gap:4,alignItems:'center',padding:'12px 14px'}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:K.blue,opacity:0.5,animation:`bk 1.2s ${i*0.2}s infinite`}}/>)}</div></div>}
        <div ref={ref}/>
      </div>
      {imgPrev&&<div style={{padding:'0 18px 7px',flexShrink:0}}><div style={{position:'relative',display:'inline-block'}}><img src={imgPrev} alt="preview" style={{height:58,borderRadius:8,border:`1px solid ${K.border}`,display:'block'}}/><div onClick={()=>{setImgPrev(null);setImgB64(null)}} style={{position:'absolute',top:-5,right:-5,width:17,height:17,background:K.red,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><span style={{fontSize:9,color:'white',fontWeight:700}}>×</span></div></div></div>}
      <div style={{padding:'0 18px 7px',flexShrink:0,display:'flex',gap:6,overflowX:'auto'}}>
        {['Give me a hint','Next step','Show full solution','Explain differently'].map(q=><button key={q} onClick={()=>send(q)} style={{flexShrink:0,background:K.card,border:`1px solid ${K.border}`,color:K.inkM,padding:'5px 10px',borderRadius:999,fontSize:10,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'DM Sans'}}>{q}</button>)}
      </div>
      <div style={{padding:'7px 16px 24px',flexShrink:0,display:'flex',gap:8,alignItems:'center',borderTop:`1px solid ${K.border}`}}>
        <input type="file" id="hw-file-inp" accept="image/*" onChange={handleImg} style={{display:'none'}}/>
        <label htmlFor="hw-file-inp" style={{width:40,height:40,background:K.blueBg,border:`1px solid ${K.blueB}`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}><Ico d={IC.img} s={16} c={K.blue}/></label>
        <input type="text" inputMode="text" enterKeyHint="send" className="inp" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type question or upload photo…" style={{borderRadius:999,padding:'10px 15px',flex:1}}/>
        <button onClick={()=>send()} style={{width:40,height:40,borderRadius:'50%',background:K.lime,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.snd} s={14} c={K.bg}/></button>
      </div>
    </div>
  )
}

// ─── COACH ─────────────────────────────────────────────────────────
function CoachView({authUser,profile,setProfile,tasks}){
  const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayName=DAY_NAMES[new Date().getDay()]
  const routine=profile?.routine||{}
  const energy=todayEnergy(routine,todayName)
  const urgCount=tasks.filter(t=>!t.done&&calcUrgency(t)==='high').length
  const todayBlocks=routine[todayName]||[]
  const todaySched=todayBlocks.map(b=>`${b.start} ${b.label}`).slice(0,6).join(', ')||'rest day'
  const trainToday=todayBlocks.filter(b=>b.type==='training')
  const trainDesc=trainToday.length>0?trainToday.map(b=>`${b.sport||b.label} at ${b.start} (${b.intensity})`).join(', '):'no training today'
  const streak=calcStreak(tasks)
  const name=(profile?.name||authUser.email.split('@')[0]).split(' ')[0]
  const allTrainSess=(profile?.training_sessions||[]).map(s=>`${s.day}: ${s.sport||'Training'} ${s.start}-${s.end} (${s.intensity})`).join('; ')||'none'
  const allCardioSess=(profile?.cardio_sessions||[]).map(s=>`${s.day}: ${s.type||'Cardio'} ${s.start}-${s.end} (${s.intensity})`).join('; ')||'none'
  const SYS=`You are GRYND, an elite AI performance coach for student-athletes. Direct, tactical, data-driven.\nUser: ${name}\nToday: ${todayName} | Energy: ${energy}/100 (${energy>=70?'high':energy>=50?'medium':'low'})\nSchedule: ${todaySched}\nTraining today: ${trainDesc} | Urgent tasks: ${urgCount} | Streak: ${streak} days\nAll training sessions: ${allTrainSess}\nAll cardio sessions: ${allCardioSess}\nSCHEDULE MOVES: When the user asks to move a session to another day, put this JSON tag on the VERY FIRST LINE of your reply: <<<ACTION{"action":"move_activity","from":"SourceDay","to":"TargetDay","session_type":"training"}>>> (use "cardio" if it's a cardio session). Use exact full day names (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday). Then confirm what you moved.\nRules: Max 3 short sentences. Reference actual schedule and energy. One emoji max. You ARE GRYND — never say Claude or Anthropic.`
  const initMsg=`${name}, energy is ${energy} today. ${trainToday.length>0?`${trainDesc} — plan study around it.`:'No training — good day for focused work.'} ${urgCount>0?`${urgCount} urgent task${urgCount>1?'s':''}—tackle the hardest one now.`:'No urgent tasks—stay ahead.'} 💪`
  const [msgs,setMsgs]=useState([{role:'ai',text:initMsg}])
  const [input,setInput]=useState('')
  const [busy,setBusy]=useState(false)
  const ref=useRef(null)
  const QUICK=['When should I study today?','I\'m exhausted','Move a session','What\'s my priority?']
  const execMove=useCallback((action,prof)=>{
    const{from,to,session_type}=action
    if(!DAYS.includes(from)||!DAYS.includes(to))return prof
    const updated={...prof}
    if(session_type==='training'){
      updated.training_sessions=(prof.training_sessions||[]).map(s=>s.day===from?{...s,day:to}:s)
    }else{
      updated.cardio_sessions=(prof.cardio_sessions||[]).map(s=>s.day===from?{...s,day:to}:s)
    }
    updated.routine=buildRoutine({schoolStart:updated.school_start,schoolEnd:updated.school_end,trainingSessions:updated.training_sessions||[],cardioSessions:updated.cardio_sessions||[],extraSessions:updated.extra_sessions||[]})
    return updated
  },[])
  const send=useCallback(async(text)=>{
    const q=(text||input).trim();if(!q||busy)return
    setInput('');const next=[...msgs,{role:'user',text:q}];setMsgs(next);setBusy(true)
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:SYS,messages:next.map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}))})})
      const d=await res.json()
      const raw=d.content?.[0]?.text||'Stay on plan.'
      const actionMatch=raw.match(/<<<ACTION(\{.*?\})>>>/)
      if(actionMatch&&setProfile){
        try{const act=JSON.parse(actionMatch[1]);const np=execMove(act,profile);setProfile(np);if(authUser)await saveProfile(authUser.id,np)}catch(e){console.error('action parse error',e)}
      }
      const display=raw.replace(/<<<ACTION\{.*?\}>>>/,'').trim()
      setMsgs(m=>[...m,{role:'ai',text:display||'Done.'}])
    }catch{setMsgs(m=>[...m,{role:'ai',text:'Network issue. Trust your plan.'}])}
    setBusy(false)
  },[msgs,input,busy,profile,setProfile,authUser,execMove,SYS])
  useEffect(()=>{setTimeout(()=>ref.current?.scrollIntoView({behavior:'smooth'}),60)},[msgs,busy])
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'4px 18px 11px',flexShrink:0,borderBottom:`1px solid ${K.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:11}}>
          <div style={{width:40,height:40,background:K.limeBg,border:'1px solid rgba(200,244,65,0.25)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.zap} s={18} c={K.lime}/></div>
          <div><div className="hd" style={{fontSize:20,color:K.ink}}>AI Coach</div><div style={{fontSize:11,color:K.grn,display:'flex',alignItems:'center',gap:4}}><div style={{width:5,height:5,borderRadius:'50%',background:K.grn}}/>Live · Energy {energy}/100</div></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'13px 18px',display:'flex',flexDirection:'column',gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end',gap:7}}>
            {m.role==='ai'&&<div style={{width:26,height:26,background:K.limeBg,border:'1px solid rgba(200,244,65,0.25)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.zap} s={11} c={K.lime}/></div>}
            <div className={`bmsg ${m.role==='ai'?'ai':'usr'}`} style={{animationDelay:`${i*0.04}s`}}>{m.role==='ai'&&<div style={{fontSize:9,fontWeight:700,color:K.lime,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:4}}>GRYND COACH</div>}{m.text}</div>
          </div>
        ))}
        {busy&&<div style={{display:'flex',alignItems:'flex-end',gap:7}}><div style={{width:26,height:26,background:K.limeBg,border:'1px solid rgba(200,244,65,0.25)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.zap} s={11} c={K.lime}/></div><div className="bmsg ai" style={{display:'flex',gap:4,alignItems:'center'}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:K.lime,opacity:0.5,animation:`bk 1.2s ${i*0.2}s infinite`}}/>)}</div></div>}
        <div ref={ref}/>
      </div>
      <div style={{padding:'0 18px 7px',flexShrink:0,display:'flex',gap:6,overflowX:'auto'}}>
        {QUICK.map(q=><button key={q} onClick={()=>send(q)} style={{flexShrink:0,background:K.card,border:`1px solid ${K.border}`,color:K.inkM,padding:'5px 10px',borderRadius:999,fontSize:10,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'DM Sans'}}>{q}</button>)}
      </div>
      <div style={{padding:'7px 16px 24px',flexShrink:0,display:'flex',gap:8,alignItems:'center',borderTop:`1px solid ${K.border}`}}>
        <input type="text" inputMode="text" enterKeyHint="send" className="inp" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask your coach…" style={{borderRadius:999,padding:'10px 15px'}}/>
        <button onClick={()=>send()} style={{width:40,height:40,borderRadius:'50%',background:K.lime,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico d={IC.snd} s={14} c={K.bg}/></button>
      </div>
    </div>
  )
}

// ─── ROOT ───────────────────────────────────────────────────────────
export default function App(){
  const [authUser,setAuthUser]=useState(null)   // Supabase auth user
  const [profile,setProfile]=useState(null)     // profiles table row
  const [tasks,setTasks]=useState([])
  const [tab,setTab]=useState('home')
  const [loading,setLoading]=useState(true)

  // Listen for Supabase auth changes (handles browser refresh, OAuth, etc.)
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user) bootUser(session.user)
      else setLoading(false)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user) bootUser(session.user)
      else{setAuthUser(null);setProfile(null);setTasks([]);setLoading(false)}
    })
    return()=>subscription.unsubscribe()
  },[])

  const bootUser=async(user)=>{
    setAuthUser(user)
    try{
      const[prof,rawTasks]=await Promise.all([loadProfile(user.id),loadTasks(user.id)])
      setProfile(prof)
      setTasks((rawTasks||[]).map(dbToTask))
    }catch(e){console.error('boot error',e)}
    setLoading(false)
  }

  const handleAuth=async(user)=>{
    setAuthUser(user)
    setLoading(true)
    await bootUser(user)
  }

  const handleOnboarded=async(profileData)=>{
    setProfile(profileData)
    setTasks([])
  }

  const handleLogout=async()=>{
    await signOut()
    setAuthUser(null);setProfile(null);setTasks([]);setTab('home')
  }

  const handleTaskToggle=useCallback(async(id)=>{
    const task=tasks.find(t=>t.id===id);if(!task)return
    const updated={...task,done:!task.done,doneAt:!task.done?new Date().toISOString():null}
    setTasks(ts=>ts.map(t=>t.id===id?updated:t))
    await saveTask(authUser.id,taskToDb(updated,authUser.id))
  },[tasks,authUser])

  const NAV=[
    {id:'home',     label:'Home',    d:IC.home},
    {id:'calendar', label:'Week',    d:IC.cal},
    {id:'tasks',    label:'Tasks',   d:IC.tsk},
    {id:'homework', label:'Study AI',d:IC.hw},
    {id:'coach',    label:'Coach',   d:IC.coa},
  ]

  return(
    <>
      <style>{CSS}</style>
      <div id="gw">
        <SBar/>
        {loading&&(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
            <div className="spin" style={{width:28,height:28,border:`2px solid ${K.border}`,borderTopColor:K.lime,borderRadius:'50%'}}/>
            <div style={{fontSize:12,color:K.inkM}}>Loading your data…</div>
          </div>
        )}
        {!loading&&!authUser&&<Auth onAuth={handleAuth}/>}
        {!loading&&authUser&&!profile?.onboarded&&<Onboarding authUser={authUser} onComplete={handleOnboarded}/>}
        {!loading&&authUser&&profile?.onboarded&&(
          <>
            <div id="topbar">
              <span style={{fontFamily:'Barlow Condensed',fontSize:20,fontWeight:800,letterSpacing:'0.12em',color:K.lime}}>GRYND</span>
              <div style={{display:'flex',alignItems:'center',gap:9}}>
                {/* Cloud sync indicator */}
                <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:K.limeBg,border:'1px solid rgba(200,244,65,0.15)',borderRadius:999}}>
                  <div className="sync-dot"/>
                  <span style={{fontSize:9,fontWeight:600,color:K.lime,letterSpacing:'0.06em'}}>SYNCED</span>
                </div>
                <div style={{width:28,height:28,background:K.limeBg,border:'1px solid rgba(200,244,65,0.25)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:K.lime}}>
                  {(profile?.name||authUser.email)[0].toUpperCase()}
                </div>
                <div onClick={handleLogout} style={{cursor:'pointer',display:'flex',padding:3}}><Ico d={IC.out} s={15} c={K.inkM}/></div>
              </div>
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
              {tab==='home'    &&<Dashboard authUser={authUser} profile={profile} tasks={tasks} setTasks={setTasks} onNav={setTab} onTaskToggle={handleTaskToggle}/>}
              {tab==='calendar'&&<CalView profile={profile} setProfile={setProfile} authUser={authUser} tasks={tasks}/>}
              {tab==='tasks'   &&<TasksView authUser={authUser} tasks={tasks} setTasks={setTasks}/>}
              {tab==='homework'&&<HomeworkView/>}
              {tab==='coach'   &&<CoachView authUser={authUser} profile={profile} setProfile={setProfile} tasks={tasks}/>}
            </div>
            <div id="nav">
              {NAV.map(n=>(
                <button key={n.id} className={`nb ${tab===n.id?'on':''}`} onClick={()=>setTab(n.id)}>
                  <Ico d={n.d} s={19} c={tab===n.id?K.lime:K.inkD} w={tab===n.id?2:1.6}/>
                  {n.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
