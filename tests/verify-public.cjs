'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const source=fs.readFileSync(path.join(root,'studio-data.js'),'utf8');
const data=vm.runInNewContext(source+'\nSTUDIO_PUBLIC');
for(const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
assert.deepEqual(Array.from(data.groups,g=>g.name),['Starters','Kids','Юниоры','Mama Dance']);
assert.equal(data.groups[0].id,'starters');assert.equal(data.groups[0].alias,'Новый состав');
assert.equal(data.events.length,2);assert.equal(data.events[0].date,'2026-11-28');assert.equal(data.events[1].date,'2027-01-04');
for(const item of data.events){assert.match(item.source,/^https:\/\/t\.me\/zanasteam\/\d+$/);assert(!('contacts' in item));}
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert(sw.includes('2026-11-24-v6'));assert(sw.includes("'studio-data.js'"));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));assert.equal(manifest.start_url,'./');assert.equal(manifest.id,'./');assert.equal(manifest.scope,'./');
for(const item of manifest.icons){assert(item.src.includes('brand-mark-v2'));const bytes=fs.readFileSync(path.join(root,item.src));assert.equal(bytes.readUInt32BE(16),parseInt(item.sizes));assert.equal(bytes.readUInt32BE(20),parseInt(item.sizes));assert(sw.includes(item.src));}
assert(html.includes('./icons/brand-mark-v2-180.png'));assert(html.indexOf('src="./studio-data.js"')<html.indexOf('function createZnsModel'));
const modelCode=html.slice(html.indexOf('function createZnsModel('),html.indexOf('function escapeHtml('));
const create=vm.runInNewContext(modelCode+'\ncreateZnsModel',{location:{href:'https://buty3578.github.io/zns-demo/',protocol:'https:'},URL});
let values=JSON.parse(fs.readFileSync(path.join(__dirname,'journal-v4-fictional.json'),'utf8'));
const original=JSON.stringify(values);const storage={getItem:k=>values[k]??null,setItem:(k,v)=>{values[k]=v},removeItem:k=>{delete values[k]}};
const m=create(storage,true);assert.equal(m.attendanceStorage.restored,true);m.selectRole('teacher');
assert.equal(m.state.attendance['l1:У01'],'present');assert.equal(m.state.attendance['l1:У02'],'absent');assert.equal(m.state.attendance['l1:У03'],undefined);assert.equal(m.state.attendanceAudit.length,4);assert.equal(JSON.stringify(values),original,'opening new release must not rewrite old journal');
m.attendance('l1','У03','present');const next=create(storage,true);next.selectRole('teacher');assert.equal(next.state.attendance['l1:У03'],'present');assert.equal(next.state.attendanceAudit.length,5);
console.log('PASS: public groups/events, JS syntax, versioned icons and SW assets, stable PWA identity, v4 journal restoration and next write.');
