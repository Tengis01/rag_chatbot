// Run through the production Nginx from the API container; no Gemini calls.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import http from 'node:http';
const db = new pg.Pool({connectionString: process.env.DATABASE_URL});
const base = 'http://web:8080';
const origin = 'https://ragchatbot.dev';
const ids = [];
async function request(path, {body, cookie, requestOrigin=origin, method=body?'POST':'GET'}={}) {
  // Node fetch may overwrite Host; use http.request for an explicit virtual-host probe.
  const req = new Request(base+path, {method, headers:{host:'api.ragchatbot.dev',origin:requestOrigin,...(cookie?{cookie}:{}),...(body && !(body instanceof FormData)?{'content-type':'application/json'}:{})},body:body instanceof FormData?body:body?JSON.stringify(body):undefined});
  const bytes=Buffer.from(await req.arrayBuffer());
  return new Promise((resolve,reject) => {
    const wire=http.request(req.url,{method,headers:{...Object.fromEntries(req.headers),'content-length':bytes.length}},res=>{
      const chunks=[]; res.on('data',c=>chunks.push(c)); res.on('error',reject);
      res.on('end',()=>{
        const headers=new Headers();
        for(let i=0;i<res.rawHeaders.length;i+=2) headers.append(res.rawHeaders[i],res.rawHeaders[i+1]);
        resolve(new Response(Buffer.concat(chunks),{status:res.statusCode,headers}));
      });
    });
    wire.on('error',reject); wire.setTimeout(15000,()=>wire.destroy(new Error('Smoke request timeout'))); wire.end(bytes);
  });
}
async function signup() {
  const r=await request('/api/auth/sign-up/email', {body:{name:'Deployment verification',email:`deploy-${randomUUID()}@example.invalid`,password:randomUUID()}});
  assert.equal(r.status,200,'sign-up');
  const data=await r.json(); ids.push(data.user.id);
  const cookies=r.headers.getSetCookie();
  assert.ok(cookies.some(v=>/httponly/i.test(v)&&/secure/i.test(v)), 'secure HttpOnly cookie');
  return {id:data.user.id,cookie:cookies.map(c=>c.split(';')[0]).join('; ')};
}
try {
  const health=await request('/health');assert.equal(health.status,200); assert.equal((await health.json()).ok,true);
  const config=await request('/config');assert.equal((await config.json()).maxUploadSizeMb,20);
  assert.equal((await request('/documents')).status,401);
  const blocked=await request('/api/auth/sign-up/email',{requestOrigin:'https://untrusted.example',body:{name:'Bad origin',email:'not-created@example.invalid',password:randomUUID()}});
  assert.equal(blocked.status,403);
  const cors=await request('/config',{requestOrigin:'https://untrusted.example'});
  assert.notEqual(cors.headers.get('access-control-allow-origin'),'https://untrusted.example');
  const one=await signup(), two=await signup();
  assert.ok((await (await request('/api/auth/get-session',{cookie:one.cookie})).json()).user);
  const documentId=randomUUID();
  await db.query("INSERT INTO documents(id,user_id,filename,source_type,status) VALUES($1,$2,'Synthetic isolation fixture','text','ready')",[documentId,one.id]);
  const owned=await (await request('/documents',{cookie:one.cookie})).json(); assert.ok(owned.some(d=>d.id===documentId));
  const other=await (await request('/documents',{cookie:two.cookie})).json(); assert.ok(!other.some(d=>d.id===documentId));
  assert.equal((await request(`/documents/${documentId}/status`,{cookie:two.cookie})).status,403);
  assert.equal((await request('/chat',{cookie:two.cookie,body:{documentIds:[documentId],message:'Must be denied before any Gemini request'}})).status,400);
  const oversized=new FormData(); oversized.set('file',new Blob([new Uint8Array(20*1024*1024+1)],{type:'application/pdf'}),'large.pdf');
  assert.equal((await request('/documents/upload',{cookie:one.cookie,body:oversized})).status,413);
  const malformed=new FormData(); malformed.set('file',new Blob(['Not a PDF'],{type:'application/pdf'}),'invalid.pdf');
  assert.equal((await request('/documents/upload',{cookie:one.cookie,body:malformed})).status,422);
  const final=await (await request('/health')).json(); assert.equal(final.activeIngestion,0); assert.equal(final.activeChats,0);
  console.log('PASS: Nginx/API health, config, auth/cookies, hostile origin, user isolation, upload 413, malformed PDF 422, admission cleanup. No Gemini calls.');
} finally {
  for(const id of ids) {
    await db.query('DELETE FROM documents WHERE user_id=$1',[id]);
    await db.query('DELETE FROM "user" WHERE id=$1',[id]);
  }
  await db.end();
}
