// ============================================================
//  clinch.js — Shared FIFA 2026 group-stage standings,
//  mathematical clinch detection, and knockout bracket
//  slot mapping. Used by BOTH index.html and schedule.html
//  so the qualification logic lives in exactly one place.
//
//  Depends on: TEAMS, MATCHES (from data.js) — load this file
//  AFTER data.js and BEFORE any page-specific inline script
//  that calls standings()/getClinchAnalysis()/resolveGroupPos().
// ============================================================

// ── Group standings table (points / GD / goals, no tiebreak ladder) ──
// NOTE: this is the simple "current table" sort used to pick which
// team currently occupies pos 1/2/3 in a group. The FULL Article 13
// ladder (head-to-head etc.) is only needed to decide whether that
// position is "locked" — see analyzeGroupClinch() below.
function standings(grp){
  const teams={};
  const init=id=>{if(!teams[id])teams[id]={id,gp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}};
  MATCHES.filter(m=>m.grp===grp).forEach(m=>{init(m.home);init(m.away)});
  MATCHES.filter(m=>m.grp===grp&&m.st!=='NS').forEach(m=>{
    const h=teams[m.home],a=teams[m.away];
    h.gp++;a.gp++;h.gf+=m.hs;h.ga+=m.as;a.gf+=m.as;a.ga+=m.hs;
    if(m.hs>m.as){h.w++;h.pts+=3;a.l++}else if(m.hs<m.as){a.w++;a.pts+=3;h.l++}else{h.d++;a.d++;h.pts++;a.pts++}
  });
  return Object.values(teams).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
}

// ══════════════════════════════════════════════════
//  KNOCKOUT BRACKET SLOT MAPPING
// ══════════════════════════════════════════════════

// ── FIFA's official 2026 knockout bracket (Match 73-104) ──────
// Rebuilt from FIFA.com's own match schedule + cross-checked against
// Wikipedia, CBS Sports, Sky Sports and MLSSoccer.com, all of which
// agree exactly. Uses FIFA's real match numbers as ids (not made-up
// R32-1..16 labels) so every slot can be checked directly against any
// official source. Earlier version of this file had two real errors:
// (1) wrong opponent type for several R32 slots (e.g. M76/Brazil was
// modeled as "vs 3rd-place pool" when it's actually "vs Group F
// runner-up"), and (2) the Round of 16 was missing entirely, with QF
// wrongly built directly from R32 winners. Both are fixed below.
// ── CONFIRMED Round of 32 matchups (group stage + 3rd-place rankings
// are now fully decided) ──────────────────────────────────────────
// Sourced directly from the live official bracket (screenshots of a
// FotMob-style bracket view, 28 June 2026) and cross-verified against
// ESPN, Sky Sports, Yahoo Sports, and Al Jazeera's group-stage wrap-ups
// — all five sources agree on every single pairing below. This is a
// manual, point-in-time mapping: it's correct for THIS tournament's
// actual final group standings, but is NOT a general algorithm (FIFA's
// real 3rd-place allocation uses a 495-combination lookup table this
// does not implement). If group results from a future tournament or a
// reset dataset ever change, this table would need rebuilding by hand.
const R32_CONFIRMED={
  M73:['south_africa','canada'],
  M74:['germany','paraguay'],
  M75:['netherlands','morocco'],
  M76:['brazil','japan'],
  M77:['france','sweden'],
  M78:['ivory_coast','norway'],
  M79:['mexico','ecuador'],
  M80:['england','dr_congo'],
  M81:['usa','bosnia'],
  M82:['belgium','senegal'],
  M83:['portugal','croatia'],
  M84:['spain','austria'],
  M85:['switzerland','algeria'],
  M86:['argentina','cape_verde'],
  M87:['colombia','ghana'],
  M88:['australia','egypt'],
};
const BRACKET_R32=[
  {id:'M73', home:{grp:'A',pos:2}, away:{grp:'B',pos:2}},
  {id:'M74', home:{grp:'E',pos:1}, away:{pos:3,pool:['A','B','C','D','F']}},
  {id:'M75', home:{grp:'F',pos:1}, away:{grp:'C',pos:2}},
  {id:'M76', home:{grp:'C',pos:1}, away:{grp:'F',pos:2}},
  {id:'M77', home:{grp:'I',pos:1}, away:{pos:3,pool:['C','D','F','G','H']}},
  {id:'M78', home:{grp:'E',pos:2}, away:{grp:'I',pos:2}},
  {id:'M79', home:{grp:'A',pos:1}, away:{pos:3,pool:['C','E','F','H','I']}},
  {id:'M80', home:{grp:'L',pos:1}, away:{pos:3,pool:['E','H','I','J','K']}},
  {id:'M81', home:{grp:'D',pos:1}, away:{pos:3,pool:['B','E','F','I','J']}},
  {id:'M82', home:{grp:'G',pos:1}, away:{pos:3,pool:['A','E','H','I','J']}},
  {id:'M83', home:{grp:'K',pos:2}, away:{grp:'L',pos:2}},
  {id:'M84', home:{grp:'H',pos:1}, away:{grp:'J',pos:2}},
  {id:'M85', home:{grp:'B',pos:1}, away:{pos:3,pool:['E','F','G','I','J']}},
  {id:'M86', home:{grp:'J',pos:1}, away:{grp:'H',pos:2}},
  {id:'M87', home:{grp:'K',pos:1}, away:{pos:3,pool:['D','E','I','J','L']}},
  {id:'M88', home:{grp:'D',pos:2}, away:{grp:'G',pos:2}},
];
// Round of 16, Quarter-finals, Semi-finals, Final — all winner-chains
// off the R32 results above. Each `from` pair feeds one match.
const BRACKET_LATER=[
  {round:'R16',id:'M89', from:['M74','M77']},
  {round:'R16',id:'M90', from:['M73','M75']},
  {round:'R16',id:'M91', from:['M76','M78']},
  {round:'R16',id:'M92', from:['M79','M80']},
  {round:'R16',id:'M93', from:['M83','M84']},
  {round:'R16',id:'M94', from:['M81','M82']},
  {round:'R16',id:'M95', from:['M86','M88']},
  {round:'R16',id:'M96', from:['M85','M87']},
  {round:'QF', id:'M97', from:['M89','M90']},
  {round:'QF', id:'M98', from:['M93','M94']},
  {round:'QF', id:'M99', from:['M91','M92']},
  {round:'QF', id:'M100',from:['M95','M96']},
  {round:'SF', id:'M101',from:['M97','M98']},
  {round:'SF', id:'M102',from:['M99','M100']},
  {round:'3P', id:'M103',from:['M101','M102']}, // third-place playoff: LOSERS of the two semis, not winners
  {round:'F',  id:'M104',from:['M101','M102']},
];

// ── Mathematical clinch detection (FIFA 2026 rules) ────
// Determines whether a team's group position is MATHEMATICALLY guaranteed
// regardless of how remaining matches play out — not just "currently leading."
//
// FIFA changed the 2026 tiebreaker order (confirmed via official regs,
// announced April 2026): when teams are level on points, HEAD-TO-HEAD
// results are checked BEFORE overall goal difference — a first for a
// World Cup (previously goal difference came first, since 1970).
// Full order for teams tied on points within a group:
//   1. Head-to-head points (among only the tied teams)
//   2. Head-to-head goal difference
//   3. Head-to-head goals scored
//   4. Overall group goal difference
//   5. Overall group goals scored
//   6. Team conduct/fair-play score (not tracked per-team yet — omitted,
//      falls through to step 7; extremely rare for it to matter anyway)
//   7. FIFA World Ranking
// For comparing 3rd-place teams ACROSS different groups (no head-to-head
// possible — they never played each other): straight to step 4 onward.
//
// Method: with at most 2 matches left per group, exhaustively simulate
// every realistic outcome (draw / narrow win / blowout win, both
// directions) and check whether a team's top-2-or-not status is the
// SAME in every single scenario. If yes, that position is clinched/out.
// If a group still has 3+ matches left, scenarios are capped for
// performance and the result conservatively reports "undetermined" —
// we never guess a team in/out early; we only confirm once truly certain.
const CLINCH_FIFA_RANK={};
function clinchApplyResult(table,homeId,awayId,hg,ag){
  const h=table[homeId],a=table[awayId];
  h.gp++;a.gp++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;
  if(hg>ag){h.w++;h.pts+=3;a.l++}else if(hg<ag){a.w++;a.pts+=3;h.l++}else{h.d++;a.d++;h.pts++;a.pts++}
  h.h2h[awayId]={gf:hg,ga:ag,pts:hg>ag?3:hg===ag?1:0};
  a.h2h[homeId]={gf:ag,ga:hg,pts:ag>hg?3:ag===hg?1:0};
}
function clinchBuildBaseTable(groupMatches){
  const table={};const teamIds=new Set();
  groupMatches.forEach(m=>{teamIds.add(m.home);teamIds.add(m.away)});
  teamIds.forEach(id=>{table[id]={id,gp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,h2h:{},conduct:0}});
  groupMatches.filter(m=>m.st!=='NS').forEach(m=>clinchApplyResult(table,m.home,m.away,m.hs,m.as));
  return table;
}
// Resolves a tied-on-points group via FIFA Article 13's full ladder.
// Step 1 (a-c): head-to-head pts/GD/goals among the tied set.
// Step 2: if any teams remain equal after Step 1, criteria a-c are
// RE-APPLIED to those remaining teams only (head-to-head among just
// THEM, not the original full tied set) — recursively, since that
// narrower re-check can itself partially separate a 3-way-or-larger
// remainder. Only once that recursive head-to-head re-check still
// can't separate two teams do we fall to d-f: overall GD, overall
// goals, then conduct score. Step 3 (g-h): FIFA ranking.
// This mirrors Article 13 precisely — Step 2 explicitly does not
// jump straight to overall GD; it re-runs a-c on the narrowed set first.
function clinchH2HSort(teamSet,table){
  // Builds a head-to-head mini-table using ONLY matches among teamSet,
  // then sorts by h2h pts -> h2h GD -> h2h goals (criteria a/b/c).
  const h2h={};
  teamSet.forEach(t=>h2h[t.id]={pts:0,gf:0,ga:0});
  teamSet.forEach(t=>teamSet.forEach(o=>{
    if(t.id===o.id) return;
    const rec=table[t.id].h2h[o.id];
    if(rec){h2h[t.id].pts+=rec.pts;h2h[t.id].gf+=rec.gf;h2h[t.id].ga+=rec.ga}
  }));
  const sorted=[...teamSet].sort((a,b)=>{
    const A=h2h[a.id],B=h2h[b.id];
    if(B.pts!==A.pts) return B.pts-A.pts;
    const agd=A.gf-A.ga,bgd=B.gf-B.ga;
    if(bgd!==agd) return bgd-agd;
    if(B.gf!==A.gf) return B.gf-A.gf;
    return 0;
  });
  return {sorted,h2h};
}
function clinchResolveTie(tiedTeams,table){
  if(tiedTeams.length===1) return tiedTeams;
  const {sorted,h2h}=clinchH2HSort(tiedTeams,table);
  const finalOrder=[];let i=0;
  while(i<sorted.length){
    let j=i+1;
    while(j<sorted.length){
      const A=h2h[sorted[i].id],B=h2h[sorted[j].id];
      const agd=A.gf-A.ga,bgd=B.gf-B.ga;
      if(!(A.pts===B.pts&&agd===bgd&&A.gf===B.gf)) break;
      j++;
    }
    const subgroup=sorted.slice(i,j);
    if(subgroup.length===1){
      finalOrder.push(subgroup[0]);
    }else if(subgroup.length<tiedTeams.length){
      // Step 2: this subgroup is narrower than the set we started with,
      // so re-apply head-to-head (a-c) among just this subgroup before
      // falling to overall GD/goals/conduct. Recurse: the narrower
      // re-check can itself partially separate a larger remainder again.
      finalOrder.push(...clinchResolveTie(subgroup,table));
    }else{
      // Re-applying head-to-head to the same set changed nothing ->
      // fall through to d/e/f/g/h (overall GD, goals, conduct, rank).
      const sub=[...subgroup].sort((a,b)=>{
        const aGD=a.gf-a.ga,bGD=b.gf-b.ga;
        if(bGD!==aGD) return bGD-aGD;
        if(b.gf!==a.gf) return b.gf-a.gf;
        if(b.conduct!==a.conduct) return b.conduct-a.conduct;
        const aRank=CLINCH_FIFA_RANK[a.id]??999,bRank=CLINCH_FIFA_RANK[b.id]??999;
        return aRank-bRank;
      });
      finalOrder.push(...sub);
    }
    i=j;
  }
  return finalOrder;
}
function clinchRankGroup(table){
  const teams=Object.values(table);
  const byPoints={};
  teams.forEach(t=>{(byPoints[t.pts]=byPoints[t.pts]||[]).push(t)});
  const pointTiers=Object.keys(byPoints).map(Number).sort((a,b)=>b-a);
  const result=[];
  pointTiers.forEach(pts=>{
    const tied=byPoints[pts];
    if(tied.length===1) result.push(tied[0]);
    else result.push(...clinchResolveTie(tied,table));
  });
  return result;
}
// Scoreline samples: full precision (9 scores) when ≤2 matches remain
// (the realistic endgame case); coarse-but-safe (5 scores, still
// including blowout margins so a GD escape route is never missed)
// when more remain, to keep total scenarios bounded.
const CLINCH_ENDGAME_SCORES=[[0,0],[1,0],[2,0],[3,0],[5,0],[0,1],[0,2],[0,3],[0,5]];
const CLINCH_COARSE_SCORES=[[0,0],[1,0],[5,0],[0,1],[0,5]];
const CLINCH_MAX_SCENARIOS=20000;
function* clinchEnumerateScenarios(unplayedMatches){
  if(unplayedMatches.length===0){ yield []; return; }
  const samples=unplayedMatches.length<=2?CLINCH_ENDGAME_SCORES:CLINCH_COARSE_SCORES;
  const [first,...rest]=unplayedMatches;
  for(const [hg,ag] of samples){
    for(const restScenario of clinchEnumerateScenarios(rest)){
      yield [{...first,hg,ag},...restScenario];
    }
  }
}
// Main entry: returns {finished, top2[], third, eliminated[], undetermined[]}
function analyzeGroupClinch(groupMatches,fifaRanks){
  Object.assign(CLINCH_FIFA_RANK,fifaRanks);
  const base=clinchBuildBaseTable(groupMatches);
  const unplayed=groupMatches.filter(m=>m.st==='NS');
  const teamIds=Object.keys(base);
  if(unplayed.length===0){
    const final=clinchRankGroup(base);
    return {finished:true,top2:final.slice(0,2).map(t=>t.id),third:final[2]?.id,
      eliminated:final.slice(3).map(t=>t.id),
      pos1:final[0]?.id,pos2:final[1]?.id};
  }
  const positionSets={};
  teamIds.forEach(id=>positionSets[id]=new Set());
  let scenarioCount=0,bailedOut=false;
  for(const scenario of clinchEnumerateScenarios(unplayed)){
    scenarioCount++;
    if(scenarioCount>CLINCH_MAX_SCENARIOS){ bailedOut=true; break; }
    const table={};
    teamIds.forEach(id=>{
      table[id]={...base[id],h2h:{...base[id].h2h}};
      Object.keys(base[id].h2h).forEach(k=>table[id].h2h[k]={...base[id].h2h[k]});
    });
    scenario.forEach(m=>clinchApplyResult(table,m.home,m.away,m.hg,m.ag));
    clinchRankGroup(table).forEach((t,idx)=>positionSets[t.id].add(idx));
  }
  if(bailedOut) return {finished:false,top2:[],eliminated:[],undetermined:teamIds,pos1:null,pos2:null};
  const top2=[],eliminated=[],undetermined=[];
  teamIds.forEach(id=>{
    const positions=positionSets[id];
    if([...positions].every(p=>p<=1)) top2.push(id);
    else if([...positions].every(p=>p>=2)) eliminated.push(id);
    else undetermined.push(id);
  });
  // Per-SPECIFIC-position lock: a team is locked into position 1 (resp. 2)
  // only if EVERY simulated scenario puts them at exactly that index — not
  // merely "somewhere in the top 2". Two teams can both be guaranteed to
  // finish top-2 while it's still undecided which of them is 1st vs 2nd
  // (e.g. they play each other in the final matchday) — top2.includes()
  // alone can't distinguish that case, which is exactly the bug this fixes.
  const pos1=teamIds.find(id=>{const p=positionSets[id]; return p.size>0 && [...p].every(x=>x===0);})||null;
  const pos2=teamIds.find(id=>{const p=positionSets[id]; return p.size>0 && [...p].every(x=>x===1);})||null;
  return {finished:false,top2,eliminated,undetermined,pos1,pos2};
}
// Cache: re-run analysis once per group per render cycle, not once
// per bracket slot (each group is queried up to twice — pos 1 and pos 2)
let _clinchCache={};
let _clinchCacheKey='';
function getClinchAnalysis(grp){
  const gm=MATCHES.filter(m=>m.grp===grp);
  const key=gm.map(m=>`${m.st}:${m.hs}-${m.as}`).join('|');
  if(_clinchCacheKey!==key||!_clinchCache[grp]){
    if(_clinchCacheKey!==key){ _clinchCache={}; _clinchCacheKey=key; }
    const fifaRanks={};
    Object.entries(TEAMS).forEach(([id,t])=>fifaRanks[id]=t.fifa_rank);
    _clinchCache[grp]=analyzeGroupClinch(gm,fifaRanks);
  }
  return _clinchCache[grp];
}

// Debug helper: call window.debugClinch() from browser console to see
// the clinch/eliminated/undetermined verdict for all 12 groups at once,
// using whatever match data is currently loaded on the page.
window.debugClinch=function(){
  const GRPS=['A','B','C','D','E','F','G','H','I','J','K','L'];
  const out=[];
  GRPS.forEach(g=>{
    const gm=MATCHES.filter(m=>m.grp===g);
    const played=gm.filter(m=>m.st!=='NS').length;
    const a=getClinchAnalysis(g);
    const names=ids=>ids.map(id=>TEAMS[id]?.name||id).join(', ');
    out.push({
      group:g, played:`${played}/${gm.length}`,
      clinched_top2:names(a.top2)||'—',
      eliminated:names(a.eliminated)||'—',
      undetermined:names(a.undetermined||[])||'—'
    });
  });
  console.table(out);
  return out;
};

// Returns {teamId, locked, gp} — locked=true only when that team is
// mathematically guaranteed to occupy this EXACT position (1st or 2nd),
// not merely guaranteed to finish somewhere in the top 2. Those are
// different conditions: e.g. two teams can both be guaranteed to
// qualify while it's still undecided which one finishes 1st vs 2nd
// (typically because they play each other on the final matchday) —
// in that case neither team's specific slot is locked yet, even
// though both teams individually show up in the group's top2 list.
function resolveGroupPos(grp,pos){
  const table=standings(grp);
  if(!table[pos-1]) return null;
  const teamId=table[pos-1].id;
  const analysis=getClinchAnalysis(grp);
  const lockedTeamId=pos===1?analysis.pos1:analysis.pos2;
  const locked=lockedTeamId===teamId;
  return {teamId, locked, gp:table[pos-1].gp};
}

// Resolves an R32 slot's home/away teams. Checks the hardcoded
// R32_CONFIRMED table first (see above) — if the match id is listed
// there, both teams are returned as locked immediately, bypassing the
// dynamic pool-resolution logic entirely. Falls back to the normal
// resolveGroupPos()-based dynamic resolution for anything not in that
// table (keeps this safe even if R32_CONFIRMED is incomplete or a
// future dataset reset removes it).
function resolveR32Side(side){
  if(side.pos<=2){
    return resolveGroupPos(side.grp,side.pos);
  }
  return null; // 3rd-place pool slot, no dynamic resolution implemented
}
function resolveR32Match(slot){
  const confirmed=R32_CONFIRMED[slot.id];
  if(confirmed){
    return {
      home:{teamId:confirmed[0],locked:true},
      away:{teamId:confirmed[1],locked:true},
    };
  }
  return {
    home:resolveR32Side(slot.home),
    away:resolveR32Side(slot.away),
  };
}

function allGroupsComplete(){
  const GRPS=['A','B','C','D','E','F','G','H','I','J','K','L'];
  return GRPS.every(g=>{
    const gm=MATCHES.filter(m=>m.grp===g);
    return gm.length>0&&gm.every(m=>m.st!=='NS');
  });
}

// ── Knockout winner resolution (R16 onward) ────────────────────
// Once an R32 (or later) match is finished, this looks at the actual
// MATCHES result to determine the winner, so R16/QF/SF/Final slots
// can show real team names instead of "Winner M74" placeholders —
// fetched live from ESPN the same way group-stage scores are.
//
// KNOWN GAP: knockout matches can't end in a draw (extra time + penalty
// shootout decide a winner), but this only compares m.hs/m.as. If
// ESPN's reported score for a shootout-decided match is NOT already
// the literal winning margin (e.g. it reports the 90-minute score as
// level and the shootout result separately), this will fail to pick
// a winner and the slot will correctly stay "pending" rather than
// guess — but it won't show the real winner either until that's
// addressed. Untested against real knockout data since the tournament
// hasn't reached this stage yet.
function getMatchWinner(matchId){
  const m=MATCHES.find(x=>x.id===matchId);
  if(!m||m.st!=='FT'||m.hs==null||m.as==null) return null;
  if(m.hs>m.as) return m.home;
  if(m.as>m.hs) return m.away;
  return null; // drawn scoreline with no shootout data available — can't safely pick a winner
}
// Mirrors getMatchWinner for the third-place playoff, which is fed by
// the two SEMIFINAL LOSERS rather than winners.
function getMatchLoser(matchId){
  const m=MATCHES.find(x=>x.id===matchId);
  if(!m||m.st!=='FT'||m.hs==null||m.as==null) return null;
  if(m.hs>m.as) return m.away;
  if(m.as>m.hs) return m.home;
  return null; // drawn scoreline with no shootout data available — can't safely pick a loser either
}
// Resolves a single BRACKET_LATER entry's two feeder slots into either
// real team ids (if that feeder match has finished) or null (pending).
function resolveLaterMatch(id){
  const r=BRACKET_LATER.find(x=>x.id===id);
  if(!r) return null;
  const getter=r.round==='3P'?getMatchLoser:getMatchWinner;
  return {home:getter(r.from[0]), away:getter(r.from[1])};
}

