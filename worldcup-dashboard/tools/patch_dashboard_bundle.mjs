import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundlePath = path.resolve(__dirname, "../assets/index-4Rub2ShJ.js");

let bundle = fs.readFileSync(bundlePath, "utf8");
const originalBundle = bundle;

function replaceBetween(name, start, end, replacement) {
  if (bundle.includes(replacement)) return;
  const startIndex = bundle.indexOf(start);
  if (startIndex === -1) throw new Error(`Missing start marker for ${name}`);
  const endIndex = bundle.indexOf(end, startIndex);
  if (endIndex === -1) throw new Error(`Missing end marker for ${name}`);
  bundle = `${bundle.slice(0, startIndex)}${replacement}${bundle.slice(endIndex + end.length)}`;
}

function replaceExact(name, from, to) {
  if (bundle.includes(to)) return;
  if (!bundle.includes(from)) throw new Error(`Missing exact snippet for ${name}`);
  bundle = bundle.replace(from, to);
}

function replaceExactOptional(from, to) {
  if (bundle.includes(to)) return;
  if (bundle.includes(from)) bundle = bundle.replace(from, to);
}

replaceBetween(
  "match event participants",
  "const Ne=Object.keys(k.stats)",
  ",Fe=(K.rosters||[])",
  'const Ne=Object.keys(k.stats).length>0||Object.keys(f.stats).length>0,Ye=qe=>qe===k.teamId?"home":qe===f.teamId?"away":null,Qe=qe=>{const gt=[];for(const pt of[...(qe.athletesInvolved||[]),...(qe.participants||[])]){const ft=pt.displayName||pt.fullName||pt.name||pt.athlete?.displayName||pt.athlete?.fullName||pt.athlete?.name;ft&&!gt.includes(ft)&&gt.push(ft)}return gt},Ze=qe=>{const gt=qe.type?.text||"",pt=Qe(qe),ft=qe.shortText||qe.text||gt;let te=pt.length?pt.join(" \u00b7 "):ft;if(gt.toLowerCase().includes("substitution")&&pt.length>=2)te=`${pt[0]} on, ${pt[1]} off`;return te},Ke=(K.keyEvents||[]).map(qe=>{var gt,pt,ft;return{clock:((gt=qe.clock)==null?void 0:gt.displayValue)||"",type:((pt=qe.type)==null?void 0:pt.text)||"",side:Ye((ft=qe.team)==null?void 0:ft.id),players:Qe(qe),label:Ze(qe),text:qe.text||qe.shortText||""}}).filter(qe=>qe.type&&qe.side),Fe=(K.rosters||[])'
);

replaceBetween(
  "local team roster cache",
  "const Ng=new Map;async function E0",
  "function j_(U)",
  'const Ng=new Map,wc26RosterCache=new Map;async function E0(U){if(Ng.has(U))return Ng.get(U);let K=null;if(!wc26RosterCache.has("players"))wc26RosterCache.set("players",fetch("./data/players.json").then(fe=>fe.ok?fe.json():null).catch(()=>null));K=await wc26RosterCache.get("players");const fe=(K?.players||[]).filter(W=>String(W.teamId)===String(U)).map(W=>({id:W.id,name:W.name,jersey:W.jersey||"",position:W.position||"",age:W.age||null,league:W.league||"",club:W.club||""}));if(fe.length)return Ng.set(U,fe),fe;const W=((await Ad(`${Wm}/teams/${U}/roster`)).athletes||[]).flatMap(oe=>Array.isArray(oe.items)?oe.items:[oe]).map(oe=>{var Oe,k,f,se,ge;return{id:oe.id,name:oe.fullName||oe.displayName,jersey:oe.jersey||"",position:((Oe=oe.position)==null?void 0:Oe.abbreviation)||((k=oe.position)==null?void 0:k.name)||"",age:oe.age||null,league:T0((f=oe.defaultLeague)==null?void 0:f.$ref),club:((se=oe.club)==null?void 0:se.displayName)||"",clubRef:((ge=oe.defaultTeam)==null?void 0:ge.$ref)||null}});return await Promise.all(W.map(async oe=>{!oe.club&&oe.clubRef&&(oe.club=await M0(oe.clubRef)),delete oe.clubRef})),Ng.set(U,W),W}function j_(U)'
);

replaceBetween(
  "match event label",
  "function Mv({event:U})",
  "function Q_({roster:U,align:K})",
  'function Mv({event:U}){const K=Tv(U.type),fe=U.label||U.text||(U.players.length?U.players.join(" \u00b7 "):U.type),W=X.jsxs("div",{className:"md-ev-cell",children:[X.jsx("i",{className:`md-ev-mark ${K}`}),X.jsxs("div",{className:"md-ev-copy",children:[X.jsx("strong",{children:fe}),X.jsx("span",{children:U.type})]})]});return X.jsxs("div",{className:`md-ev ${U.side}`,children:[X.jsx("div",{className:"md-ev-home",children:U.side==="home"?W:null}),X.jsx("span",{className:"md-ev-min num",children:U.clock||"\u00b7"}),X.jsx("div",{className:"md-ev-away",children:U.side==="away"?W:null})]})}function Q_({roster:U,align:K})'
);

replaceExact(
  "team overlay FIFA rank stat",
  'xt=[{label:"Played",value:U.played??0},{label:"Goals for",value:U.goalsFor??0},{label:"Goals against",value:U.goalsAgainst??0},{label:"Standing",value:U.rank?`${hv(U.rank)} \u00b7 ${(Et=U.group)==null?void 0:Et.replace("Group ","Grp ")}`:"\u2014"}]',
  'xt=[{label:"FIFA rank",value:U.fifaRank?`#${U.fifaRank}`:"\u2014"},{label:"Played",value:U.played??0},{label:"Goals for",value:U.goalsFor??0},{label:"Goals against",value:U.goalsAgainst??0},{label:"Standing",value:U.rank?`${hv(U.rank)} \u00b7 ${(Et=U.group)==null?void 0:Et.replace("Group ","Grp ")}`:"\u2014"}]'
);

replaceExact(
  "team roster club league order",
  '[uv(pt.position),pt.league,pt.club].filter(Boolean).join(" \u00b7 ")',
  '[uv(pt.position),pt.club,pt.league].filter(Boolean).join(" \u00b7 ")'
);

replaceExact(
  "team tile FIFA rank",
  'Ne.group.replace("Group ","Group ")," \u00b7 ",Ne.points," pts",se.has(Ne.name)?" \u00b7 \u2605":""]',
  '"FIFA #",Ne.fifaRank||"\u2014"," \u00b7 ",Ne.group.replace("Group ","Group ")," \u00b7 ",Ne.points," pts",se.has(Ne.name)?" \u00b7 \u2605":""]'
);

replaceExact("stadium tour delay", "N0=1e4", "N0=3e3");

replaceExact(
  "hero score finished kickoff",
  'fe==="finished"?"Full time":Ed(U)',
  'fe==="finished"?X.jsxs(X.Fragment,{children:["Full time"," \u00b7 ",Ed(U)]}):Ed(U)'
);

replaceExact(
  "score row finished kickoff",
  'fe==="finished"?"FT":Ed(U)',
  'fe==="finished"?X.jsxs(X.Fragment,{children:["FT"," \u00b7 ",Ed(U)]}):Ed(U)'
);

replaceExact(
  "match modal finished kickoff",
  'Ne==="finished"?"Full time":Ed(U)',
  'Ne==="finished"?X.jsxs(X.Fragment,{children:["Full time"," \u00b7 ",Ed(U)]}):Ed(U)'
);

replaceExact(
  "refresh everything each minute",
  "try{K(await Zg())}",
  "try{K(await uy(eg()||{}))}"
);

replaceExact(
  "hero headline variants",
  '}function Q0({state:U,onExplore:K,onOpenMatch:fe,tourPaused:W=!1})',
  '}const wcHeroLines=[["The world,","in one place."],["Every group,","every heartbeat."],["Sixteen cities,","one trophy."],["Nations rise,","stories unfold."],["From kickoff,","to history."]],wcHeroLiveLines=[["It\'s matchday.","Right now."],["The whistle blows,","the world watches."],["Live drama,","every minute."],["Ninety minutes,","endless noise."]];function Q0({state:U,onExplore:K,onOpenMatch:fe,tourPaused:W=!1})'
);

replaceExactOptional(
  'const{matches:oe,venues:Oe}=U,[k,f]=Rt.useState(""),[se,ge]=Rt.useState(!1),Ne=Rt.useMemo',
  'const{matches:oe,venues:Oe}=U,[k,f]=Rt.useState(""),[se,ge]=Rt.useState(!1),[Qe]=Rt.useState(()=>Math.floor(Math.random()*wcHeroLines.length));const Ne=Rt.useMemo'
);

replaceExactOptional(
  'const{matches:oe,venues:Oe}=U,[k,f]=Rt.useState(""),[se,ge]=Rt.useState(!1),[Qe,Ze]=Rt.useState(()=>Math.floor(Math.random()*wcHeroLines.length));Rt.useEffect(()=>{const Fe=setInterval(()=>Ze(ot=>ot+1),12e3);return()=>clearInterval(Fe)},[]);const Ne=Rt.useMemo',
  'const{matches:oe,venues:Oe}=U,[k,f]=Rt.useState(""),[se,ge]=Rt.useState(!1),[Qe]=Rt.useState(()=>Math.floor(Math.random()*wcHeroLines.length));const Ne=Rt.useMemo'
);

replaceExact(
  "hero headline active line",
  'Ke=oe.some(Fe=>Hi(Fe)==="live");return X.jsxs("section"',
  'Ke=oe.some(Fe=>Hi(Fe)==="live"),St=(Ke?wcHeroLiveLines:wcHeroLines)[Qe%(Ke?wcHeroLiveLines:wcHeroLines).length];return X.jsxs("section"'
);

replaceExact(
  "hero headline render",
  'X.jsxs("h1",{className:"display",children:[Ke?"It\'s matchday.":"The world,",X.jsx("br",{}),Ke?"Right now.":"in one place."]})',
  'X.jsxs("h1",{className:"display",children:[St[0],X.jsx("br",{}),St[1]]})'
);

if (bundle !== originalBundle) {
  fs.writeFileSync(bundlePath, bundle, "utf8");
  console.log(`Patched ${bundlePath}`);
} else {
  console.log(`Already patched ${bundlePath}`);
}

