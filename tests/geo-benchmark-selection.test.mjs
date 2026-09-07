import assert from "node:assert/strict";
import test from "node:test";
import source from "../src/features/geo-benchmark/dataset/places.v1.json" with { type: "json" };
import { parseDataset } from "../src/features/geo-benchmark/data.ts";
import { selectRounds } from "../src/features/geo-benchmark/selection.ts";
import { createSession, submitResponse, nextRound, getSessionView } from "../src/features/geo-benchmark/session.ts";
const pool = () => ({version:"synthetic-pool", places: source.places.flatMap((place, i) =>
  Array.from({length:5},(_,j)=>({...structuredClone(place),id:`fixture-${i}-${j}`,imagePath:`/images/geo-benchmark/fixture-${i}-${j}.jpg`}))
)});

test("25-photo pool enforces 5 easy, 15 medium, 5 hard",()=>{
  const input=pool(); assert.equal(parseDataset(input).places.length,25);
  for(const mutate of [p=>p.places.pop(),p=>p.places[0].difficulty="medium",p=>p.places[1].id=p.places[0].id]){
    const bad=pool();mutate(bad);assert.throws(()=>parseDataset(bad));
  }
});
test("seeded draw preserves tier order, uniqueness, coverage and input across many seeds",()=>{
  const input=pool(),snapshot=structuredClone(input),seen=new Set(),orders=new Set();
  for(let seed=0;seed<1000;seed++){
    const draw=selectRounds(input,seed);
    assert.deepEqual(draw.places.map(p=>p.difficulty),["easy","medium","medium","medium","hard"]);
    assert.equal(new Set(draw.places.map(p=>p.id)).size,5);
    draw.places.forEach(p=>seen.add(p.id));orders.add(draw.places.map(p=>p.id).join(","));
    assert.deepEqual(selectRounds(input,seed),draw);
  }
  assert.equal(seen.size,25);assert.ok(orders.size>900);assert.deepEqual(input,snapshot);
  for(const seed of [-1,NaN,Infinity,1.2,4294967296,"1"])assert.throws(()=>selectRounds(input,seed),/INVALID_SEED/);
  assert.equal(selectRounds(input,0xffffffff).places.length,5);
});
test("draw remains fixed through five rounds and final export can reproduce it",()=>{
  let session=createSession(pool(),42);const ids=session.dataset.places.map(p=>p.id);
  for(let round=0;round<5;round++){
    const before=getSessionView(session);
    assert.equal(before.photo.id,ids[round]);assert.equal(before.seed,undefined);assert.equal(before.selectedPlaceIds,undefined);
    session=submitResponse(session,{coordinates:session.dataset.places[round].coordinates,country:null,city:null,confidence:100,reasoning:"Fixture"});
    if(round<4)session=nextRound(session);
  }
  const result=getSessionView(session);
  assert.equal(result.total,25000);assert.equal(result.seed,42);
  assert.deepEqual(result.selectedPlaceIds,ids);
  assert.deepEqual(selectRounds(pool(),result.seed).places.map(p=>p.id),ids);
  assert.notDeepEqual(createSession(pool(),43).dataset.places.map(p=>p.id),ids);
});
