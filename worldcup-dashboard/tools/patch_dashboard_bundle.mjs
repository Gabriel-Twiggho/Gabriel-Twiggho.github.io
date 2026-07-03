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

replaceExact(
  "next match countdown component",
  "const Dv=",
  'function wcNextCountdown({matches:U}){const[K,fe]=Rt.useState(Date.now());Rt.useEffect(()=>{const Ye=setInterval(()=>fe(Date.now()),1e3);return()=>clearInterval(Ye)},[]);const W=Rt.useMemo(()=>[...U].filter(Ye=>new Date(Ye.dateUtc).getTime()>K).sort((Ye,Ke)=>new Date(Ye.dateUtc)-new Date(Ke.dateUtc))[0]||null,[U,K]);if(!W)return null;const oe=Math.max(0,new Date(W.dateUtc).getTime()-K),Oe=Math.floor(oe/864e5),k=Math.floor(oe%864e5/36e5),f=Math.floor(oe%36e5/6e4),se=Math.floor(oe%6e4/1e3),ge=Oe>0?`${Oe}d ${k}h`:`${String(k).padStart(2,"0")}:${String(f).padStart(2,"0")}:${String(se).padStart(2,"0")}`,Ne=[W.home?.abbrev||W.home?.shortName||W.home?.name,W.away?.abbrev||W.away?.shortName||W.away?.name].filter(Boolean).join(" vs ");return X.jsxs("div",{className:"nav-countdown","aria-label":`Next match ${Ne} starts in ${ge}`,title:`${Ne} · ${Ed(W)}`,children:[X.jsx("span",{children:"Next"}),X.jsx("strong",{className:"num",children:ge}),X.jsx("em",{children:Ne})]})}const Dv='
);

replaceExactOptional(
  'X.jsxs("button",{className:"wordmark",onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),children:["WC",X.jsx("span",{children:"26"})]}),X.jsx(wcNextCountdown,{matches:U.matches}),X.jsx("nav",{children:Dv.map(([vt,Se])=>X.jsx("button",{onClick:()=>Fe(vt),children:Se},vt))})',
  'X.jsxs("div",{className:"nav-brand",children:[X.jsxs("button",{className:"wordmark",onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),children:["WC",X.jsx("span",{children:"26"})]}),X.jsx(wcNextCountdown,{matches:U.matches})]}),X.jsx("nav",{children:Dv.map(([vt,Se])=>X.jsx("button",{onClick:()=>Fe(vt),children:Se},vt))})'
);

replaceExact(
  "next match countdown nav slot",
  'X.jsxs("button",{className:"wordmark",onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),children:["WC",X.jsx("span",{children:"26"})]}),X.jsx("nav",{children:Dv.map(([vt,Se])=>X.jsx("button",{onClick:()=>Fe(vt),children:Se},vt))})',
  'X.jsxs("div",{className:"nav-brand",children:[X.jsxs("button",{className:"wordmark",onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),children:["WC",X.jsx("span",{children:"26"})]}),X.jsx(wcNextCountdown,{matches:U.matches})]}),X.jsx("nav",{children:Dv.map(([vt,Se])=>X.jsx("button",{onClick:()=>Fe(vt),children:Se},vt))})'
);

replaceExact(
  "knockout clickable tiles and flow labels",
  'const $_=["round-of-32","round-of-16","quarterfinals","semifinals","final"];function H_({match:U}){const K=Hi(U),fe=K==="live"||K==="finished";return X.jsxs("div",{className:`slot ${K}`,children:[X.jsxs("span",{className:"slot-when",children:[K==="live"?"Live":K==="finished"?"FT":Ed(U)," · ",U.city]}),[U.home,U.away].map((W,oe)=>X.jsxs("div",{className:`slot-team${W.winner?" win":""}${W.placeholder?" tbd":""}`,children:[W.logo&&!W.placeholder&&X.jsx("img",{src:W.logo,alt:""}),X.jsx("em",{children:W.name}),fe&&X.jsx("b",{children:W.score??0})]},oe))]})}function av({matches:U}){const K=Cd(),fe=Rt.useMemo(()=>{const W={};for(const oe of[...$_,"3rd-place-match"])W[oe]=[];for(const oe of U)W[oe.stage]&&W[oe.stage].push(oe);for(const oe of Object.keys(W))W[oe].sort((Oe,k)=>Oe.dateUtc.localeCompare(k.dateUtc));return W},[U]);return X.jsxs("section",{id:"bracket",className:"section",children:[X.jsxs("div",{className:"reveal",ref:K,children:[X.jsx("p",{className:"eyebrow",children:"Knockout"}),X.jsx("h2",{className:"headline",children:"The road to the final."}),X.jsx("p",{className:"section-sub",children:"July 19 · MetLife Stadium, New York / New Jersey"})]}),X.jsx("div",{className:"bracket-scroll",children:X.jsx("div",{className:"bracket",children:$_.map(W=>X.jsxs("div",{className:"round",children:[X.jsx("h4",{children:Gg[W]}),fe[W].map(oe=>X.jsx(H_,{match:oe},oe.id)),W==="final"&&fe["3rd-place-match"].map(oe=>X.jsxs(n0.Fragment,{children:[X.jsx("h4",{className:"third",children:Gg["3rd-place-match"]}),X.jsx(H_,{match:oe})]},oe.id))]},W))})})]})}',
  'const $_=["round-of-32","round-of-16","quarterfinals","semifinals","final"],wcKoNext={"round-of-32":"Round of 16","round-of-16":"Quarterfinals",quarterfinals:"Semifinals",semifinals:"Final",final:"Champion","3rd-place-match":"Third place"};function wcKoFlow(U,K){return U==="final"?"Winner lifts the trophy":U==="3rd-place-match"?"Winner takes third place":`${U==="semifinals"?"Winner to Final · loser to 3rd place":`Winner to ${wcKoNext[U]} ${Math.floor(K/2)+1}`}`}function H_({match:U,onOpenMatch:K,flow:fe}){const W=Hi(U),oe=W==="live"||W==="finished";return X.jsxs("button",{type:"button",className:`slot ${W}`,"aria-label":`Open ${U.home.name} versus ${U.away.name}`,onClick:()=>K==null?void 0:K(U.id),children:[fe&&X.jsx("span",{className:"slot-flow",children:fe}),X.jsxs("span",{className:"slot-when",children:[W==="live"?"Live":W==="finished"?"FT":Ed(U)," · ",U.city]}),[U.home,U.away].map((Oe,k)=>X.jsxs("div",{className:`slot-team${Oe.winner?" win":""}${Oe.placeholder?" tbd":""}`,children:[Oe.logo&&!Oe.placeholder&&X.jsx("img",{src:Oe.logo,alt:""}),X.jsx("em",{children:Oe.name}),oe&&X.jsx("b",{children:Oe.score??0})]},k))]})}function av({matches:U,onOpenMatch:K}){const fe=Cd(),W=Rt.useMemo(()=>{const oe={};for(const Oe of[...$_,"3rd-place-match"])oe[Oe]=[];for(const Oe of U)oe[Oe.stage]&&oe[Oe.stage].push(Oe);for(const Oe of Object.keys(oe))oe[Oe].sort((k,f)=>k.dateUtc.localeCompare(f.dateUtc));return oe},[U]);return X.jsxs("section",{id:"bracket",className:"section",children:[X.jsxs("div",{className:"reveal",ref:fe,children:[X.jsx("p",{className:"eyebrow",children:"Knockout"}),X.jsx("h2",{className:"headline",children:"The road to the final."}),X.jsx("p",{className:"section-sub",children:"Tap a knockout tile for the match detail. Each card shows the winner path into the next round."})]}),X.jsx("div",{className:"bracket-scroll",children:X.jsx("div",{className:"bracket",children:$_.map(oe=>X.jsxs("div",{className:`round ${oe}`,children:[X.jsx("h4",{children:Gg[oe]}),W[oe].map((Oe,k)=>X.jsx(H_,{match:Oe,onOpenMatch:K,flow:wcKoFlow(oe,k)},Oe.id)),oe==="final"&&W["3rd-place-match"].map((Oe,k)=>X.jsxs(n0.Fragment,{children:[X.jsx("h4",{className:"third",children:Gg["3rd-place-match"]}),X.jsx(H_,{match:Oe,onOpenMatch:K,flow:wcKoFlow("3rd-place-match",k)})]},Oe.id))]},oe))})})]})}'
);

replaceExact(
  "knockout opener prop",
  'X.jsx(av,{matches:U.matches})',
  'X.jsx(av,{matches:U.matches,onOpenMatch:Ye})'
);

replaceExact(
  "live match SBS link",
  'X.jsx("span",{className:`md-state ${Ne}`,children:Ne==="live"?X.jsxs(X.Fragment,{children:[X.jsx("i",{className:"live-dot"})," ",(oe==null?void 0:oe.clock)||U.status.clock||"Live"]}):Ne==="finished"?X.jsxs(X.Fragment,{children:["Full time"," · ",Ed(U)]}):Ed(U)})]}),X.jsx(ot,{side:"away",cls:"away"})',
  'X.jsx("span",{className:`md-state ${Ne}`,children:Ne==="live"?X.jsxs(X.Fragment,{children:[X.jsx("i",{className:"live-dot"})," ",(oe==null?void 0:oe.clock)||U.status.clock||"Live"]}):Ne==="finished"?X.jsxs(X.Fragment,{children:["Full time"," · ",Ed(U)]}):Ed(U)}),Ne==="live"&&X.jsx("a",{className:"md-watch-link",href:"https://www.sbs.com.au/ondemand/fifa-world-cup-2026",target:"_blank",rel:"noreferrer",children:"Watch on SBS"})]}),X.jsx(ot,{side:"away",cls:"away"})'
);


replaceExact(
  "knockout symmetric redesign",
  "const $_=[\"round-of-32\",\"round-of-16\",\"quarterfinals\",\"semifinals\",\"final\"],wcKoNext={\"round-of-32\":\"Round of 16\",\"round-of-16\":\"Quarterfinals\",quarterfinals:\"Semifinals\",semifinals:\"Final\",final:\"Champion\",\"3rd-place-match\":\"Third place\"};function wcKoFlow(U,K){return U===\"final\"?\"Winner lifts the trophy\":U===\"3rd-place-match\"?\"Winner takes third place\":`${U===\"semifinals\"?\"Winner to Final · loser to 3rd place\":`Winner to ${wcKoNext[U]} ${Math.floor(K/2)+1}`}`}function H_({match:U,onOpenMatch:K,flow:fe}){const W=Hi(U),oe=W===\"live\"||W===\"finished\";return X.jsxs(\"button\",{type:\"button\",className:`slot ${W}`,\"aria-label\":`Open ${U.home.name} versus ${U.away.name}`,onClick:()=>K==null?void 0:K(U.id),children:[fe&&X.jsx(\"span\",{className:\"slot-flow\",children:fe}),X.jsxs(\"span\",{className:\"slot-when\",children:[W===\"live\"?\"Live\":W===\"finished\"?\"FT\":Ed(U),\" · \",U.city]}),[U.home,U.away].map((Oe,k)=>X.jsxs(\"div\",{className:`slot-team${Oe.winner?\" win\":\"\"}${Oe.placeholder?\" tbd\":\"\"}`,children:[Oe.logo&&!Oe.placeholder&&X.jsx(\"img\",{src:Oe.logo,alt:\"\"}),X.jsx(\"em\",{children:Oe.name}),oe&&X.jsx(\"b\",{children:Oe.score??0})]},k))]})}function av({matches:U,onOpenMatch:K}){const fe=Cd(),W=Rt.useMemo(()=>{const oe={};for(const Oe of[...$_,\"3rd-place-match\"])oe[Oe]=[];for(const Oe of U)oe[Oe.stage]&&oe[Oe.stage].push(Oe);for(const Oe of Object.keys(oe))oe[Oe].sort((k,f)=>k.dateUtc.localeCompare(f.dateUtc));return oe},[U]);return X.jsxs(\"section\",{id:\"bracket\",className:\"section\",children:[X.jsxs(\"div\",{className:\"reveal\",ref:fe,children:[X.jsx(\"p\",{className:\"eyebrow\",children:\"Knockout\"}),X.jsx(\"h2\",{className:\"headline\",children:\"The road to the final.\"}),X.jsx(\"p\",{className:\"section-sub\",children:\"Tap a knockout tile for the match detail. Each card shows the winner path into the next round.\"})]}),X.jsx(\"div\",{className:\"bracket-scroll\",children:X.jsx(\"div\",{className:\"bracket\",children:$_.map(oe=>X.jsxs(\"div\",{className:`round ${oe}`,children:[X.jsx(\"h4\",{children:Gg[oe]}),W[oe].map((Oe,k)=>X.jsx(H_,{match:Oe,onOpenMatch:K,flow:wcKoFlow(oe,k)},Oe.id)),oe===\"final\"&&W[\"3rd-place-match\"].map((Oe,k)=>X.jsxs(n0.Fragment,{children:[X.jsx(\"h4\",{className:\"third\",children:Gg[\"3rd-place-match\"]}),X.jsx(H_,{match:Oe,onOpenMatch:K,flow:wcKoFlow(\"3rd-place-match\",k)})]},Oe.id))]},oe))})})]})}",
  "const $_=[\"round-of-32\",\"round-of-16\",\"quarterfinals\",\"semifinals\",\"final\"];const WCKO={\"next\":{\"R32:0\":\"R16:0\",\"R32:3\":\"R16:0\",\"R32:2\":\"R16:1\",\"R32:5\":\"R16:1\",\"R32:1\":\"R16:2\",\"R32:4\":\"R16:2\",\"R32:6\":\"R16:3\",\"R32:7\":\"R16:3\",\"R32:11\":\"R16:4\",\"R32:10\":\"R16:4\",\"R32:9\":\"R16:5\",\"R32:8\":\"R16:5\",\"R32:14\":\"R16:6\",\"R32:13\":\"R16:6\",\"R32:12\":\"R16:7\",\"R32:15\":\"R16:7\",\"R16:0\":\"QF:0\",\"R16:1\":\"QF:0\",\"R16:4\":\"QF:1\",\"R16:5\":\"QF:1\",\"R16:2\":\"QF:2\",\"R16:3\":\"QF:2\",\"R16:6\":\"QF:3\",\"R16:7\":\"QF:3\",\"QF:0\":\"SF:0\",\"QF:1\":\"SF:0\",\"QF:2\":\"SF:1\",\"QF:3\":\"SF:1\",\"SF:0\":\"F:0\",\"SF:1\":\"F:0\"},\"layout\":{\"R32\":{\"L\":[0,3,2,5,11,10,9,8],\"R\":[1,4,6,7,14,13,12,15]},\"R16\":{\"L\":[0,1,4,5],\"R\":[2,3,6,7]},\"QF\":{\"L\":[0,1],\"R\":[2,3]},\"SF\":{\"L\":[0],\"R\":[1]}}};const wcByAbbr={R32:\"round-of-32\",R16:\"round-of-16\",QF:\"quarterfinals\",SF:\"semifinals\"};const wcFlowName={R16:\"Round of 16\",QF:\"Quarter-final\",SF:\"Semi-final\",F:\"Final\"};function wcPath(p){var o=[],c=p,s={};while(c&&!s[c]){s[c]=1;o.push(c);c=WCKO.next[c];}return o;}function wcFeed(p){var r=[];for(var k in WCKO.next){if(WCKO.next[k]===p)r.push(k);}var a=r.slice();r.forEach(function(k){a=a.concat(wcFeed(k));});return a;}function wcFlowFor(key){var n=WCKO.next[key];if(!n)return\"Winner lifts the trophy\";var ns=n.split(\":\")[0],idx=parseInt(n.split(\":\")[1],10)+1;return ns===\"F\"?\"Winner \\u2192 Final\":\"Winner \\u2192 \"+wcFlowName[ns]+\" \"+idx;}function H_(P){var U=P.match,K=P.onOpenMatch,stt=Hi(U),done=stt===\"live\"||stt===\"finished\";return X.jsxs(\"div\",{\"data-wcko\":P.dk,className:\"wc-ko-tile \"+stt+\" side-\"+(P.side||\"c\")+(P.cls?\" \"+P.cls:\"\"),role:\"button\",tabIndex:0,onClick:P.onClick,onMouseEnter:P.onEnter,onMouseLeave:P.onLeave,children:[X.jsx(\"span\",{className:\"wc-ko-when\",children:(stt===\"live\"?\"LIVE\":stt===\"finished\"?\"FT\":Ed(U))+\" \\u00b7 \"+U.city}),[U.home,U.away].map(function(t,i){return X.jsxs(\"div\",{className:\"wc-ko-team\"+(t.winner?\" win\":\"\")+(t.placeholder?\" tbd\":\"\"),children:[t.logo&&!t.placeholder&&X.jsx(\"img\",{src:t.logo,alt:\"\"}),X.jsx(\"em\",{children:t.name}),done&&X.jsx(\"b\",{children:t.score==null?0:t.score})]},i);}),P.flow&&X.jsx(\"span\",{className:\"wc-ko-flow\",children:P.flow}),X.jsx(\"button\",{type:\"button\",className:\"wc-ko-open\",onClick:function(e){e.stopPropagation();K&&K(U.id);},children:\"Match details \\u2197\"})]});}function av(P){var U=P.matches,K=P.onOpenMatch,revRef=Cd();var fs=Rt.useState(null),focus=fs[0],setFocus=fs[1];var hs=Rt.useState(null),hover=hs[0],setHover=hs[1];var grouped=Rt.useMemo(function(){var o={};[].concat($_,[\"3rd-place-match\"]).forEach(function(s){o[s]=[];});U.forEach(function(m){o[m.stage]&&o[m.stage].push(m);});Object.keys(o).forEach(function(s){o[s].sort(function(a,b){return a.dateUtc.localeCompare(b.dateUtc);});});return o;},[U]);var pathSet=Rt.useMemo(function(){var s={};if(focus){wcFeed(focus).forEach(function(p){s[p]=\"feed\";});wcPath(focus).forEach(function(p){s[p]=\"path\";});s[focus]=\"focus\";}return s;},[focus]);var hoverNext=hover?WCKO.next[hover]:null;function tileCls(key){var c=[];if(focus){c.push(pathSet[key]?(\"is-\"+pathSet[key]):\"is-off\");}else if(hover){if(key===hover)c.push(\"is-hover\");else if(key===hoverNext)c.push(\"is-next\");}return c.join(\" \");}function mkTile(ab,i,side){var arr=grouped[wcByAbbr[ab]];var m=arr&&arr[i];if(!m)return null;var key=ab+\":\"+i;return X.jsx(H_,{match:m,onOpenMatch:K,dk:key,side:side,cls:tileCls(key),flow:wcFlowFor(key),onClick:function(){setFocus(function(f){return f===key?null:key;});},onEnter:function(){setHover(key);},onLeave:function(){setHover(null);}},m.id);}function col(ab,side){var order=WCKO.layout[ab][side];return X.jsxs(\"div\",{className:\"wc-ko-col col-\"+ab+\" side-\"+side,children:[X.jsx(\"h4\",{children:Gg[wcByAbbr[ab]]}),order.map(function(i){return mkTile(ab,i,side);})]},ab+side);}var finalM=grouped[\"final\"][0],thirdM=grouped[\"3rd-place-match\"][0];var fcls=focus?(focus===\"F:0\"?\"is-focus\":pathSet[\"F:0\"]?\"is-path\":\"is-off\"):\"\";var center=X.jsxs(\"div\",{className:\"wc-ko-center\",children:[X.jsxs(\"div\",{className:\"wc-medallion\",children:[X.jsx(\"span\",{className:\"wc-medallion-top\",children:\"World Cup\"}),X.jsx(\"span\",{className:\"wc-medallion-year\",children:\"\\u201926\"})]}),finalM&&X.jsxs(\"div\",{className:\"wc-ko-final-wrap\",children:[X.jsx(\"span\",{className:\"wc-ko-final-label\",children:\"The Final \\u00b7 \"+Ed(finalM)}),X.jsx(H_,{match:finalM,onOpenMatch:K,dk:\"F:0\",side:\"c\",cls:fcls,onClick:function(){setFocus(function(f){return f===\"F:0\"?null:\"F:0\";});},onEnter:function(){setHover(\"F:0\");},onLeave:function(){setHover(null);}})]}),thirdM&&X.jsxs(\"div\",{className:\"wc-ko-third\",children:[X.jsx(\"span\",{className:\"wc-ko-third-label\",children:\"Third place \\u00b7 \"+Ed(thirdM)}),X.jsx(H_,{match:thirdM,onOpenMatch:K,side:\"c\"})]})]});return X.jsxs(\"section\",{id:\"bracket\",className:\"section\",children:[X.jsxs(\"div\",{className:\"reveal\",ref:revRef,children:[X.jsx(\"p\",{className:\"eyebrow\",children:\"Knockout\"}),X.jsx(\"h2\",{className:\"headline\",children:\"The road to the final.\"}),X.jsx(\"p\",{className:\"section-sub\",children:\"Tap any tie to light the winner\\u2019s path to the final. Hover a match to preview the next fixture.\"})]}),focus&&X.jsx(\"div\",{className:\"wc-ko-clear-wrap\",children:X.jsxs(\"button\",{type:\"button\",className:\"wc-ko-clear\",onClick:function(){setFocus(null);},children:[\"Clear highlighted path \",X.jsx(\"span\",{\"aria-hidden\":\"true\",children:\"\\u00d7\"})]})}),X.jsx(\"div\",{className:\"bracket-scroll\",children:X.jsxs(\"div\",{className:\"wc-ko\"+(focus?\" has-focus\":\"\"),children:[X.jsx(\"div\",{className:\"wc-ko-side left\",children:[\"R32\",\"R16\",\"QF\",\"SF\"].map(function(ab){return col(ab,\"L\");})}),center,X.jsx(\"div\",{className:\"wc-ko-side right\",children:[\"SF\",\"QF\",\"R16\",\"R32\"].map(function(ab){return col(ab,\"R\");})})]})})]});}"
);


replaceExact(
  "section order: bracket above groups",
  "X.jsx(iv,{groups:U.groups,onOpenTeam:Ke}),X.jsx(av,{matches:U.matches,onOpenMatch:Ye}),",
  "X.jsx(av,{matches:U.matches,onOpenMatch:Ye}),X.jsx(iv,{groups:U.groups,onOpenTeam:Ke,matches:U.matches}),"
);
replaceExact(
  "nav order: bracket before groups",
  "const Dv=[[\"scores\",\"Scores\"],[\"groups\",\"Groups\"],[\"bracket\",\"Bracket\"],[\"teams\",\"Teams\"],[\"players\",\"Players\"]]",
  "const Dv=[[\"scores\",\"Scores\"],[\"bracket\",\"Bracket\"],[\"groups\",\"Groups\"],[\"teams\",\"Teams\"],[\"players\",\"Players\"]]"
);
replaceExact(
  "groups: compute advancing set from knockout",
  "function iv({groups:U,onOpenTeam:K}){const fe=Cd();return U!=null&&U.length?",
  "function iv({groups:U,onOpenTeam:K,matches:Va}){const fe=Cd();const wcAdv=Rt.useMemo(function(){var s=new Set();(Va||[]).forEach(function(m){if($_.indexOf(m.stage)<0)return;[m.home,m.away].forEach(function(t){if(t&&t.placeholder===!1&&t.teamId)s.add(t.teamId);});});return s;},[Va]);return U!=null&&U.length?"
);
replaceExact(
  "groups: pass advancing set to card",
  "X.jsx(tv,{group:W,index:oe,onOpenTeam:K},W.name)",
  "X.jsx(tv,{group:W,index:oe,onOpenTeam:K,wcAdv:wcAdv},W.name)"
);
replaceExact(
  "group card: accept advancing set",
  "function tv({group:U,index:K,onOpenTeam:fe}){const W=Cd();",
  "function tv({group:U,index:K,onOpenTeam:fe,wcAdv:Va}){const W=Cd();"
);
replaceExact(
  "group card: grey eliminated rows",
  "X.jsxs(\"tr\",{className:`${oe.rank<=2?\"adv\":oe.rank===3?\"third\":\"\"} clickable`,",
  "X.jsxs(\"tr\",{className:`${oe.rank<=2?\"adv\":oe.rank===3?\"third\":\"\"} clickable${Va&&Va.size&&!Va.has(oe.teamId)?\" wc-elim\":\"\"}`,"
);
replaceExact(
  "bracket fit-scale: refs + dims state",
  "function av(P){var U=P.matches,K=P.onOpenMatch,revRef=Cd();",
  "function av(P){var U=P.matches,K=P.onOpenMatch,revRef=Cd();var wrapRef=Rt.useRef(null),innerRef=Rt.useRef(null);var dm=Rt.useState({s:1,h:0}),dims=dm[0],setDims=dm[1];"
);
replaceExact(
  "bracket fit-scale: measure effect",
  "var hoverNext=hover?WCKO.next[hover]:null;",
  "var hoverNext=hover?WCKO.next[hover]:null;Rt.useLayoutEffect(function(){function fit(){var w=wrapRef.current,inr=innerRef.current;if(!w||!inr)return;var cw=w.clientWidth,sw=inr.scrollWidth;if(!cw||!sw)return;var s=Math.min(1,cw/sw);if(window.matchMedia&&window.matchMedia(\"(min-width:1001px)\").matches){var vh=window.innerHeight-90;if(vh>320)s=Math.min(s,vh/inr.offsetHeight);}if(s<.35)s=.35;setDims(function(p){var nh=inr.offsetHeight*s;return(Math.abs(p.s-s)<.002&&Math.abs(p.h-nh)<1)?p:{s:s,h:nh};});}function draw(){var inr=innerRef.current;if(!inr)return;var svg=inr.querySelector(\".wc-ko-lines\");if(!svg)return;var ir=inr.getBoundingClientRect(),iw=inr.offsetWidth,ih=inr.offsetHeight;if(!ir.width||!iw)return;var sc=ir.width/iw;svg.setAttribute(\"viewBox\",\"0 0 \"+iw+\" \"+ih);function rel(el){var r=el.getBoundingClientRect();return{l:(r.left-ir.left)/sc,t:(r.top-ir.top)/sc,w:r.width/sc,h:r.height/sc};}var frag=\"\";Object.keys(WCKO.next).forEach(function(fk){var tk=WCKO.next[fk];var a=inr.querySelector('[data-wcko=\"'+fk+'\"]'),bb=inr.querySelector('[data-wcko=\"'+tk+'\"]');if(!a||!bb)return;var ra=rel(a),rb=rel(bb);var ay=ra.t+ra.h/2,by=rb.t+rb.h/2;var goR=(ra.l+ra.w/2)<(rb.l+rb.w/2);var x1=goR?ra.l+ra.w:ra.l,x2=goR?rb.l:rb.l+rb.w;var mx=(x1+x2)/2;var lit=focus?(pathSet[fk]&&pathSet[fk]!==\"feed\"&&pathSet[tk]?\" on\":\" off\"):\"\";frag+='<path class=\"wc-ko-line'+lit+'\" d=\"M '+x1.toFixed(1)+' '+ay.toFixed(1)+' H '+mx.toFixed(1)+' V '+by.toFixed(1)+' H '+x2.toFixed(1)+'\"/>';});svg.innerHTML=frag;}function all(){fit();requestAnimationFrame(draw);}all();var t=setTimeout(all,120);var ro=null;if(window.ResizeObserver){ro=new ResizeObserver(all);wrapRef.current&&ro.observe(wrapRef.current);innerRef.current&&ro.observe(innerRef.current);}window.addEventListener(\"resize\",all);document.fonts&&document.fonts.ready&&document.fonts.ready.then(function(){all();});return function(){clearTimeout(t);window.removeEventListener(\"resize\",all);ro&&ro.disconnect();};},[U,focus]);"
);
replaceExact(
  "bracket fit-scale: wire transform",
  "X.jsx(\"div\",{className:\"bracket-scroll\",children:X.jsxs(\"div\",{className:\"wc-ko\"+(focus?\" has-focus\":\"\"),children:[",
  "X.jsx(\"div\",{className:\"bracket-scroll\",ref:wrapRef,style:{height:dims.h?dims.h+\"px\":void 0,overflow:\"hidden\"},children:X.jsxs(\"div\",{className:\"wc-ko\"+(focus?\" has-focus\":\"\"),ref:innerRef,style:{transform:\"scale(\"+dims.s+\")\",transformOrigin:\"top center\"},children:[X.jsx(\"svg\",{className:\"wc-ko-lines\",\"aria-hidden\":\"true\"}),"
);

if (bundle !== originalBundle) {
  fs.writeFileSync(bundlePath, bundle, "utf8");
  console.log(`Patched ${bundlePath}`);
} else {
  console.log(`Already patched ${bundlePath}`);
}
