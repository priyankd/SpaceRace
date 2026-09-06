import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {drawPlanetImage} from '../game/planet-images.mjs';
test('all supplied planet photos load and clip without changing the collision disk size',()=>{
 const sources=[],calls=[];
 globalThis.Image=class {
  complete=true;naturalWidth=0;
  set src(value){sources.push(value);const bytes=fs.readFileSync(new URL('../public'+value,import.meta.url));assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');this.naturalWidth=bytes.readUInt32BE(16);}
 };
 const ctx=new Proxy({}, {get:(_,name)=>(...args)=>{calls.push([name,...args]);for(const arg of args)if(typeof arg==='number')assert(Number.isFinite(arg));},set:()=>true});
 try{
  for(const name of ['Sun','Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'])assert(drawPlanetImage(ctx,name,200,150,85));
  assert.equal(sources.length,10);assert.equal(calls.filter(([name])=>name==='arc').length,10);
  assert.equal(calls.filter(([name,rule])=>name==='clip'&&rule==='evenodd').length,2);
  assert.equal(drawPlanetImage(ctx,'Asteroid belt',200,150,85),false);
 }finally{delete globalThis.Image;}
});
