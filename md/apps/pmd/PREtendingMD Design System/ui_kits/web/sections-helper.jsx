/* CloseDose marketing site components */

const { useState } = React;

function Header() {
  return (
    <header style={{
      position:'sticky', top:0, zIndex:10,
      background:'rgba(251,248,242,0.85)', backdropFilter:'blur(16px)',
      borderBottom:'1px solid var(--hairline)',
      padding:'14px 32px',
      display:'flex', alignItems:'center', justifyContent:'space-between'
    }}>
      <a href="#" style={{display:'flex', alignItems:'center', gap:8, textDecoration:'none'}}>
        <img src="../../assets/logo-mark.svg" alt="" style={{height:32}}/>
        <span style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, color:'var(--teal-900)', letterSpacing:'-0.02em'}}>closedose</span>
      </a>
      <nav style={{display:'flex', gap:32, alignItems:'center'}}>
        <a href="#" style={{color:'var(--fg-2)', fontSize:14, fontWeight:500}}>Medications</a>
        <a href="#" style={{color:'var(--fg-2)', fontSize:14, fontWeight:500}}>Safety</a>
        <a href="#" style={{color:'var(--fg-2)', fontSize:14, fontWeight:500}}>About</a>
        <button className="btn btn-primary" style={{width:'auto', padding:'10px 18px', fontSize:14}}>Open app</button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section style={{
      position:'relative', padding:'80px 32px 96px', overflow:'hidden',
      display:'grid', gridTemplateColumns:'1.05fr 0.95fr', gap:48, alignItems:'center', maxWidth:1240, margin:'0 auto'
    }}>
      {/* Soft radial wash */}
      <div style={{
        position:'absolute', right:'-100px', top:'-50px', width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(159,217,205,0.5) 0%, rgba(159,217,205,0) 60%)', zIndex:0, pointerEvents:'none'
      }}/>

      <div style={{position:'relative', zIndex:1}}>
        <div className="eyebrow" style={{marginBottom:18}}>For tired parents</div>
        <h1 className="title-display" style={{fontSize:80, fontWeight:600, marginBottom:24, color:'var(--teal-950)', maxWidth:560}}>
          Find the right dose. Even at 3am.
        </h1>
        <p style={{fontSize:19, lineHeight:1.55, color:'var(--fg-2)', maxWidth:480, marginBottom:32}}>
          CloseDose helps you confirm safe doses of common over-the-counter medications for kids — calmly, clearly, and without the math.
        </p>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <button className="btn btn-primary btn-lg" style={{width:'auto'}}>Open the app <Icon name="arrowRight" size={18}/></button>
          <button className="btn btn-ghost" style={{width:'auto', padding:'14px 18px'}}>How it works</button>
        </div>
        <div style={{marginTop:28, display:'flex', gap:18, alignItems:'center', color:'var(--fg-3)', fontSize:13}}>
          <div style={{display:'flex', alignItems:'center', gap:6}}><Icon name="shield" size={16}/> Pediatrician-reviewed</div>
          <div style={{display:'flex', alignItems:'center', gap:6}}><Icon name="moon" size={16}/> Dark-mode friendly</div>
        </div>
      </div>

      {/* Stacked phone hero — fanned cards motif */}
      <div style={{position:'relative', height:520, zIndex:1}}>
        <StackedCards/>
      </div>
    </section>
  );
}

function StackedCards() {
  const cards = [
    { rotate:-8, x:-30, y:40, kind:'dose' },
    { rotate:0,  x:60,  y:0,  kind:'med' },
    { rotate:7,  x:130, y:80, kind:'history' },
  ];
  return (
    <div style={{position:'relative', width:'100%', height:'100%'}}>
      {cards.map((c, i) => (
        <div key={i} style={{
          position:'absolute', left:`${c.x}px`, top:`${c.y}px`,
          width:300, transform:`rotate(${c.rotate}deg)`,
          transition:'transform 320ms cubic-bezier(0.2,0,0,1)',
          filter:'drop-shadow(0 20px 40px rgba(11,30,29,0.18))'
        }}>
          {c.kind==='dose' && <HeroDoseCard/>}
          {c.kind==='med' && <HeroMedCard/>}
          {c.kind==='history' && <HeroHistoryCard/>}
        </div>
      ))}
    </div>
  );
}

function HeroDoseCard() {
  return (
    <div style={{background:'#FFFFFF', borderRadius:24, padding:24, border:'1px solid rgba(11,30,29,0.06)'}}>
      <div className="eyebrow" style={{marginBottom:8}}>Children's Tylenol</div>
      <div style={{fontFamily:'var(--font-display)', fontSize:14, color:'var(--fg-3)', marginBottom:18}}>For Maya · 48 lb</div>
      <div style={{textAlign:'center', padding:'20px 0', background:'var(--mint-100)', borderRadius:16, marginBottom:14}}>
        <div className="eyebrow">Your dose</div>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'center', gap:4, marginTop:6}}>
          <span className="dose-numeral" style={{fontSize:64}}>5</span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:18, color:'var(--fg-2)'}}>mL</span>
        </div>
        <div style={{fontSize:12, color:'var(--fg-2)', marginTop:4}}>≈ 280 mg</div>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--fg-2)'}}>
        <span>Every 4 hours</span><span>Max 5 / 24h</span>
      </div>
    </div>
  );
}
function HeroMedCard() {
  return (
    <div style={{background:'#FFFFFF', borderRadius:24, padding:20, border:'1px solid rgba(11,30,29,0.06)'}}>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {[
          ['Children\'s Tylenol','Acetaminophen','#E8F5F1','var(--teal-700)','thermo'],
          ['Children\'s Motrin','Ibuprofen','#FCEBD2','var(--amber-700)','pill'],
          ['Children\'s Benadryl','Diphenhydramine','rgba(159,217,205,0.4)','var(--teal-700)','droplet'],
        ].map(([name, gen, tint, ic, icn], i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 8px', borderRadius:12}}>
            <div style={{width:36, height:36, borderRadius:10, background:tint, display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Icon name={icn} size={18} color={ic}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, lineHeight:1.2}}>{name}</div>
              <div style={{fontSize:11, color:'var(--fg-3)'}}>{gen}</div>
            </div>
            <Icon name="chevronRight" size={16} color="var(--fg-3)"/>
          </div>
        ))}
      </div>
    </div>
  );
}
function HeroHistoryCard() {
  return (
    <div style={{background:'#FFFFFF', borderRadius:24, padding:20, border:'1px solid rgba(11,30,29,0.06)'}}>
      <div className="eyebrow" style={{marginBottom:12}}>Today</div>
      {[
        ['Tylenol · 5 mL','2:14 AM','var(--sage-600)'],
        ['Motrin · 4 mL','10:08 PM','var(--amber-600)'],
        ['Tylenol · 5 mL','6:30 PM','var(--sage-600)'],
      ].map(([t,when,c], i)=>(
        <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderTop: i?'1px solid rgba(11,30,29,0.06)':'none'}}>
          <div style={{width:6, height:6, borderRadius:'50%', background:c}}/>
          <span style={{fontSize:13, fontWeight:500, flex:1}}>{t}</span>
          <span style={{fontSize:11, color:'var(--fg-3)', fontFamily:'var(--font-mono)'}}>{when}</span>
        </div>
      ))}
    </div>
  );
}

function FeatureGrid() {
  const features = [
    { icon:'weight', title:'Weight-based', body:'Doses tailored to your child\'s actual weight, not a guess from age.' },
    { icon:'clock',  title:'Track every dose', body:'See what you\'ve given and when. Never wonder if you can give the next one.' },
    { icon:'baby',   title:'Multiple kids', body:'Switch between profiles in a tap. Each kid has their own dose history.' },
    { icon:'moon',   title:'Built for nighttime', body:'Warm dark mode that won\'t scorch your eyes when the lights are off.' },
    { icon:'shield', title:'Pediatrician-reviewed', body:'All doses cross-reference current AAP guidelines.' },
    { icon:'bell',   title:'Gentle reminders', body:'Optional nudges when the next dose is safe to give.' },
  ];
  return (
    <section style={{padding:'96px 32px', maxWidth:1240, margin:'0 auto'}}>
      <div style={{maxWidth:680, marginBottom:56}}>
        <div className="eyebrow" style={{marginBottom:14}}>Why CloseDose</div>
        <h2 className="title" style={{fontSize:48, color:'var(--teal-950)'}}>The calmest two minutes of your night.</h2>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20}}>
        {features.map((f, i) => (
          <div key={i} className="card" style={{padding:'28px 24px', display:'flex', flexDirection:'column', gap:14}}>
            <div style={{
              width:44, height:44, borderRadius:12,
              background:'var(--bg-tint)', color:'var(--brand)',
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              <Icon name={f.icon} size={22} stroke={2}/>
            </div>
            <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, color:'var(--fg)', letterSpacing:'-0.01em'}}>{f.title}</div>
            <div style={{fontSize:15, lineHeight:1.55, color:'var(--fg-2)'}}>{f.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{padding:'0 32px 96px'}}>
      <div style={{
        maxWidth:1100, margin:'0 auto',
        background:'linear-gradient(135deg, var(--teal-700) 0%, var(--teal-800) 100%)',
        borderRadius:32, padding:'64px 56px',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap'
      }}>
        <div style={{maxWidth:560}}>
          <div className="eyebrow" style={{color:'var(--mint-200)', marginBottom:14}}>Free to use</div>
          <h2 className="title" style={{fontSize:44, marginBottom:16, color:'#fff'}}>Open CloseDose. Then put your phone down.</h2>
          <p style={{fontSize:17, lineHeight:1.55, color:'rgba(255,255,255,0.85)'}}>It takes about 30 seconds. We'll be here when you need us again.</p>
        </div>
        <button className="btn btn-lg" style={{
          background:'#FFFFFF', color:'var(--teal-800)', width:'auto', padding:'18px 28px', fontSize:17
        }}>
          Open the app <Icon name="arrowRight" size={18}/>
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop:'1px solid var(--hairline)', padding:'40px 32px 56px',
      maxWidth:1240, margin:'0 auto',
      display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <img src="../../assets/logo-mark.svg" alt="" style={{height:24}}/>
        <span style={{fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'var(--teal-900)'}}>closedose</span>
        <span style={{fontSize:12, color:'var(--fg-3)', marginLeft:12}}>© 2026</span>
      </div>
      <div style={{fontSize:12, color:'var(--fg-3)', maxWidth:560, textAlign:'right'}}>
        Always confirm dosing before administering medication. CloseDose provides dosing information for common over-the-counter medications for generally healthy children. Not a substitute for medical advice.
      </div>
    </footer>
  );
}

window.Header = Header;
window.Hero = Hero;
window.FeatureGrid = FeatureGrid;
window.CTA = CTA;
window.Footer = Footer;
