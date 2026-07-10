import { useReducer, useState } from "react";
import { ActionPanel } from "./components/ActionPanel";
import { BottleView } from "./components/BottleView";
import { CustomerCardView } from "./components/CustomerCardView";
import { DiceDraft } from "./components/DiceDraft";
import { LogPanel } from "./components/LogPanel";
import { NoteGuide } from "./components/NoteGuide";
import { RulesPanel } from "./components/RulesPanel";
import { Scoreboard } from "./components/Scoreboard";
import { gameReducer } from "./game/reducer";
import { createInitialState } from "./game/rules";
import type { GameAction } from "./game/types";

function generateRandomSeed(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0];
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(20260710));
  const [seedInput, setSeedInput] = useState(String(state.seed));

  function applyPlayerAction(action: GameAction) {
    dispatch(action);
  }

  function restartWithSeed(seed: number) {
    applyPlayerAction({ type: "start", seed });
  }

  return (
    <main className="app">
      <section className="frame">
        <div className="ornament ornament--tl" aria-hidden="true" />
        <div className="ornament ornament--br" aria-hidden="true" />

        <header className="topbar">
          <div className="brand">
            <div>
              <p className="kicker">Fragrans Prototype</p>
              <h1>余香</h1>
            </div>
            <span className="brand__slash" aria-hidden="true" />
            <p className="hero-copy">
              以 10 轮构筑两瓶香水，在长链、重复、顾客奖励与腐朽风险之间寻找最优封瓶时机。
            </p>
          </div>

          <div className="meta">
            <div className="meta-block">
              <span className="meta-label">Collection Round</span>
              <strong className="meta-value">
                {Math.min(state.round, state.maxRounds).toString().padStart(2, "0")} / {state.maxRounds}
              </strong>
            </div>
            <div className="meta-block">
              <span className="meta-label">Current Score</span>
              <strong className="meta-value">{state.score.toString().padStart(3, "0")}</strong>
            </div>
          </div>
        </header>

        <section className="seed-bar">
          <form
            className="seed-form"
            onSubmit={(event) => {
              event.preventDefault();
              const parsed = Number(seedInput);
              const nextSeed = parsed === -1 ? generateRandomSeed() : Number.isFinite(parsed) ? parsed : 20260710;
              setSeedInput(String(nextSeed));
              restartWithSeed(nextSeed);
            }}
          >
            <label>
              Seed / 输入 `-1` 随机开局
              <input value={seedInput} onChange={(event) => setSeedInput(event.target.value)} inputMode="numeric" />
            </label>
            <button className="primary" type="submit">
              重新开局
            </button>
          </form>
        </section>

        <section className="layout">
          <aside className="sidebar">
            <CustomerCardView customers={state.currentCustomers} />
            <ActionPanel
              state={state}
              onPlaceDie={(draftIndex, bottleIndex) => applyPlayerAction({ type: "placeDie", draftIndex, bottleIndex })}
              onSealBottle={(bottleIndex) => applyPlayerAction({ type: "sealBottle", bottleIndex })}
              onFinishSealPhase={() => applyPlayerAction({ type: "finishSealPhase" })}
              onFinishGame={() => applyPlayerAction({ type: "finishGame" })}
            />
            <RulesPanel />
          </aside>

          <section className="workbench" aria-label="香气调制工作台">
            <div className="vessels">
              <BottleView bottle={state.bottles[0]} slotIndex={0} />
              <BottleView bottle={state.bottles[1]} slotIndex={1} />
            </div>
            <DiceDraft
              state={state}
              onToggle={(index) => applyPlayerAction({ type: "toggleDie", index })}
              onConfirm={() => applyPlayerAction({ type: "confirmChoice" })}
            />
          </section>

          <aside className="sidebar">
            <Scoreboard state={state} />
            <NoteGuide />
            <LogPanel log={state.log} />
          </aside>
        </section>
      </section>
    </main>
  );
}
