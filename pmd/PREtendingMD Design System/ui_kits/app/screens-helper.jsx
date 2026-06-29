/* CloseDose app screens — built as small components */

const { useState } = React;

/* ---------- Reusable bits ---------- */

function TopBar({ title, onBack, right, theme, toggleTheme }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'12px 16px 8px', gap:8,
      position:'sticky', top:0, zIndex:5,
      background: theme==='dark' ? 'rgba(11,23,23,0.85)' : 'rgba(251,248,242,0.85)',
      backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
      borderBottom:'1px solid var(--hairline)'
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8, minWidth:36}}>
        {onBack ? (
          <button onClick={onBack} style={{background:'transparent',border:'none',padding:6,cursor:'pointer',color:'var(--fg)'}}>
            <Icon name="chevronLeft" size={22}/>
          </button>
        ) : <div style={{width:36}}/>}
      </div>
      <div className="title" style={{fontSize:17, fontFamily:'var(--font-sans)', fontWeight:600}}>{title}</div>
      <div style={{display:'flex', alignItems:'center', gap:6, minWidth:36, justifyContent:'flex-end'}}>
        {toggleTheme && (
          <button onClick={toggleTheme} aria-label="toggle theme"
            style={{background:'transparent',border:'none',padding:6,cursor:'pointer',color:'var(--fg-2)'}}>
            <Icon name={theme==='dark'?'sun':'moon'} size={20}/>
          </button>
        )}
        {right}
      </div>
    </div>
  );
}

function TabBar({ tab, setTab, theme }) {
  const tabs = [
    {id:'home', label:'Home', icon:'home'},
    {id:'history', label:'History', icon:'history'},
    {id:'kids', label:'Kids', icon:'baby'},
    {id:'profile', label:'You', icon:'user'},
  ];
  return (
    <div style={{
      position:'sticky', bottom:0, zIndex:5,
      display:'grid', gridTemplateColumns:'repeat(4,1fr)',
      padding:'8px 12px 22px', gap:4,
      background: theme==='dark' ? 'rgba(11,23,23,0.92)' : 'rgba(251,248,242,0.92)',
      backdropFilter:'blur(16px)',
      borderTop:'1px solid var(--hairline)'
    }}>
      {tabs.map(t => {
        const active = tab===t.id;
        return (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:'transparent', border:'none', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            padding:'8px 4px', color: active?'var(--brand)':'var(--fg-3)',
            fontSize:11, fontWeight:600
          }}>
            <Icon name={t.icon} size={22} stroke={active?2:1.75}/>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function KidPill({ kid, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8,
      background: active?'var(--bg-tint)':'var(--bg-card)',
      border:`1px solid ${active?'rgba(14,140,140,0.3)':'var(--border)'}`,
      borderRadius:999, padding:'6px 10px 6px 6px',
      cursor:'pointer', flexShrink:0,
      transition:'all 200ms cubic-bezier(0.2,0,0,1)'
    }}>
      <div style={{
        width:28, height:28, borderRadius:'50%',
        background: kid.color, color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-display)', fontSize:13, fontWeight:600
      }}>{kid.name[0]}</div>
      <div style={{textAlign:'left'}}>
        <div style={{fontSize:13, fontWeight:600, color:'var(--fg)', lineHeight:1.1}}>{kid.name}</div>
        <div style={{fontSize:11, color:'var(--fg-3)', lineHeight:1.1}}>{kid.age}y · {kid.weight} lb</div>
      </div>
    </button>
  );
}

function MedCard({ med, onClick }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', textAlign:'left', cursor:'pointer',
      background:'var(--bg-card)', border:'1px solid var(--hairline)',
      borderRadius:16, padding:'18px', boxShadow:'var(--shadow-1)',
      display:'flex', alignItems:'center', gap:14,
      transition:'all 200ms cubic-bezier(0.2,0,0,1)'
    }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
       onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
      <div style={{
        width:48, height:48, borderRadius:12,
        background: med.tint, color: med.iconColor,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
      }}>
        <Icon name={med.icon} size={24} stroke={2}/>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, color:'var(--fg)', letterSpacing:'-0.01em', lineHeight:1.2}}>{med.name}</div>
        <div style={{fontSize:13, color:'var(--fg-2)', marginTop:2}}>{med.generic} · {med.purpose}</div>
      </div>
      <Icon name="chevronRight" size={20} color="var(--fg-3)"/>
    </button>
  );
}

/* ---------- HOME ---------- */
function HomeScreen({ onPickMed, kids, activeKid, setActiveKid, theme, toggleTheme }) {
  const meds = [
    { id:'tylenol', name:"Children's Tylenol", generic:'Acetaminophen', purpose:'fever, pain', icon:'thermo', tint:'var(--mint-100)', iconColor:'var(--teal-700)' },
    { id:'motrin', name:"Children's Motrin", generic:'Ibuprofen', purpose:'fever, pain', icon:'pill', tint:'var(--amber-100)', iconColor:'var(--amber-700)' },
    { id:'benadryl', name:"Children's Benadryl", generic:'Diphenhydramine', purpose:'allergies', icon:'droplet', tint:'rgba(159,217,205,0.4)', iconColor:'var(--teal-700)' },
    { id:'zyrtec', name:"Children's Zyrtec", generic:'Cetirizine', purpose:'allergies', icon:'droplet', tint:'rgba(221,241,230,0.7)', iconColor:'var(--sage-700)' },
  ];
  const kid = kids.find(k=>k.id===activeKid);
  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100%'}}>
      <TopBar title="closedose" theme={theme} toggleTheme={toggleTheme}
        right={<button style={{background:'transparent',border:'none',padding:6,cursor:'pointer',color:'var(--fg-2)'}}><Icon name="bell" size={20}/></button>}/>

      <div style={{padding:'8px 16px 100px', flex:1, display:'flex', flexDirection:'column', gap:18}}>
        {/* Greeting */}
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>Hi there</div>
          <div className="title-display" style={{fontSize:32}}>Let's find<br/>the right dose.</div>
        </div>

        {/* Kid switcher */}
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
            <div style={{fontSize:13, fontWeight:600, color:'var(--fg-2)'}}>Dosing for</div>
            <button className="btn-ghost" style={{fontSize:13, padding:0, background:'none', border:'none', color:'var(--brand)', fontWeight:600, cursor:'pointer'}}>+ Add child</button>
          </div>
          <div style={{display:'flex', gap:8, overflowX:'auto', margin:'0 -16px', padding:'0 16px 4px'}}>
            {kids.map(k => <KidPill key={k.id} kid={k} active={k.id===activeKid} onClick={()=>setActiveKid(k.id)}/>)}
          </div>
        </div>

        {/* Last dose card */}
        {kid && (
          <div className="card card-tint" style={{display:'flex', alignItems:'center', gap:14}}>
            <div style={{width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Icon name="clock" size={22} color="var(--teal-700)"/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12, color:'var(--teal-800)', fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase'}}>Last dose · {kid.name}</div>
              <div style={{fontSize:14, color:'var(--fg)', marginTop:2}}>Tylenol 5 mL · 2 hr 14 min ago</div>
            </div>
            <span className="badge badge-warn">Wait 1h 46m</span>
          </div>
        )}

        {/* Search */}
        <div className="input-wrap">
          <Icon name="search" size={18} color="var(--fg-3)"/>
          <input placeholder="Search medications…"/>
        </div>

        {/* Med list */}
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
            <div style={{fontSize:13, fontWeight:600, color:'var(--fg-2)'}}>Common medications</div>
            <button style={{background:'none', border:'none', color:'var(--brand)', fontSize:13, fontWeight:600, cursor:'pointer'}}>See all</button>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {meds.map(m => <MedCard key={m.id} med={m} onClick={()=>onPickMed(m)}/>)}
          </div>
        </div>

        {/* Safety reminder */}
        <div style={{
          display:'flex', gap:12, padding:'14px 16px',
          background:'var(--bg-inset)', borderRadius:14,
          border:'1px solid var(--hairline)'
        }}>
          <Icon name="shield" size={20} color="var(--fg-2)"/>
          <div style={{fontSize:12, color:'var(--fg-2)', lineHeight:1.5}}>
            Always confirm dosing with your pediatrician before giving medication.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- DOSE RESULT ---------- */
function DoseScreen({ med, kid, onBack, theme, toggleTheme }) {
  // Simple weight-based calc (acetaminophen ~10–15 mg/kg)
  const weightKg = (kid.weight / 2.205);
  const mg = Math.round(weightKg * 12.5 / 10) * 10;
  const ml = Math.round((mg / 160) * 5 * 2) / 2; // 160mg/5mL suspension

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100%'}}>
      <TopBar title={med.name} onBack={onBack} theme={theme} toggleTheme={toggleTheme}/>

      <div style={{padding:'12px 16px 140px', flex:1, display:'flex', flexDirection:'column', gap:16}}>
        {/* Hero dose card */}
        <div className="card" style={{
          background:'linear-gradient(180deg, var(--bg-tint) 0%, var(--bg-tint-2) 100%)',
          border:'1px solid rgba(14,140,140,0.18)', padding:'28px 24px',
          textAlign:'center'
        }}>
          <div className="eyebrow">Recommended dose</div>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'center', marginTop:14, gap:6}}>
            <span className="dose-numeral" style={{fontSize:96, color:'var(--fg)'}}>{ml}</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:24, color:'var(--fg-2)', fontWeight:500}}>mL</span>
          </div>
          <div style={{fontSize:14, color:'var(--fg-2)', marginTop:6}}>
            ≈ {mg} mg · for {kid.name}, {kid.weight} lb
          </div>
        </div>

        {/* Schedule + concentration sub-cards */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <div className="card" style={{padding:'16px'}}>
            <div className="eyebrow" style={{marginBottom:8}}>Every</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, color:'var(--fg)', letterSpacing:'-0.01em'}}>4 hours</div>
            <div style={{fontSize:12, color:'var(--fg-3)', marginTop:2}}>Max 5 doses / 24h</div>
          </div>
          <div className="card" style={{padding:'16px'}}>
            <div className="eyebrow" style={{marginBottom:8}}>Strength</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, color:'var(--fg)', letterSpacing:'-0.01em'}}>160 mg / 5 mL</div>
            <div style={{fontSize:12, color:'var(--fg-3)', marginTop:2}}>Liquid suspension</div>
          </div>
        </div>

        {/* Safety */}
        <div className="card" style={{display:'flex', gap:12, alignItems:'flex-start', padding:'14px 16px'}}>
          <Icon name="shield" size={20} color="var(--brand)"/>
          <div style={{fontSize:13, color:'var(--fg-2)', lineHeight:1.5}}>
            Always confirm dosing with your pediatrician before giving medication.
          </div>
        </div>

        {/* History snippet */}
        <div>
          <div style={{fontSize:13, fontWeight:600, color:'var(--fg-2)', marginBottom:10}}>Recent doses for {kid.name}</div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[
              ['Tylenol · 5 mL', '2:14 AM, today'],
              ['Tylenol · 5 mL', '10:08 PM, yesterday'],
              ['Motrin · 4 mL', '6:30 PM, yesterday'],
            ].map((r,i)=>(
              <div key={i} style={{
                display:'flex', justifyContent:'space-between',
                padding:'12px 14px', background:'var(--bg-card)',
                border:'1px solid var(--hairline)', borderRadius:10,
                fontSize:13
              }}>
                <span style={{color:'var(--fg)', fontWeight:500}}>{r[0]}</span>
                <span style={{color:'var(--fg-3)'}}>{r[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position:'sticky', bottom:0, padding:'12px 16px 28px',
        background: theme==='dark' ? 'rgba(11,23,23,0.92)' : 'rgba(251,248,242,0.92)',
        backdropFilter:'blur(16px)',
        borderTop:'1px solid var(--hairline)',
        display:'flex', gap:8
      }}>
        <button className="btn btn-primary btn-lg" style={{flex:1}}>
          <Icon name="check" size={18}/> I gave this dose
        </button>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.DoseScreen = DoseScreen;
window.TabBar = TabBar;
