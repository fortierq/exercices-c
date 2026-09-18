/* C runner. Compiler/runtime from binji/wasm-clang (Apache-2.0).
   Student programs execute only in this dedicated browser worker. */
importScripts('shared.js');
const binaries = new Map();
let busy = false;
async function readBuffer(name) {
  if (!binaries.has(name)) {
    binaries.set(name, (async () => {
      const url = new URL(name + '.bin', self.location.href);
      let response;
      try { response = await fetch(url); } catch { throw new Error('Impossible de charger ' + url.pathname + '. Réessayez après avoir vérifié votre connexion.'); }
      if (!response.ok) throw new Error('Chargement du compilateur impossible (' + response.status + ').');
      const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
      try { return await new Response(stream).arrayBuffer(); } catch(error) { throw new Error('Lecture du compilateur ' + name + ' : ' + error.message + ' (type ' + response.headers.get('content-type') + ', encodage ' + response.headers.get('content-encoding') + ').'); }
    })());
  }
  return binaries.get(name);
}
const modules = new Map();
async function compileStreaming(name) {
  if (!modules.has(name)) modules.set(name, readBuffer(name).then(b => WebAssembly.compile(b)));
  return modules.get(name);
}
function clean(s) { return s.replace(/\x1b\[[0-9;]*m/g, '').trim(); }
self.onmessage = async ({data}) => {
  if (busy || data.type !== 'run') return;
  busy = true;
  let output = '', phase = 'loading';
  const send = (type, extra={}) => self.postMessage({type, ...extra});
  try {
    send('phase', {phase:'loading'});
    const api = new API({readBuffer, compileStreaming, hostWrite: s => {
      output += s;
      if (output.length > 64000) throw new Error('Sortie trop volumineuse (limite : 64 Ko).');
    }});
    api.hostLog = () => {};
    api.hostLogAsync = async (_, promise) => promise;
    await Promise.all([api.ready, compileStreaming('clang'), compileStreaming('lld')]);
    phase = 'compiling'; send('phase', {phase}); output = '';
    api.memfs.addFile('solution.c', new TextEncoder().encode(data.program));
    await api.run(await compileStreaming('clang'), 'clang', '-cc1', '-emit-obj',
      '-isysroot','/','-internal-isystem','/include',
      '-internal-isystem','/lib/clang/8.0.1/include',
      '-ferror-limit','8','-fmessage-length','100','-Wall','-Wextra',
      '-Werror=implicit-function-declaration','-std=c17','-O0','-o','solution.o','-x','c','solution.c');
    await api.run(await compileStreaming('lld'), 'wasm-ld','--no-threads',
      '-z','stack-size=1048576','--max-memory=33554432','-Llib/wasm32-wasi',
      'lib/wasm32-wasi/crt1.o','solution.o','-lc','-o','solution.wasm');
    const diagnostics = clean(output);
    const program = await WebAssembly.compile(api.memfs.getFileContents('solution.wasm'));
    send('compiled', {diagnostics});
    for (let i=0;i<data.count;i++) {
      phase='running'; send('phase', {phase,index:i}); output='';
      try {
        // A new instance for every test: globals and heap cannot leak between cases.
        await api.run(program, 'solution.wasm', String(i));
        send('result', {index:i,actual:clean(output),error:null});
      } catch (error) {
        send('result', {index:i,actual:clean(output),error:error.message || 'Erreur d’exécution'});
      }
    }
    send('done');
  } catch (error) {
    send('error',{phase,message:phase==='loading' ? error.message : clean(output) || error.message || 'Erreur de compilation'});
    if (phase==='loading') {binaries.clear(); modules.clear();}
  } finally { busy=false; }
};
