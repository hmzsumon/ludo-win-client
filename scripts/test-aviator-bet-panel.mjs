import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
let cells=[], cursor=0, effects=[], dirty=false, tree, props, ack;
const depsEqual=(a,b)=>a && b && a.length===b.length && a.every((v,i)=>Object.is(v,b[i]));
const react={
 useState(initial){ const i=cursor++; if(!(i in cells)) cells[i]=initial; return [cells[i],v=>{const n=typeof v==='function'?v(cells[i]):v;if(!Object.is(n,cells[i])){cells[i]=n;dirty=true;}}]; },
 useRef(initial){const i=cursor++;return cells[i]??(cells[i]={current:initial});},
 useEffect(fn,deps){const i=cursor++; if(!depsEqual(cells[i],deps)){cells[i]=deps;effects.push(fn);}}
};
const jsx=(type,props)=>({type,props:props||{}});
const source=fs.readFileSync('components/aviator/sections/BetPanel.tsx','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const module={exports:{}};
vm.runInNewContext(js,{exports:module.exports,module,require:name=>name==='react'?react:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name==='lucide-react'?{Minus:'minus',Plus:'plus',X:'x'}:name==='./AviatorNotice'?{useAviatorNotice:()=>()=>{}}:{default:()=>null}});
const Component=module.exports.default;
function render(){for(let i=0;i<30;i++){dirty=false;cursor=0;effects=[];tree=Component(props);effects.forEach(f=>f());if(!dirty)return;}throw Error('Render loop');}
function nodes(n=tree){return !n||typeof n!=='object'?[]:[n,...[n.props?.children].flat(Infinity).flatMap(c=>c == null ? [] : nodes(c))];}
const input=()=>nodes().find(n=>n.type==='input');
const preset=v=>nodes().find(n=>n.type==='button'&&n.props.children===v.toLocaleString());
const main=()=>nodes().find(n=>n.type==='button'&&n.props.className?.includes('h-[68px]'));
function click(n){assert.equal(!!n.props.disabled,false);n.props.onClick();render();}
props={slot:1,game:{roundId:'r1',phase:'WAITING',minBet:2,maxBet:100000,multiplier:1},socket:{emit(event,payload,reply){ack={event,payload,reply};}},balance:1000000,refresh:()=>{}};
render();assert.equal(input().props.value,'2');
for(const [p,want] of [[100,100],[100,200],[100,300],[200,200],[200,400],[500,500],[500,1000],[10000,10000],[10000,20000]]){click(preset(p));assert.equal(input().props.value,String(want));}
click(main());assert.equal(ack.payload.amount,20000);assert.equal(input().props.disabled,true);assert.equal(preset(100).props.disabled,true);
ack.reply({success:true});render();assert.equal(input().props.disabled,true);
props.game={...props.game,minBet:3};render();assert.equal(input().props.value,'20000');
click(main());assert.equal(ack.event,'AVIATOR_CANCEL_BET');ack.reply({success:true});render();assert.equal(input().props.disabled,false);
click(preset(100));assert.equal(input().props.value,'100');
props.game={...props.game,phase:'RUNNING'};render();click(main());assert.equal(input().props.disabled,true);click(main());assert.equal(input().props.disabled,false);
input().props.onChange({target:{value:'700'}});render();click(preset(100));assert.equal(input().props.value,'100');
// Each panel starts with its own minimum and preset sequence.
cells=[];props={...props,slot:2,game:{...props.game,phase:'WAITING',minBet:5}};render();assert.equal(input().props.value,'5');click(preset(500));assert.equal(input().props.value,'500');
console.log('PASS: admin minimum, preset switching/repeats, pending and accepted locks, cancel unlock, queued lock/unlock, manual edit reset, independent panel defaults');
