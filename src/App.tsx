import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, useIsPresent } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, Check, ChevronRight, Heart, LockKeyhole, MessageCircle, Music2, RotateCcw, Share2, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { asset, loveConfig as c, whatsappUrl } from './config/loveConfig';
import { Atmosphere } from './components/Atmosphere';
import { HeartArt } from './components/Heart';
import { Modal } from './components/Modal';
import { useRomanticAudio } from './hooks/useRomanticAudio';

type Stage = 'opening' | 'quiz' | 'interlude' | 'analysis' | 'gallery' | 'suspense' | 'countdown' | 'reveal';
const ease = [0.22, 1, 0.36, 1] as const;
const transition = { duration: 0.65, ease };
const scene = { initial: { opacity: 0, y: 22, filter: 'blur(5px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, exit: { opacity: 0, y: -15, filter: 'blur(5px)' }, transition };

function QuestionScene({ children, index }: { children: ReactNode; index: number }) {
  const present = useIsPresent();
  return <motion.div className="question-content" data-question={index} inert={!present} {...scene}>{children}</motion.div>;
}

export default function App() {
  const [stage, setStage] = useState<Stage>('opening');
  const [question, setQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [personalize, setPersonalize] = useState(false);
  const [introLine, setIntroLine] = useState(0);
  const [typed, setTyped] = useState('');
  const [interlude, setInterlude] = useState(0);
  const [count, setCount] = useState(3);
  const [nervous, setNervous] = useState(false);
  const [revealLine, setRevealLine] = useState(0);
  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState('');
  const [shareLink, setShareLink] = useState(false);
  const [lightbox, setLightbox] = useState<{src: string; alt: string; caption: string} | null>(null);
  const [taps, setTaps] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = useReducedMotion();
  const sound = useRomanticAudio();
  const q = c.questions[question];
  const chapter = stage === 'opening' ? 0 : ['quiz', 'interlude', 'analysis'].includes(stage) ? 1 : stage === 'gallery' ? 2 : stage === 'reveal' ? 4 : 3;
  const score = answers.reduce((sum, a, i) => sum + c.questions[i].choices[a].warmth, 0);
  const percentage = Math.min(100, Math.round(75 + score / (c.questions.length * 5) * 25));
  const result = score > 72 ? c.ui.resultBold : score > 55 ? c.ui.resultWarm : c.ui.resultGentle;

  useEffect(() => { document.title = c.title; }, []);
  useEffect(() => {
    if (stage !== 'opening') return;
    const line = c.opening.messages[introLine];
    if (reduced) { setTyped(line); return; }
    setTyped(''); let letter = 0;
    const typing = setInterval(() => { letter++; setTyped(line.slice(0, letter)); if (letter >= line.length) clearInterval(typing); }, 37);
    const next = setTimeout(() => setIntroLine(v => Math.min(v + 1, c.opening.messages.length - 1)), line.length * 37 + 2500);
    return () => { clearInterval(typing); clearTimeout(next); };
  }, [introLine, stage, reduced]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const focus = setTimeout(() => { if (stage !== 'opening') heading.current?.focus({ preventScroll: true }); }, 750);
    return () => clearTimeout(focus);
  }, [stage, question]);
  useEffect(() => {
    if (stage !== 'analysis') return;
    const timer = setTimeout(() => setStage('gallery'), reduced ? 600 : 2800);
    return () => clearTimeout(timer);
  }, [stage, reduced]);
  useEffect(() => {
    if (stage !== 'countdown') return;
    sound.heartbeat();
    const timer = setTimeout(() => { if (count > 1) setCount(count - 1); else { setRevealLine(0); setStage('reveal'); } }, reduced ? 650 : 1400);
    return () => clearTimeout(timer);
  }, [stage, count, reduced, sound.heartbeat]);
  useEffect(() => {
    if (stage !== 'reveal' || revealLine >= c.reveal.prelude.length) return;
    const timer = setTimeout(() => setRevealLine(n => n + 1), reduced ? 450 : 2500);
    return () => clearTimeout(timer);
  }, [stage, revealLine, reduced]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function notify(message: string) { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 4200); }
  function tapHeart() { setTaps(t => t + 1); setBurst(n => n + 1); sound.heartbeat(); notify((taps + 1) % 5 === 0 ? c.ui.easterEgg : c.ui.heartTap); }
  function start() { setName(name.trim().slice(0, 30)); setPersonalize(false); setStage('quiz'); if (c.sound.enabledByDefault && !sound.enabled) void sound.toggle(); sound.chime(); }
  function choose(index: number) { setSelected(index); setAnswers(prev => { const next = [...prev]; next[question] = index; return next; }); sound.chime(); setBurst(n => n + 1); }
  function nextQuestion() {
    const pause = c.interludes.findIndex(item => item.after === question);
    if (question === c.questions.length - 1) setStage('analysis');
    else if (pause !== -1) { setInterlude(pause); setStage('interlude'); }
    else { setQuestion(n => n + 1); setSelected(answers[question + 1] ?? null); }
  }
  function replay() { setStage('opening'); setQuestion(0); setAnswers([]); setSelected(null); setName(''); setCount(3); setRevealLine(0); setIntroLine(0); setNervous(false); setToast(''); setTaps(0); }
  async function share() {
    const data = { title: c.ui.shareTitle, text: c.ui.shareText, url: window.location.href.split('#')[0] };
    try { if (navigator.share) { await navigator.share(data); return; } }
    catch (error) { if (error instanceof Error && error.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(data.url); notify(c.ui.copied); }
    catch { setShareLink(true); }
  }
  function beginReveal(isNervous: boolean) { setNervous(isNervous); setCount(3); setStage('countdown'); }

  return <div className={`app stage-${stage}`} style={{ '--bg': c.palette.background, '--accent': c.palette.accent, '--rose': c.palette.rose, '--text': c.palette.text } as CSSProperties}>
    <div className="ambient-glow" aria-hidden="true"/><div className="grain" aria-hidden="true"/>
    <Atmosphere celebration={stage === 'reveal' && revealLine >= c.reveal.prelude.length} burst={burst}/>
    <header className="site-header">
      <a href="#" className="wordmark" onClick={e => { e.preventDefault(); if (stage === 'opening') window.scrollTo({top: 0, behavior: 'smooth'}); else replay(); }} aria-label={c.title}><Heart size={21} strokeWidth={1.6}/><span>{c.brand}<span className="wordmark-suffix">{c.brandSuffix}</span></span><span className="wordmark-dot"/></a>
      <span className="header-tagline">{c.ui.tagline}</span>
      <div className="header-actions"><button className="sound-button" aria-pressed={sound.enabled} onClick={() => void sound.toggle()}>{sound.enabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}<span>{sound.enabled ? c.ui.soundOn : c.ui.soundOff}</span>{sound.enabled && <span className="sound-bars"><i/><i/><i/></span>}</button><button className="icon-button" onClick={() => void share()} aria-label={c.ui.share}><Share2 size={17}/></button></div>
    </header>

    <main id="experience">
      <AnimatePresence mode="wait">
        {stage === 'opening' && <motion.section key="opening" className="opening" {...scene}>
          <div className="hero-layout">
            <div className="hero-copy">
              <div className="eyebrow"><span className="little-line"/>{c.opening.badge}</div>
              <h1 ref={heading} tabIndex={-1}>{c.opening.title[0]}<br/>{c.opening.title[1]}<br/><em>{c.opening.title[2]}</em><span className="title-sparkle" aria-hidden="true">✧</span></h1>
              <div className="typed-message"><span className="sr-only">{c.opening.messages.join(' ')}</span><span aria-hidden="true">{typed}<span className="typing-cursor"/></span></div>
              <p className="hero-description">{c.opening.description}</p>
              <button className="primary-button unlock-button" onClick={() => setPersonalize(true)}><LockKeyhole size={17}/>{c.opening.cta}<ArrowRight size={19}/></button>
              <p className="button-whisper"><Heart size={11}/>{c.opening.hint}</p>
              <div className="hero-meta"><span><span className="live-dot"/>{c.opening.duration}</span><span className="meta-divider"/><button onClick={() => void sound.toggle()}><Music2 size={12}/>{c.opening.soundHint}</button></div>
            </div>
            <div className="hero-art" onPointerMove={e => { if (reduced || e.pointerType !== 'mouse') return; const rect = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--parallax-x', `${(e.clientX - rect.left - rect.width / 2) * .025}px`); e.currentTarget.style.setProperty('--parallax-y', `${(e.clientY - rect.top - rect.height / 2) * .025}px`); }} onPointerLeave={e => { e.currentTarget.style.setProperty('--parallax-x', '0px'); e.currentTarget.style.setProperty('--parallax-y', '0px'); }}>
              <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
              <div className="art-label"><span className="live-dot"/>{c.opening.artLabel}</div>
              <figure className="polaroid polaroid-back"><img src={asset(c.gallery.photos[0].src)} alt={c.gallery.photos[0].alt} fetchPriority="high"/><figcaption>{c.opening.backCaption}</figcaption><span className="tape"/></figure>
              <button className="hero-heart" onClick={tapHeart} aria-label={c.ui.heartLabel}><HeartArt/><span className="heart-aura"/></button>
              <span className="art-sparkle sparkle-one">✦</span><span className="art-sparkle sparkle-two">✧</span><span className="art-sparkle sparkle-three">+</span>
              <figure className="polaroid polaroid-front"><img src={asset(c.gallery.photos[1].src)} alt={c.gallery.photos[1].alt} fetchPriority="high"/><figcaption>{c.opening.photoCaption}</figcaption><Heart className="polaroid-heart" size={25}/></figure>
              <div className="handwritten">{c.opening.handwritten}<svg viewBox="0 0 100 45" aria-hidden="true"><path d="M3 8Q50 50 93 13M74 16 94 12 86 32"/></svg></div>
              <span className="vertical-note">{c.opening.verticalNote}</span>
              <span className="art-coordinate">{c.opening.coordinate}</span>
            </div>
          </div>
          <div className="opening-bottom"><p>{c.opening.bottomNote}</p><a href="#journey" aria-label={c.ui.experience}><ArrowDown size={16}/></a><span>{c.opening.scrollLabel}</span></div>
        </motion.section>}

        {stage === 'quiz' && <motion.section className="quiz-section content-section" key="quiz" {...scene}>
          <div className="quiz-progress"><span>{c.ui.question} <b>{String(question + 1).padStart(2, '0')}</b> / {c.questions.length}</span><span>{c.ui.chapters[1]} <Heart size={13}/></span><div className="progress-track" role="progressbar" aria-label={c.ui.progressAria} aria-valuemin={0} aria-valuemax={c.questions.length} aria-valuenow={question + 1}><motion.div animate={{width: `${(question + 1) / c.questions.length * 100}%`}}/></div></div>
          <AnimatePresence mode="wait"><QuestionScene key={question} index={question}>
            <p className="eyebrow justify-center">{q.eyebrow}</p><h1 ref={heading} tabIndex={-1} className="scene-title">{q.title}</h1><p className="scene-note">{q.note}</p>
            <div className={`choices choices-${q.choices.length} ${q.choices.some(o => 'image' in o) ? 'image-choices' : ''}`}>
              {q.choices.map((option, i) => <motion.button whileHover={{y: -4}} whileTap={{scale: .98}} className={`choice ${selected === i ? 'selected' : ''}`} key={option.label} onClick={() => choose(i)} aria-pressed={selected === i}>
                {'image' in option && option.image && <img src={asset(option.image)} alt=""/>}<span className="choice-inner"><span className="choice-letter">{selected === i ? <Check size={16}/> : String.fromCharCode(65 + i)}</span><span>{option.label}</span><Heart size={16} className="choice-heart"/></span>
              </motion.button>)}
            </div>
            <div className="reaction-slot" aria-live="polite">{selected !== null ? <motion.div initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} key={selected}><p className="reaction">{q.choices[selected].reaction}</p><button className="primary-button" onClick={nextQuestion}>{question === c.questions.length - 1 ? c.ui.finishQuiz : c.ui.next}<ArrowRight size={17}/></button></motion.div> : <p className="answer-hint">{c.ui.answerHint}</p>}</div>
            {question > 0 && <button className="text-button back-button" onClick={() => { setQuestion(n => n - 1); setSelected(answers[question - 1]); }}><ArrowLeft size={14}/>{c.ui.back}</button>}
          </QuestionScene></AnimatePresence>
        </motion.section>}

        {stage === 'interlude' && <motion.section key="interlude" className="content-section centered-scene" {...scene}><Sparkles className="scene-icon" size={32}/><p className="eyebrow">{c.interludes[interlude].eyebrow}</p><h1 ref={heading} tabIndex={-1} className="scene-title italic-title">{c.interludes[interlude].title}</h1><p className="scene-note">{c.interludes[interlude].text}</p><button className="primary-button" onClick={() => { setQuestion(n => n + 1); setSelected(answers[question + 1] ?? null); setStage('quiz'); }}>{c.ui.continue}<ArrowRight size={17}/></button></motion.section>}

        {stage === 'analysis' && <motion.section key="analysis" className="content-section centered-scene" {...scene}><HeartArt className="small-heart"/><h1 ref={heading} tabIndex={-1} className="scene-title" role="status">{c.ui.analysis}</h1><div className="analysis-loader"><i/></div><p className="scene-note">{c.ui.analysisNote}</p></motion.section>}

        {stage === 'gallery' && <motion.section key="gallery" className="gallery-section content-section" {...scene}>
          <p className="eyebrow justify-center">{c.gallery.eyebrow}</p><h1 ref={heading} tabIndex={-1} className="scene-title gallery-title">{c.gallery.title.split('\n')[0]}<br/><em>{c.gallery.title.split('\n')[1]}</em></h1><p className="scene-note">{c.gallery.subtitle}</p>
          <div className="photo-world">{c.gallery.photos.map((photo, i) => <motion.button className={`gallery-polaroid photo-${i}`} key={photo.src} onClick={() => setLightbox(photo)} whileHover={{rotate: 0, y: -12}}><img src={asset(photo.src)} alt={photo.alt} loading="lazy"/><span>{photo.caption}</span></motion.button>)}</div>
          <p className="gallery-quote">“{c.gallery.lines[0]}”</p>
          {c.gallery.personalPhotos.length > 0 && <div className="personal-gallery"><p className="eyebrow justify-center">{c.gallery.personalTitle}</p><p className="scene-note">{c.gallery.personalText}</p><div className="personal-photos">{c.gallery.personalPhotos.map(photo => <button key={photo.src} onClick={() => setLightbox(photo)}><img src={asset(photo.src)} alt={photo.alt} loading="lazy"/><span>{photo.caption}</span></button>)}</div></div>}
          <div className="result-card"><Sparkles size={23}/><div><p className="eyebrow">{c.ui.resultLabel}</p><h2>{name ? `${name}, ` : ''}{result.toLowerCase()}</h2><p>{c.ui.resultText}</p><small>{c.ui.resultNote}</small></div><span className="result-score">{percentage}<small>%</small></span></div>
          <p className="scene-note gallery-ending">{c.gallery.lines[1]}</p><button className="primary-button" onClick={() => setStage('suspense')}>{c.gallery.cta}<ArrowRight size={17}/></button>
        </motion.section>}

        {stage === 'suspense' && <motion.section key="suspense" className="content-section centered-scene suspense" {...scene}>
          <div className="suspense-intro">{c.suspense.intro.map((line, i) => <motion.p key={line} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: reduced ? 0 : i * 1.1}}>{line}</motion.p>)}</div>
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: reduced ? 0 : 3.2}}><Heart className="scene-icon" size={32}/><p className="eyebrow justify-center">{c.suspense.eyebrow}</p><h1 ref={heading} tabIndex={-1} className="scene-title">{c.suspense.title}</h1><div className="suspense-actions"><button className="primary-button" onClick={() => beginReveal(false)}>{c.suspense.yes}<Heart size={17}/></button><button className="secondary-button" onClick={() => beginReveal(true)}>{c.suspense.nervous}<Sparkles size={16}/></button></div></motion.div>
        </motion.section>}

        {stage === 'countdown' && <motion.section key="countdown" className={`content-section centered-scene countdown ${nervous ? 'nervous-countdown' : ''}`} {...scene}><p className="scene-note">{nervous ? c.suspense.reassurance : c.suspense.ready}</p><AnimatePresence mode="wait"><motion.div className="count-number" key={count} initial={{opacity: 0, scale: .7}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 1.25}} transition={{duration: .5}} role="status" aria-live="polite">{count}</motion.div></AnimatePresence><Heart size={25} className="count-heart"/></motion.section>}

        {stage === 'reveal' && <motion.section key="reveal" className="content-section centered-scene reveal" {...scene}>
          {revealLine < c.reveal.prelude.length ? <AnimatePresence mode="wait"><motion.h1 className="scene-title reveal-prelude" key={revealLine} {...scene} aria-live="polite">{c.reveal.prelude[revealLine]}</motion.h1></AnimatePresence> : <motion.div className="reveal-content" initial={{opacity: 0, scale: .9}} animate={{opacity: 1, scale: 1}} transition={{duration: reduced ? 0 : 1.6, ease}}>
            <p className="eyebrow justify-center">{c.reveal.eyebrow}</p><button className="reveal-heart" onClick={tapHeart} aria-label={c.ui.heartLabel}><HeartArt/></button>
            {name && <p className="reveal-name">{name},</p>}<h1 ref={heading} tabIndex={-1} className="confession">{c.reveal.title}</h1><p className="french-line">{c.reveal.french}</p><p className="confession-message">{c.reveal.message}</p><p className="signature">{c.reveal.signature}</p>
            <a className="primary-button whatsapp-button" href={whatsappUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle size={20}/>{c.reveal.whatsappCta}<Heart size={16}/></a>
            <div className="reveal-actions"><button className="text-button" onClick={replay}><RotateCcw size={14}/>{c.ui.replay}</button><button className="text-button" onClick={() => void share()}><Share2 size={14}/>{c.ui.share}</button></div>
          </motion.div>}
        </motion.section>}
      </AnimatePresence>
    </main>

    <section id="journey" className="journey-bar" aria-label={c.ui.journeyAria}><span className="journey-label">{c.ui.journeyLabel}<br/><span>{c.ui.journeySubtitle}</span></span><ol>{c.ui.chapters.map((label, i) => <li className={i === chapter ? 'current' : i < chapter ? 'completed' : ''} key={label} aria-current={i === chapter ? 'step' : undefined}><span className="chapter-number">{i < chapter ? <Check size={12}/> : `0${i + 1}`}</span><span>{label}</span>{i < c.ui.chapters.length - 1 && <span className="chapter-line"/>}</li>)}</ol><Heart className="journey-heart" size={16}/></section>
    <footer><span>{c.ui.footer}</span><span className="footer-middle">{c.ui.private}</span><span>{c.ui.signoff} <Heart size={10}/></span></footer>
    {stage !== 'opening' && <button className="floating-heart" onClick={tapHeart} aria-label={c.ui.heartLabel}><Heart size={20}/></button>}
    <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 10}}><Heart size={16}/>{toast}<button onClick={() => setToast('')} aria-label={c.ui.close}><X size={15}/></button></motion.div>}</AnimatePresence>
    {personalize && <Modal label={c.ui.personalTitle} onClose={() => setPersonalize(false)}><div className="personalize"><Heart className="scene-icon" size={28}/><p className="eyebrow">{c.ui.personalEyebrow}</p><h2>{c.ui.personalTitle}</h2><p>{c.ui.personalNote}</p><form onSubmit={e => {e.preventDefault(); start();}}><label htmlFor="visitor-name">{c.ui.nameLabel}</label><input id="visitor-name" autoComplete="off" maxLength={30} placeholder={c.ui.namePlaceholder} value={name} onChange={e => setName(e.target.value)} autoFocus/><small><LockKeyhole size={11}/>{c.ui.personalPrivacy}</small><button type="submit" className="primary-button">{c.ui.begin}<ArrowRight size={17}/></button></form><button className="text-button" onClick={() => { setName(''); setPersonalize(false); setStage('quiz'); }}>{c.ui.skip}<ChevronRight size={14}/></button></div></Modal>}
    {shareLink && <Modal label={c.ui.share} onClose={() => setShareLink(false)}><div className="share-dialog"><Share2 size={24}/><h2>{c.ui.share}</h2><p>{c.ui.shareFallback}</p><input aria-label={c.ui.linkLabel} readOnly value={window.location.href.split('#')[0]} onFocus={e => e.currentTarget.select()}/></div></Modal>}
    {lightbox && <Modal label={lightbox.alt} onClose={() => setLightbox(null)}><figure className="lightbox"><img src={asset(lightbox.src)} alt={lightbox.alt}/><figcaption>{lightbox.caption}</figcaption></figure></Modal>}
    {!reduced && <motion.div className="first-darkness" initial={{opacity: 1}} animate={{opacity: 0}} transition={{delay: .35, duration: 1.3}} onAnimationComplete={e => { if (typeof e === 'object') document.querySelector('.first-darkness')?.setAttribute('hidden', ''); }} aria-hidden="true"><Heart size={35}/></motion.div>}
  </div>;
}
