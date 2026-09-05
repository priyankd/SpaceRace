'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, BookOpen, Flag, Pause, Play, RotateCcw, Rocket, Zap, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { createState, step, recover, clock, LEVELS, getLevel, bestKey } from '../game/engine.mjs';
import { render } from '../game/render.mjs';
import { preloadSprites } from '../game/sprites.mjs';
import { SOLAR_STOPS, tourIndex } from '../game/solar-tour.mjs';
import { createRaceAudio } from '../game/audio.mjs';

type Inputs = {left:boolean;right:boolean;accelerate:boolean;boost:boolean;rise:boolean;descend:boolean};
const emptyInput=():Inputs=>({left:false,right:false,accelerate:false,boost:false,rise:false,descend:false});
const readBest=(id:string)=>{try{const n=Number(localStorage.getItem(bestKey(id)));return n>0&&Number.isFinite(n)?n:null;}catch{return null;}};
export default function Home(){
 const canvas=useRef<HTMLCanvasElement>(null), state=useRef(createState()), input=useRef(emptyInput());
 const [view,setView]=useState(createState()),[journal,setJournal]=useState(false),[best,setBest]=useState<number|null>(null);
 const [worlds,setWorlds]=useState(false);
 const [soundOn,setSoundOn]=useState(true);
 const audio=useRef<ReturnType<typeof createRaceAudio>|null>(null);
 const worldsRef=useRef(false),resumeWorlds=useRef(false);
 const journalRef=useRef(false),resumeJournal=useRef(false);
 const sync=()=>setView({...state.current,found:[...state.current.found]});
 const start=()=>{audio.current?.unlock();state.current=createState(state.current.levelId);state.current.mode='racing';input.current=emptyInput();sync();};
 const chooseLevel=(id:string)=>{state.current=createState(id);input.current=emptyInput();setBest(readBest(id));resumeWorlds.current=false;worldsRef.current=false;setWorlds(false);sync();};
 const openWorlds=(open:boolean)=>{if(open)audio.current?.silence();if(open){resumeWorlds.current=state.current.mode==='racing';if(resumeWorlds.current)state.current.mode='paused';input.current=emptyInput();}else if(resumeWorlds.current){state.current.mode='racing';resumeWorlds.current=false;}worldsRef.current=open;setWorlds(open);sync();};
 const pause=()=>{audio.current?.silence();if(state.current.mode==='racing'){state.current.mode='paused';input.current=emptyInput();}else if(state.current.mode==='paused')state.current.mode='racing';sync();};
 const openJournal=(open:boolean)=>{if(open)audio.current?.silence();if(open){resumeJournal.current=state.current.mode==='racing';if(resumeJournal.current)state.current.mode='paused';input.current=emptyInput();}else if(resumeJournal.current){state.current.mode='racing';resumeJournal.current=false;}journalRef.current=open;setJournal(open);sync();};
 useEffect(()=>{
  audio.current=createRaceAudio();
  preloadSprites();
  setBest(readBest(state.current.levelId));
  let id=0,last=0,paint=0;
  const frame=(now:number)=>{const dt=last?(now-last)/1000:0;last=now;const before=state.current.mode;step(state.current,input.current,dt);if(canvas.current)render(canvas.current,state.current);audio.current?.update(state.current);
   if(before==='racing'&&state.current.mode==='finished'){const t=state.current.time;setBest(b=>{const value=b===null? t:Math.min(b,t);try{localStorage.setItem(bestKey(state.current.levelId),String(value));}catch{}return value;});}
   if(now-paint>70){sync();paint=now;}id=requestAnimationFrame(frame);
  };id=requestAnimationFrame(frame);
  const keys:Record<string,keyof Inputs>={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'rise',w:'accelerate',W:'accelerate',ArrowDown:'descend',' ':'boost',Shift:'boost',q:'rise',Q:'rise',e:'descend',E:'descend'};
  const down=(e:KeyboardEvent)=>{if(journalRef.current||worldsRef.current)return;if(e.target instanceof HTMLElement&&['INPUT','TEXTAREA','BUTTON','A'].includes(e.target.tagName)&&e.key===' ')return;
   if(keys[e.key]){if(state.current.mode==='racing')audio.current?.unlock();e.preventDefault();input.current[keys[e.key]]=true;}
   if(!e.repeat&&(e.key==='Escape'||e.key.toLowerCase()==='p'))pause();
   if(!e.repeat&&e.key.toLowerCase()==='r'&&state.current.mode==='racing'){recover(state.current);sync();}
  };
  const up=(e:KeyboardEvent)=>{if(keys[e.key])input.current[keys[e.key]]=false;};
  const blur=()=>{audio.current?.silence();input.current=emptyInput();if(state.current.mode==='racing'){state.current.mode='paused';sync();}};
  const visibility=()=>{if(document.hidden)blur();};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  // Optional browser agent controls use the same actions as the visible interface.
  const lifecycle=new AbortController();
  const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:unknown)=>unknown}}).modelContext;
  if(context?.registerTool){try{Promise.resolve(context.registerTool({name:'start_selected_race',description:'Start or restart the currently selected world race.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:(v:unknown)=>{if(!v||typeof v!=='object'||Object.keys(v).length)throw new Error('Expected empty object');if(journalRef.current||worldsRef.current)throw new Error('Close the open dialog first');start();return {mode:state.current.mode};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  return()=>{audio.current?.close();cancelAnimationFrame(id);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);lifecycle.abort();};
 },[]);
 const touch=(key:keyof Inputs)=>({onPointerDown:(e:React.PointerEvent<HTMLButtonElement>)=>{audio.current?.unlock();e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);input.current[key]=true;},onPointerUp:()=>{input.current[key]=false;},onPointerCancel:()=>{input.current[key]=false;},onLostPointerCapture:()=>{input.current[key]=false;}});
 const level=getLevel(view.levelId),levelIndex=LEVELS.findIndex(item=>item.id===level.id);
 const stopIndex=tourIndex(view.z,level.length);
 const racing=view.mode==='racing',briefing=view.mode==='briefing',finished=view.mode==='finished';
 return <main className="shell">
  <header className="topbar"><a className="brand" href="/" aria-label="Space Race home"><Rocket size={24}/><span>SPACE<span className="light">RACE</span></span></a><div className="mission-tag"><span className="status-dot"/> {level.world.toUpperCase()} <span className="tag-number">{level.number}</span></div><button className="quiet sound-button" aria-label={soundOn?'Mute sound effects':'Enable sound effects'} aria-pressed={soundOn} onClick={()=>{const enabled=!soundOn;setSoundOn(enabled);audio.current?.setEnabled(enabled);}}>{soundOn?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="quiet" onClick={()=>openWorlds(true)}><Rocket size={18}/> Levels</button><button className="quiet" onClick={()=>openJournal(true)}><BookOpen size={18}/><span>Field journal</span><span className="count">{view.found.length}/3</span></button></header>
  <section className="game" aria-label={`${level.name} racing game`}>
   <canvas ref={canvas} className="race-canvas" aria-label="Airborne space race. Use arrows to steer and change height. Hold W to accelerate and release W to brake. Space boosts. Obstacles are rocks, moving asteroids and timed laser gates."/>
   <div className="location"><span className="eyebrow">{level.world.toUpperCase()} / SECTOR {level.number}</span><h1>{level.name}<span>.</span></h1><span className="coordinates">FICTIONAL COURSE · REAL DISCOVERIES</span></div>
   {!briefing&&<div className="race-top"><div className="time"><span className="eyebrow">RACE TIME</span><strong>{clock(view.time)}</strong></div><button className="icon-button" aria-label={racing?'Pause race':'Resume race'} onClick={pause} disabled={finished}>{racing?<Pause/>:<Play/>}</button></div>}
   {briefing&&<div className="briefing panel"><div className="eyebrow mint"><span className="status-dot"/> READY FOR LAUNCH</div><h2>{level.tag}<br/>Ready to fly?</h2><p>{level.description}</p><div className="briefing-route"><span>01 <b>Find your wings</b></span><span>02 <b>Fly & discover</b></span><span>03 <b>Race to the beacon</b></span></div><button className="quiet level-switch" onClick={()=>openWorlds(true)}>Choose a different world <ArrowRight size={16}/></button><button className="primary" onClick={start}>Let’s race <ArrowRight size={21}/></button><small>No checkpoints. Collisions slow you down, then keep flying.</small></div>}
   {view.mode==='paused'&&!journal&&!worlds&&<div className="center-overlay"><div className="panel pause-panel"><span className="eyebrow mint">TAKE A BREATHER</span><h2>Parked among the stars.</h2><p>Your race is paused. Ready when you are.</p><button className="primary" onClick={pause}>Keep racing <Play size={18}/></button><button className="quiet" onClick={start}><RotateCcw size={17}/> Start over</button></div></div>}
   {finished&&<div className="center-overlay"><div className="panel finish-panel"><div className="medal"><Flag size={32}/></div><span className="eyebrow mint">MISSION COMPLETE</span><h2>{level.world} explorer!</h2><p>You crossed the finish line. Your explorer badge is earned.</p><div className="results"><div><strong>{clock(view.time)}</strong><span>Your time</span></div><div><strong>{SOLAR_STOPS.filter((item,i)=>i<=stopIndex&&item.name!=='Asteroid belt').length}/8</strong><span>Planets passed</span></div><div><strong>{view.found.length}/3</strong><span>Discoveries</span></div></div><p className="best">Personal best · {clock(best??view.time)}</p>{levelIndex<LEVELS.length-1&&<button className="primary next-level" onClick={()=>chooseLevel(LEVELS[levelIndex+1].id)}>Next: {LEVELS[levelIndex+1].name} <ArrowRight size={18}/></button>}<button className={levelIndex<LEVELS.length-1?'quiet':'primary'} onClick={start}>Race again <RotateCcw size={18}/></button><button className="quiet" onClick={()=>openJournal(true)}><BookOpen size={18}/> Explore your journal</button></div></div>}
   {!briefing&&<aside className="solar-tour" aria-label="Solar system flyby, in order from the Sun"><span className="eyebrow">FROM THE SUN</span><ol>{SOLAR_STOPS.map((item,i)=><li key={item.name} aria-current={i===stopIndex?'step':undefined} className={i<stopIndex?'passed':''}><span className="tour-dot" style={{background:item.color}}/>{item.name}<span className="tour-mark">{i<stopIndex?'✓':i===stopIndex?'◂':''}</span></li>)}</ol><small>Flyby · not to scale</small></aside>}
   {!briefing&&<div className="dashboard"><div className="speed"><strong>{Math.round(view.speed*.65)}</strong><span>KM/H</span></div><div className="journey"><div><span>{view.z<2000?'Practice airspace':view.z<6000?level.sections[0]:view.z<12000?level.sections[1]:view.z<16000?level.sections[2]:view.z<24000?level.sections[3]:view.z<29000?'Final gauntlet':'Home stretch'}</span><span>{Math.floor(view.z/level.length*100)}%</span></div><Progress value={view.z/level.length*100} aria-label="Course completion"/></div><div className="boost-meter"><div><Zap size={16}/><span>BOOST</span><span>{Math.round(view.boost)}%</span></div><Progress value={view.boost} aria-label="Boost energy"/></div></div>}
   {briefing&&<div className="world-note"><span className="orbit-symbol">◌</span><div><strong>{level.stat}</strong><span>{level.statLabel}</span></div></div>}
  </section>
  <footer className="controls"><div className="control-group"><span><kbd>W</kbd> Hold to accelerate · release to brake</span><span><kbd>A</kbd><kbd>D</kbd> Steer</span><span><kbd>↑</kbd> Rise <kbd>↓</kbd> Descend</span><span><kbd>SPACE</kbd> Boost</span></div><div className="control-group"><button className="quiet" disabled={!racing} onClick={()=>{recover(state.current);sync();}}><RotateCcw size={15}/> Recenter <kbd>R</kbd></button><span><kbd>P</kbd> Pause</span></div></footer>
  <div className="touch-controls" aria-label="Touch driving controls"><button aria-label="Steer left" {...touch('left')}><ArrowLeft/></button><button aria-label="Steer right" {...touch('right')}><ArrowRight/></button><button aria-label="Rise" {...touch('rise')}><ArrowUp/> Rise</button><button aria-label="Descend" {...touch('descend')}><ArrowDown/> Down</button><button className="touch-go" aria-label="Accelerate" {...touch('accelerate')}><Rocket size={18}/> Hold to go</button><button className="touch-boost" {...touch('boost')}><Zap/> Boost</button></div>
  <div className="underbar"><span>THE EXPLORER SERIES <span className="under-dot">·</span> {level.name.toUpperCase()}</span><span>Fictional flight & cockpit sounds. Solar-system order inspired by NASA.</span></div>
  <Dialog open={journal} onOpenChange={openJournal}><DialogContent className="journal-dialog"><DialogTitle className="journal-title">Your field journal</DialogTitle><DialogDescription>Discoveries from the flight. Reading is always optional.</DialogDescription><div className="journal-cards">{level.facts.map((f:{title:string;text:string},i:number)=><article key={f.title}><span className="eyebrow">FIELD NOTE 0{i+1} {view.found.includes(i)?'· DISCOVERED':'· PREVIEW'}</span><h3>{f.title}</h3><p>{f.text}</p></article>)}</div><p className="fiction-note">Our boost engines, hover pods, laser gates and recovery shields are invented for play. The solar flyby starts at the Sun, follows the eight planets in order with the asteroid belt between Mars and Jupiter, and ends at the dwarf planet Pluto. Sizes, spacing and travel times are compressed for play. Sound effects are fictional cockpit feedback; sound does not travel through the vacuum of space.</p><a href={level.source} target="_blank" rel="noreferrer">Explore {level.world} with NASA ↗</a></DialogContent></Dialog>
 <Dialog open={worlds} onOpenChange={openWorlds}><DialogContent className="journal-dialog"><DialogTitle className="journal-title">Choose your destination</DialogTitle><DialogDescription>Stay inside the flight boxes. Every level is ready to play. Choosing one starts a fresh run there.</DialogDescription><div className="world-grid">{LEVELS.map(item=><button key={item.id} className="world-card" aria-pressed={item.id===level.id} onClick={()=>chooseLevel(item.id)} style={{borderColor:item.accent}}><span className="eyebrow">LEVEL {item.number} · {item.world}</span><strong>{item.name}</strong><span>{item.tag} · {item.obstacles.length} obstacles</span><p>{item.description}</p><b>Explore <ArrowRight size={16}/></b></button>)}</div></DialogContent></Dialog>
 </main>;
}
