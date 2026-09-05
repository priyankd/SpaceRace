import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,step,recover,LEVELS,getLevel,bestKey,coursePose,flightBounds,LENGTH,OBSTACLES,obstacleX,laserOn} from '../game/engine.mjs';
const race=()=>Object.assign(createState(),{mode:'racing'});
const tick=(s,input,n=60)=>{for(let i=0;i<n;i++)step(s,input,1/60);};
test('briefing and pause freeze all race physics',()=>{const s=createState();tick(s,{accelerate:true});assert.equal(s.z,0);s.mode='paused';tick(s,{accelerate:true});assert.equal(s.time,0);});
test('releasing the accelerator brakes to a stop and recharges boost',()=>{const s=race();tick(s,{accelerate:true},120);assert.equal(s.speed,630);tick(s,{accelerate:true,boost:true},120);assert.equal(s.speed,930);assert(s.boost<50);tick(s,{},120);assert.equal(s.speed,0);assert(s.boost>50);});
test('box walls stop sideways movement without a recovery',()=>{const s=race();tick(s,{right:true},180);assert.equal(s.x,flightBounds(s.z).maxX);tick(s,{left:true},360);assert.equal(s.x,flightBounds(s.z).minX);assert.equal(s.recoveries,0);});
test('car stays in flight through former ramp locations',()=>{const s=race();s.z=1349;s.speed=150;tick(s,{accelerate:true});assert.equal(s.y,8);assert.equal(s.vy,0);assert.equal(s.jumps,0);assert(s.z>1350);});
test('floating rock collisions recover and shields protect the car',()=>{const s=race();Object.assign(s,{z:2799,x:-.48,speed:150});step(s,{accelerate:true},.02);assert.equal(s.recoveries,1);assert(s.z>=2800);assert(s.speed<=100);Object.assign(s,{z:2799,x:-.48,speed:150,invincible:1});step(s,{accelerate:true},.02);assert.equal(s.recoveries,1);});
test('a laser cannot be bypassed outside its box',()=>{const s=race();Object.assign(s,{z:5699,x:1.4,speed:150});step(s,{accelerate:true},.02);assert.equal(s.recoveries,1);});
test('laser collision matches its visible timed state',()=>{for(const [time,hit] of [[0,true],[1.5,true],[1.7,false],[4,false]]){const s=race();Object.assign(s,{z:5699,speed:150,time});step(s,{accelerate:true},.02);assert.equal(s.recoveries,Number(hit));}});
test('discoveries do not gate completion, finish freezes and replay resets',()=>{const s=race();s.z=LENGTH-1;s.speed=200;step(s,{accelerate:true},.02);assert.equal(s.mode,'finished');const t=s.time;tick(s,{accelerate:true});assert.equal(s.time,t);assert.equal(createState().found.length,0);});
for(const level of LEVELS)test(`a driver can finish ${level.name} with steering and braking`,()=>{const s=Object.assign(createState(level.id),{mode:'racing'});for(let i=0;i<60*240&&s.mode==='racing';i++){
 const o=level.obstacles.find(o=>o.z>s.z&&o.z-s.z<600&&s.y-(o.y??0)>-105);let target=0,brake=false;
 if(o?.type==='laser')brake=o.z-s.z<s.speed*s.speed/(2*690)+100&&laserOn(o,s.time);
 else if(o){
  const group=level.obstacles.filter(other=>other.z===o.z&&s.y-(other.y??0)>-105);
  const safe=[-.95,-.65,0,.65,.95].filter(x=>group.every(other=>other.type==='asteroid'?Math.abs(x)>.93:Math.abs(x-obstacleX(other,s.time))>.3));
  target=safe.sort((a,b)=>Math.abs(a-s.x)-Math.abs(b-s.x))[0]??0;
  // Slow before a lane change that cannot be completed at the current speed.
  brake=Math.abs(target-s.x)>.3&&o.z-s.z<400&&s.speed>300;
 }
 step(s,{accelerate:!brake,left:s.x>target+.03,right:s.x<target-.03},1/60);
 }assert.equal(s.mode,'finished');assert.equal(s.found.length,3);assert.equal(s.jumps,0);assert(s.recoveries<8);});
test('manual recovery never erases discoveries',()=>{const s=race();s.found=[0];recover(s);assert.deepEqual(s.found,[0]);});
test('vertical controls climb, descend and hold altitude on release',()=>{const s=race();tick(s,{rise:true},30);assert(s.y>100);const altitude=s.y;tick(s,{});assert.equal(s.y,altitude);assert.equal(s.vy,0);tick(s,{descend:true},30);assert(Math.abs(s.y-8)<1e-8);tick(s,{rise:true,descend:true});assert(Math.abs(s.y-8)<1e-8);});
test('vertical flight limits and recovery keep the car in the flight envelope',()=>{const s=race();tick(s,{rise:true},300);assert.equal(s.y,flightBounds(s.z).maxY);assert.equal(s.vy,0);tick(s,{descend:true},300);assert.equal(s.y,flightBounds(s.z).minY);recover(s);assert.equal(s.y,8);assert.equal(s.vy,0);});
test('active laser boxes cannot be bypassed above or below',()=>{for(const level of LEVELS)for(const o of level.obstacles.filter(o=>o.type==='laser'))for(const y of [-1000,2000]){const s=Object.assign(createState(level.id),{mode:'racing',z:o.z-1,y,speed:150,time:(6-(o.phase??0))%6});step(s,{accelerate:true},.02);assert.equal(s.recoveries,1);}});
test('flight stays inside rising and falling boxes during a whole run',()=>{for(const level of LEVELS){const s=Object.assign(createState(level.id),{mode:'racing'});for(let i=0;i<15000&&s.mode==='racing';i++){step(s,{accelerate:true,boost:true,right:i%200<100,left:i%200>=100,rise:i%180<90,descend:i%180>=90},1/60);const b=flightBounds(s.z,level.id);assert(s.x>=b.minX&&s.x<=b.maxX);assert(s.y>=b.minY&&s.y<=b.maxY);}}});
test('levels have separate records, discoveries and race resets',()=>{
 assert.equal(new Set(LEVELS.map(l=>bestKey(l.id))).size,LEVELS.length);
 for(const level of LEVELS){const s=createState(level.id);s.mode='racing';s.z=level.length-1;s.speed=200;step(s,{accelerate:true},.02);assert.equal(s.mode,'finished');assert.equal(s.found.length,3);const replay=createState(level.id);assert.equal(replay.levelId,level.id);assert.equal(replay.z,0);assert.equal(replay.found.length,0);assert.equal(level.facts.length,3);}
 assert.equal(getLevel('invalid').id,'moon');
});

test('collisions and recentering never rewind distance or create checkpoints',()=>{const s=race();s.z=12500;s.speed=600;recover(s);assert.equal(s.z,12500);assert.equal('checkpoint' in s,false);assert.equal(s.speed,100);});

test('winding routes alternate direction and join smoothly in every world',()=>{
 for(const level of LEVELS){
  assert.equal(coursePose(0,level.id).x,0);
  const headings=Array.from({length:60},(_,i)=>coursePose(i*500,level.id).heading);
  assert(headings.some(h=>h>.5));assert(headings.some(h=>h<-.5));
  for(let z=2000;z<LENGTH;z+=2000){
   const a=coursePose(z-.01,level.id),b=coursePose(z+.01,level.id);
   assert(Math.abs(a.x-b.x)<.001);assert(Math.abs(a.heading-b.heading)<.001);
  }
  for(const gate of level.obstacles.filter(o=>o.type==='laser'))assert.equal(flightBounds(gate.z,level.id).floor,gate.y??0);
 }
 assert.notEqual(coursePose(4000,'moon').x,coursePose(4000,'saturn').x);
});
