'use client';
import {useEffect,useRef} from 'react';
import {EditorState, Compartment} from '@codemirror/state';
import {EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap, drawSelection} from '@codemirror/view';
import {cpp} from '@codemirror/lang-cpp';
import {defaultKeymap, history, historyKeymap, indentWithTab} from '@codemirror/commands';
import {bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle} from '@codemirror/language';
import {closeBrackets, closeBracketsKeymap} from '@codemirror/autocomplete';
import {oneDark} from '@codemirror/theme-one-dark';
type Props = {value:string; onChange:(s:string)=>void; dark:boolean; onRun:()=>void; readOnly?:boolean};
export default function CodeEditor({value,onChange,dark,onRun,readOnly=false}:Props) {
 const host=useRef<HTMLDivElement>(null), view=useRef<EditorView|null>(null);
 const callbacks=useRef({onChange,onRun}); callbacks.current={onChange,onRun};
 const theme=useRef(new Compartment()), editable=useRef(new Compartment());
 useEffect(()=>{
  if(!host.current) return;
  const editor=new EditorView({parent:host.current,state:EditorState.create({doc:value,extensions:[
   lineNumbers(),history(),drawSelection(),highlightActiveLine(),highlightActiveLineGutter(),cpp(),indentOnInput(),bracketMatching(),closeBrackets(),syntaxHighlighting(defaultHighlightStyle,{fallback:true}),
   keymap.of([{key:'Mod-Enter',run:()=>{callbacks.current.onRun();return true;}},indentWithTab,...closeBracketsKeymap,...defaultKeymap,...historyKeymap]),
   theme.current.of(dark?oneDark:[]),editable.current.of([EditorState.readOnly.of(readOnly),EditorView.editable.of(!readOnly)]),
   EditorState.tabSize.of(4),EditorView.contentAttributes.of({'aria-label':readOnly?'Correction en C':'Votre code C','spellcheck':'false'}),
   EditorView.theme({'&':{fontSize:'14px',height:readOnly?'auto':'330px'},'.cm-scroller':{fontFamily:'"SFMono-Regular", Consolas, "Liberation Mono", monospace',lineHeight:'1.8'},'.cm-content':{padding:'18px 0'},'.cm-gutters':{border:'none',background:'transparent',padding:'0 10px 0 8px'},'.cm-activeLine':{backgroundColor:'var(--editor-active)'},'.cm-activeLineGutter':{backgroundColor:'transparent'},'&.cm-focused':{outline:'none'}}),
   EditorView.updateListener.of(u=>{if(u.docChanged)callbacks.current.onChange(u.state.doc.toString());})
  ]})});view.current=editor;
  return()=>{editor.destroy();view.current=null;};
 // The component is keyed by exercise; updates below preserve the undo stack.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{const v=view.current;if(v && v.state.doc.toString()!==value)v.dispatch({changes:{from:0,to:v.state.doc.length,insert:value}});},[value]);
 useEffect(()=>{view.current?.dispatch({effects:theme.current.reconfigure(dark?oneDark:[])});},[dark]);
 useEffect(()=>{view.current?.dispatch({effects:editable.current.reconfigure([EditorState.readOnly.of(readOnly),EditorView.editable.of(!readOnly)])});},[readOnly]);
 return <div className="code-editor" ref={host}/>;
}
