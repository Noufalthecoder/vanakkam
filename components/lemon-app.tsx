'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Heart,
  Moon,
  Sparkles,
  Sun,
  Upload,
  WandSparkles,
} from 'lucide-react'

const steps = ['Occasion', 'Preferences', 'Your face', 'Your look']
const looks = [
  { title: 'Soft focus', meta: 'Everyday · Satin', tone: 'look-peach', image: 'https://images.unsplash.com/photo-1522337360788-8b13dead2a0e?auto=format&fit=crop&w=900&q=85' },
  { title: 'Golden hour', meta: 'Evening · Glowy', tone: 'look-gold', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85' },
  { title: 'Modern bride', meta: 'Bridal · Luminous', tone: 'look-rose', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85' },
]

export function LemonApp() {
  const [dark, setDark] = useState(false)
  const [activeStep, setActiveStep] = useState(2)
  const [uploaded, setUploaded] = useState(false)
  const [saved, setSaved] = useState<number[]>([])
  const [occasion, setOccasion] = useState('Everyday')

  const toggleSaved = (index: number) => setSaved((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index])

  return (
    <main className={`lemon-app ${dark ? 'dark-mode' : ''}`} id="top">
      <div className="lemon-corner lemon-corner-top" aria-hidden="true"><span /><span /><span /></div>
      <div className="lemon-corner lemon-corner-bottom" aria-hidden="true"><span /><span /><span /></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lemon home"><span className="brand-mark"><span /></span><span className="brand-name">Lemon</span></a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#discover">Discover looks</a><a href="#how-it-works">How it works</a><a href="#studio">Bridal studio</a>
          <button className="help-button" type="button" aria-label="Help"><CircleHelp size={18} /></button>
          <button className="theme-toggle" type="button" onClick={() => setDark(!dark)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
        </nav>
      </header>

      <div className="page-wrap">
        <section className="hero-grid">
          <div className="intro-row"><div className="eyebrow"><span className="eyebrow-dot" /> PERSONALIZED BEAUTY, MADE SIMPLE</div><h1>Your face.<br /><em>Your style.</em><br />Your perfect look.</h1><p className="intro-copy">A thoughtful makeup guide that starts with you — your features, your occasion, and your version of beautiful.</p><div className="hero-actions"><a className="continue-button" href="#builder">Create my look <ArrowRight size={17} /></a><a className="text-link" href="#discover">Explore looks <ArrowRight size={15} /></a></div></div>
          <div className="hero-art" aria-label="Bridal makeup inspiration"><img className="hero-bridal-image" src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=90" alt="Bride wearing an elegant makeup look" /><div className="hero-circle" /><div className="hero-card"><span className="hero-card-label">LEMON BEAUTY NOTE</span><strong>Glow softly.<br /><em>Be fully you.</em></strong><span className="hero-card-line" /></div><div className="hero-lip" /><div className="hero-caption">01 / A LOOK FOR<br />YOUR EVERYDAY</div></div>
        </section>

        <section className="builder-card" id="builder" aria-label="Personalized makeup builder">
          <aside className="progress-panel"><div><div className="progress-kicker">LET&apos;S GET STARTED</div><h2>Build your<br />signature look</h2><p>We&apos;ll guide you one easy step at a time.</p></div><div className="steps-list">{steps.map((label, index) => <button key={label} type="button" className={`step ${activeStep === index ? 'active' : ''}`} onClick={() => setActiveStep(index)}><span className="step-number">{index < activeStep ? <Check size={13} /> : `0${index + 1}`}</span><span>{label}</span>{activeStep === index && <ArrowRight size={15} />}</button>)}</div><div className="privacy-note"><span className="privacy-icon">✦</span><span>Your photos stay private<br />and are never used to train AI.</span></div></aside>
          <div className="builder-content"><div className="content-topline"><span>STEP 03 OF 04</span><span>2 MINUTES LEFT</span></div><div className="content-heading"><div><h3>Let&apos;s see you.</h3><p>A clear, front-facing photo works best. No filters needed.</p></div><WandSparkles className="heading-sparkle" size={25} /></div><button className={`upload-area ${uploaded ? 'has-upload' : ''}`} type="button" onClick={() => setUploaded(!uploaded)} aria-label={uploaded ? 'Remove uploaded face photo' : 'Upload a face photo'}><div className="upload-illustration"><div className="face-oval"><span className="eye eye-left" /><span className="eye eye-right" /><span className="nose" /><span className="smile" /></div><span className="sun-ray ray-one" /><span className="sun-ray ray-two" /></div><h4>{uploaded ? 'Photo ready to personalize' : 'Drop your photo here'}</h4><p>{uploaded ? 'Tap to choose a different photo' : 'or click to browse from your device'}</p><span className="upload-button"><Upload size={16} /> {uploaded ? 'Change photo' : 'Choose a photo'}</span><small>JPG or PNG · Max 10 MB</small></button><div className="photo-tip"><div className="tip-icon"><Sun size={17} /></div><div><strong>A little tip</strong><p>Natural daylight helps us understand your skin tone best.</p></div><ChevronDown size={17} /></div><div className="content-actions"><button className="back-button" type="button" onClick={() => setActiveStep(Math.max(0, activeStep - 1))}>Back</button><button className="continue-button" type="button" onClick={() => setActiveStep(Math.min(3, activeStep + 1))}>Continue <ArrowRight size={17} /></button></div></div>
        </section>

        <section className="occasion-section" id="discover"><div><div className="eyebrow"><span className="eyebrow-dot" /> FIND YOUR FINISH</div><h2>Made for the<br /><em>moment.</em></h2></div><div className="occasion-pills">{['Everyday', 'Bridal', 'Party', 'Festive', 'Evening'].map((item) => <button key={item} className={occasion === item ? 'selected' : ''} type="button" onClick={() => setOccasion(item)}>{item}</button>)}</div></section>
        <section className="looks-grid"><div className="section-heading"><div><span className="section-number">02 /</span><h2>Looks that feel like you.</h2></div><a className="text-link" href="#builder">View all looks <ArrowRight size={15} /></a></div><div className="look-cards">{looks.map((look, index) => <article className={`look-card ${look.tone}`} key={look.title}><div className="look-visual"><img src={look.image} alt={`${look.title} bridal makeup inspiration`} loading="lazy" /><span className="visual-shape" /><span className="visual-face" /><button type="button" className="save-button" aria-label={`Save ${look.title}`} onClick={() => toggleSaved(index)}><Heart size={17} fill={saved.includes(index) ? 'currentColor' : 'none'} /></button><span className="visual-label">0{index + 1}</span></div><div className="look-info"><div><h3>{look.title}</h3><p>{look.meta}</p></div><ArrowRight size={17} /></div></article>)}</div></section>
        <section className="how-section" id="how-it-works"><div className="how-copy"><span className="section-number">03 / THE LEMON METHOD</span><h2>Less guesswork.<br /><em>More you.</em></h2><p>From first inspiration to final brushstroke, Lemon keeps your routine personal, practical, and easy to recreate in real life.</p><a className="continue-button" href="#builder">Start your journey <ArrowRight size={17} /></a></div><div className="method-list">{['Tell us the moment', 'Choose your mood', 'See your soft preview', 'Learn every step'].map((item, index) => <div className="method-item" key={item}><span>0{index + 1}</span><strong>{item}</strong><Check size={15} /></div>)}</div></section>
        <section className="studio-banner" id="studio"><div><span className="section-number">LEMON BRIDAL STUDIO</span><h2>Your aisle-side<br /><em>beauty editor.</em></h2><p>Outfit-aware inspiration, calm tutorials, and a look that lasts from first photo to last dance.</p></div><a className="dark-button" href="#builder">Explore bridal studio <ArrowRight size={17} /></a></section>
        <section className="feature-strip"><div><span className="strip-icon"><Sparkles size={18} /></span><strong>Personalized, not prescriptive.</strong><span>Every recommendation starts with you.</span></div><div><span className="strip-icon"><Sun size={18} /></span><strong>Looks good in real life.</strong><span>Guidance for your lighting, your day.</span></div><div><span className="strip-icon"><Check size={18} /></span><strong>Always within reach.</strong><span>Options for every budget and skill level.</span></div></section>
      </div><footer><span>LEMON / YOUR PERSONALIZED MAKEUP GUIDE</span><span>Made for your good days.</span></footer>
    </main>
  )
}
