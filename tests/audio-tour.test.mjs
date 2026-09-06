import test from 'node:test';
import assert from 'node:assert/strict';
import {createRaceAudio} from '../game/audio.mjs';
import {SOLAR_STOPS,tourIndex} from '../game/solar-tour.mjs';
import {createState,LENGTH} from '../game/engine.mjs';
test('solar flyby includes the Sun, eight planets, asteroid belt and Pluto in order',()=>{
 assert.deepEqual(SOLAR_STOPS.map(s=>s.name),['Sun','Mercury','Venus','Earth','Mars','Asteroid belt','Jupiter','Saturn','Uranus','Neptune','Pluto']);
 for(let i=0;i<SOLAR_STOPS.length;i++)assert.equal(tourIndex((i+.1)*LENGTH/SOLAR_STOPS.length,LENGTH),i);
 assert.equal(tourIndex(LENGTH,LENGTH),10);assert.equal(tourIndex(0,LENGTH),0);
});
test('audio needs a gesture, plays race events, mutes and releases its context',()=>{
 const log=[];const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(value){log.push(['target',value]);}});
 class Context{
  currentTime=0;state='suspended';destination={};
  constructor(){log.push(['context']);}
  createGain(){return {gain:param(),connect(){}};}
  createBiquadFilter(){return {frequency:param(),connect(){}};}
  createOscillator(){log.push(['oscillator']);return {frequency:param(),connect(){},start(){},stop(){}};}
  resume(){this.state='running';log.push(['resume']);return Promise.resolve();}
  close(){log.push(['close']);return Promise.resolve();}
 }
 globalThis.AudioContext=Context;
 const sound=createRaceAudio(),s=Object.assign(createState(),{mode:'racing'});
 sound.update(s);assert.equal(log.length,0);
 sound.unlock();assert(log.some(e=>e[0]==='resume'));
 sound.update(s);const before=log.filter(e=>e[0]==='oscillator').length;
 Object.assign(s,{time:1,speed:900,boosting:true});sound.update(s);
 s.recoveries++;s.time=2;s.boosting=false;sound.update(s);
 s.mode='gameover';sound.update(s);
 s.mode='finished';sound.update(s);
 assert(log.filter(e=>e[0]==='oscillator').length>=before+6);
 sound.setEnabled(false);const muted=log.filter(e=>e[0]==='oscillator').length;
 s.mode='racing';s.recoveries++;sound.update(s);assert.equal(log.filter(e=>e[0]==='oscillator').length,muted);assert(log.some(e=>e[0]==='target'&&e[1]===0));
 sound.close();assert(log.some(e=>e[0]==='close'));delete globalThis.AudioContext;
});
test('unsupported audio does not block gameplay',()=>{const sound=createRaceAudio();assert.doesNotThrow(()=>{sound.unlock();sound.update(createState());sound.setEnabled(false);sound.close();});});
