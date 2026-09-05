import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {drawSprite,preloadSprites,asteroidNames,asteroidVariant,asteroidSize} from '../game/sprites.mjs';
import {LEVELS} from '../game/engine.mjs';
test('all generated sprites load from project assets and draw through silhouette clips',()=>{
 const sources=[];
 globalThis.Image=class {set src(value){sources.push(value);const file=fs.readFileSync(new URL('../public'+value,import.meta.url));assert.equal(file.toString('hex',0,8),'89504e470d0a1a0a');this.onload();}};
 const calls=[];
 const c=new Proxy({}, {get:(_,name)=>(...args)=>{calls.push(name);for(const arg of args)if(typeof arg==='number')assert(Number.isFinite(arg));}});
 preloadSprites();
 for(const name of ['supercar-rear',...asteroidNames])assert(drawSprite(c,name,-100,-100,200,160));
 assert.equal(sources.length,4);assert.equal(calls.filter(n=>n==='drawImage').length,4);assert.equal(calls.filter(n=>n==='clip').length,4);
 delete globalThis.Image;
});
test('every world uses three stable asteroid shapes with different dimensions',()=>{
 for(const level of LEVELS){const rocks=level.obstacles.filter(o=>o.type!=='laser');assert.equal(new Set(rocks.map(asteroidVariant)).size,3);assert.equal(new Set(rocks.map(o=>asteroidSize(o).width)).size,3);}
});
