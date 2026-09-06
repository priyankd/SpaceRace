// Three original pop instrumentals, each with a verse, chorus, breakdown and finale.
const tracks=[
 {chords:[[60,64,67],[55,59,62],[57,60,64],[53,57,60]],hooks:[[76,79,79,76,74,72,74,76],[74,79,78,74,71,74,79,74],[76,81,79,76,72,76,79,76],[77,76,72,69,72,74,76,79]]},
 {chords:[[62,66,69],[59,62,66],[55,59,62],[57,61,64]],hooks:[[78,81,78,76,74,76,78,81],[78,74,71,74,78,81,78,74],[79,78,74,71,74,78,79,81],[76,73,76,81,85,81,78,76]]},
 {chords:[[57,60,64],[53,57,60],[60,64,67],[55,59,62]],hooks:[[81,79,76,72,76,79,81,84],[81,77,76,72,69,72,76,77],[79,76,72,76,79,84,83,79],[79,74,71,74,78,79,83,86]]},
];
export function popArrangement(step){
 const bar=Math.floor(step/8),trackIndex=Math.floor(bar/24)%tracks.length,sectionBar=bar%24;
 return {trackIndex,section:sectionBar<8?'verse':sectionBar<16?'chorus':sectionBar<20?'breakdown':'finale',bar:bar%4,beat:step%8};
}
export function createPopMusic(ctx,destination){
 const bus=ctx.createGain();bus.gain.value=.5;bus.connect(destination);
 const voices=new Set();let next=0,step=0,playing=false;
 const hz=midi=>440*Math.pow(2,(midi-69)/12);
 function note(freq,at,duration,volume,type='triangle',end=freq){
  const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;
  osc.frequency.setValueAtTime(freq,at);osc.frequency.exponentialRampToValueAtTime(end,at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(gain);gain.connect(bus);voices.add(osc);
  osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};
  osc.start(at);osc.stop(at+duration+.02);
 }
 function stop(){playing=false;for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
 return {stop,update(running){
  if(!running){if(playing)stop();return;}
  if(!playing){playing=true;next=ctx.currentTime+.02;step=0;}
  if(next<ctx.currentTime-.25)next=ctx.currentTime+.02;
  while(next<ctx.currentTime+.12){
   const {trackIndex,section,bar,beat}=popArrangement(step);
   const track=tracks[trackIndex],chord=track.chords[bar],hook=track.hooks[bar];
   const chorus=section==='chorus'||section==='finale',quiet=section==='breakdown';
   // Space between verse notes makes room for a fuller chorus and a softer bridge.
   if(chorus||beat%2===0||beat===7)note(hz(hook[beat]),next,quiet?.32:.18,quiet?.025:.038);
   if(chorus&&beat%2===1)note(hz(chord[(beat+bar)%3]+12),next,.2,.018,'sine');
   if(beat%2===0){
    note(hz(chord[0]-12+(beat===6&&trackIndex===1?12:0)),next,quiet?.35:.22,.065);
    if(!quiet||beat===0)note(145,next,.15,.11,'sine',42);
   }
   if(beat===0||(!quiet&&beat===4))for(const pitch of chord)note(hz(pitch),next,quiet?.8:.43,quiet?.015:.021,'triangle');
   if(!quiet&&(beat===2||beat===6)){note(180,next,.11,.05,'triangle',70);note(1700,next,.065,.014,'square',620);}
   if(!quiet||beat%2===1)note(6200,next,.035,beat%2?.009:.005,'square',3900);
   // Short fills mark the end of a phrase, with an octave lift in the finale.
   if(chorus&&bar===3&&beat===7){note(hz(hook[beat]+(section==='finale'?12:0)),next+.125,.1,.026);note(1700,next+.125,.05,.012,'square',620);}
   next+=.25;step++;
  }
 }};
}
