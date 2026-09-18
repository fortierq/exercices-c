/** Integration checks: run the same WASM compiler, worker, and suites as the browser. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mpi-c-tests-'));
const transpile=f=>ts.transpileModule(fs.readFileSync(path.join(root,f),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
try {
 fs.writeFileSync(path.join(temp,'exercises.mjs'),transpile('lib/exercises.ts'));
 fs.writeFileSync(path.join(temp,'runner.mjs'),transpile('lib/runner.ts'));
 const {exercises}=await import(path.join(temp,'exercises.mjs'));
 const {makeSuite}=await import(path.join(temp,'runner.mjs'));
 let messages=[];
 const context=vm.createContext({WebAssembly,TextEncoder,TextDecoder,Uint8Array,Uint32Array,ArrayBuffer,Response,DecompressionStream,URL,console:{log(){}},setTimeout,clearTimeout,fetch:async url=>new Response(fs.readFileSync(url)),self:{location:{href:'file://'+root+'/public/compiler/worker.js'},postMessage:m=>messages.push(m)},importScripts:()=>{}});
 vm.runInContext(fs.readFileSync(path.join(root,'public/compiler/shared.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(root,'public/compiler/worker.js'),'utf8'),context);
 async function run(exercise,code) {
  messages=[];
  await context.self.onmessage({data:{type:'run',program:makeSuite(exercise,code),count:exercise.tests.length}});
  return {results:messages.filter(m=>m.type==='result'),errors:messages.filter(m=>m.type==='error')};
 }
 let count=0;
 for(const ex of exercises) {
  const {results,errors}=await run(ex,ex.solution);
  assert.equal(errors.length,0,ex.id+': '+JSON.stringify(errors));
  assert.equal(results.length,ex.tests.length,ex.id);
  for(const r of results) {assert.equal(r.error,null,ex.id);assert.equal(r.actual,ex.tests[r.index].expected.trim(),ex.id+' test '+(r.index+1));}
  count+=results.length;
  console.log('OK',ex.id,results.length+' tests');
 }
 const ex=exercises[0];
 const wrong=await run(ex,ex.starter);
 assert(wrong.results.some(r=>r.actual!==ex.tests[r.index].expected.trim()));
 const syntax=await run(ex,'int maximum(int a,int b) { return ; this is invalid }');
 assert(syntax.errors.length>0);
 const trap=await run(ex,'int maximum(int a,int b) { __builtin_trap(); }');
 assert(trap.results.some(r=>r.error));
 const isolation={...ex,tests:[{code:'printf("%d",counter());',expected:'1'},{code:'printf("%d",counter());',expected:'1'}]};
 const fresh=await run(isolation,'int n=0; int counter(void) { return ++n; }');
 assert.equal(fresh.errors.length,0);
 assert.deepEqual(fresh.results.map(r=>r.actual),['1','1']);
 console.log(`${exercises.length} corrections, ${count} cas, réponse fausse, erreur de compilation, trap WASM et isolation : OK.`);
} finally {fs.rmSync(temp,{recursive:true,force:true});}
