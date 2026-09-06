import test from 'node:test';
import assert from 'node:assert/strict';
import {createPopMusic,popArrangement} from '../game/music.mjs';
test('music schedules a bounded loop only while playing and stops voices on pause',()=>{
 const voices=[];
 const parameter=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
 const ctx={currentTime:0,createGain:()=>({gain:parameter(),connect(){},disconnect(){}}),createOscillator(){const voice={frequency:parameter(),connect(){},disconnect(){},start(at){this.at=at;},stop(at){if(at===undefined)this.cancelled=true;}};voices.push(voice);return voice;}};
 const music=createPopMusic(ctx,{});music.update(false);assert.equal(voices.length,0);
 music.update(true);assert(voices.length>4);const initial=voices.length;
 music.update(true);assert.equal(voices.length,initial);
 ctx.currentTime=.25;music.update(true);assert(voices.length>initial);
 music.update(false);assert(voices.every(v=>v.cancelled));
 const stopped=voices.length;ctx.currentTime=100;music.update(false);assert.equal(voices.length,stopped);
 music.update(true);assert(voices.length-stopped<15);assert(voices.slice(stopped).every(v=>v.at>=100));
 music.stop();assert(voices.every(v=>v.cancelled));
});

test('pop playlist plays three distinct arrangements with changing sections',()=>{
 for(let track=0;track<3;track++){
  const start=track*24*8;
  assert.equal(popArrangement(start).trackIndex,track);
  assert.equal(popArrangement(start).section,'verse');
  assert.equal(popArrangement(start+8*8).section,'chorus');
  assert.equal(popArrangement(start+16*8).section,'breakdown');
  assert.equal(popArrangement(start+20*8).section,'finale');
 }
 assert.equal(popArrangement(3*24*8).trackIndex,0);
});
