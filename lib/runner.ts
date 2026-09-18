import { type Exercise } from './exercises';
export type TestResult = { index: number; actual: string; expected: string; passed: boolean; error: string | null };
export type RunSummary = { results: TestResult[]; error: string | null; diagnostics: string; cancelled?: boolean };
export type RunEvent = { type: 'phase'; phase: string; index?: number } | { type: 'result'; result: TestResult } | { type: 'diagnostics'; text: string };
export function makeSuite(exercise: Exercise, code: string) {
  return '#include <stdio.h>\n#include <stdlib.h>\n#include <stddef.h>\n#include <limits.h>\n#include <string.h>\n\n#line 1 "solution.c"\n' + code + '\n\n#line 1 "tests.c"\nint main(int argc, char **argv) {\nif(argc < 2) return 1;\nswitch(atoi(argv[1])) {\n' + exercise.tests.map((t,i)=>`case ${i}: { ${t.code} break; }`).join('\n') + '\n}\nreturn 0;\n}\n';
}
export class CRunner {
  private worker: Worker | null = null;
  private cancelCurrent: (()=>void) | null = null;
  stop() { this.cancelCurrent?.(); this.worker?.terminate(); this.worker=null; }
  run(exercise: Exercise, code: string, onEvent: (event: RunEvent)=>void): Promise<RunSummary> {
    if (this.cancelCurrent) return Promise.reject(new Error('Une vérification est déjà en cours.'));
    if (code.length > 100000) return Promise.resolve({results:[],diagnostics:'',error:'Code trop long (100 000 caractères maximum).'});
    if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined' || typeof DecompressionStream === 'undefined') {
      return Promise.resolve({results:[],diagnostics:'',error:'Ce navigateur ne prend pas en charge le moteur C. Utilisez une version récente de Firefox, Chrome, Edge ou Safari.'});
    }
    this.worker ??= new Worker(new URL('compiler/worker.js', document.baseURI));
    const worker = this.worker;
    return new Promise(resolve => {
      const results: TestResult[] = []; let diagnostics=''; let settled=false; let timer: ReturnType<typeof setTimeout>;
      const finish=(error:string|null,cancelled=false)=> {
        if(settled) return; settled=true; clearTimeout(timer); this.cancelCurrent=null;
        worker.onmessage=null; worker.onerror=null;
        resolve({results,diagnostics,error,cancelled});
      };
      const timeout=(ms:number,message:string)=>{ clearTimeout(timer); timer=setTimeout(()=>{worker.terminate();this.worker=null;finish(message);},ms); };
      this.cancelCurrent=()=>{worker.terminate();this.worker=null;finish('Vérification arrêtée.',true);};
      timeout(90000,'Le chargement a pris trop de temps. Vérifiez votre connexion et réessayez.');
      worker.onerror=(event)=>{event.preventDefault();worker.terminate();this.worker=null;finish('Le moteur C a rencontré une erreur. Réessayez.');};
      worker.onmessage=({data})=>{
        if(data.type==='phase') {
          onEvent(data);
          if(data.phase==='compiling') timeout(25000,'La compilation a dépassé 25 secondes.');
          if(data.phase==='running') timeout(2500,`Le test ${data.index+1} a dépassé 2,5 secondes. Vérifiez vos boucles et la terminaison de vos appels récursifs.`);
        } else if(data.type==='compiled') { diagnostics=data.diagnostics; onEvent({type:'diagnostics',text:diagnostics}); }
        else if(data.type==='result') {
          const expected=exercise.tests[data.index].expected.trim();
          const result={index:data.index,actual:data.actual,expected,passed:!data.error && data.actual===expected,error:data.error};
          results.push(result);onEvent({type:'result',result});
        } else if(data.type==='done') finish(null);
        else if(data.type==='error') finish(data.message);
      };
      worker.postMessage({type:'run',program:makeSuite(exercise,code),count:exercise.tests.length});
    });
  }
}
