import {getLevel,laserOn} from './engine.mjs';
import {tourIndex} from './solar-tour.mjs';
export function createRaceAudio(){
 let ctx=null,master=null,engine=null,engineGain=null,enabled=true,last=null,lastBoost=-10,finishUntil=0;
 function tone(freq,end,duration,volume=.06,delay=0){if(!ctx||!enabled)return;const at=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,at);osc.frequency.exponentialRampToValueAtTime(end,at+duration);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(master);osc.start(at);osc.stop(at+duration+.03);}
 function unlock(){
  if(!enabled)return;
  try{if(!ctx){const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;ctx=new Audio();master=ctx.createGain();master.gain.value=.6;master.connect(ctx.destination);engine=ctx.createOscillator();engine.type='triangle';engineGain=ctx.createGain();engineGain.gain.value=0;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=360;engine.connect(filter);filter.connect(engineGain);engineGain.connect(master);engine.start();}if(ctx.state==='suspended')void ctx.resume().catch(()=>{});}catch{ctx=null;}
 }
 function silence(){if(ctx&&engineGain)engineGain.gain.setTargetAtTime(0,ctx.currentTime,.025);if(ctx&&master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(0,ctx.currentTime,.025);}}
 return {
  unlock,
  setEnabled(value){enabled=value;if(value)unlock();else silence();},
  silence,
  update(s){
   const level=getLevel(s.levelId),stop=tourIndex(s.z,level.length),gate=level.obstacles.find(o=>o.type==='laser'&&o.z>s.z&&o.z-s.z<650),laser=!!gate&&laserOn(gate,s.time);
   const fresh=!last||last.levelId!==s.levelId||s.time<last.time;if(fresh){lastBoost=-10;finishUntil=0;}
   if(ctx&&enabled){const running=s.mode==='racing';master.gain.setTargetAtTime(running||ctx.currentTime<finishUntil?.6:0,ctx.currentTime,.04);engine.frequency.setTargetAtTime(42+s.speed*.1+(s.boosting?25:0),ctx.currentTime,.12);engineGain.gain.setTargetAtTime(running?.02+s.speed/930*.035:0,ctx.currentTime,.07);
    if(running&&!fresh&&s.recoveries>last.hits)tone(110,32,.28,.11);
    if(running&&s.boosting&&(!last?.boosting||fresh)&&s.time-lastBoost>.8){tone(180,720,.3,.045);lastBoost=s.time;}
    if(running&&laser&&!last?.laser)tone(470,390,.13,.035);
    if(running&&!fresh&&stop!==last.stop)tone(640,960,.2,.04);
    if(!fresh&&s.mode==='finished'&&last.mode!=='finished'){finishUntil=ctx.currentTime+1;master.gain.setTargetAtTime(.6,ctx.currentTime,.01);[523,659,784,1047].forEach((n,i)=>tone(n,n,.3,.07,i*.13));}
   }
   last={levelId:s.levelId,time:s.time,hits:s.recoveries,boosting:s.boosting,mode:s.mode,stop,laser};
  },
  close(){if(ctx)void ctx.close().catch(()=>{});ctx=null;},
 };
}
