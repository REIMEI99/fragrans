import { useEffect, useReducer, useRef, useState } from "react";
import { ActionPanel } from "./components/ActionPanel";
import { BottleView } from "./components/BottleView";
import { CustomerCardView } from "./components/CustomerCardView";
import { DiceDraft } from "./components/DiceDraft";
import { LogPanel } from "./components/LogPanel";
import { NoteGuide } from "./components/NoteGuide";
import { RulebookModal, RulesPanel } from "./components/RulesPanel";
import { Scoreboard } from "./components/Scoreboard";
import { SettlementModal } from "./components/SettlementModal";
import { gameReducer } from "./game/reducer";
import { createInitialState } from "./game/rules";
import type { GameAction } from "./game/types";

function generateRandomSeed(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0];
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(generateRandomSeed()));
  const [seedInput, setSeedInput] = useState(String(state.seed));
  const [showRulebook, setShowRulebook] = useState(true);
  const [showSettlement, setShowSettlement] = useState(false);
  const previousPhase = useRef(state.phase);

  function applyPlayerAction(action: GameAction) {
    dispatch(action);
  }

  function restartWithSeed(seed: number) {
    setShowSettlement(false);
    applyPlayerAction({ type: "start", seed });
  }

  useEffect(() => {
    if (previousPhase.current !== "finished" && state.phase === "finished") {
      setShowSettlement(true);
    }
    previousPhase.current = state.phase;
  }, [state.phase]);

  return (
    <main className="app">
      <RulebookModal open={showRulebook} onClose={() => setShowRulebook(false)} />
      <SettlementModal
        open={showSettlement}
        score={state.score}
        seed={state.seed}
        onClose={() => setShowSettlement(false)}
        onRestartRandom={() => {
          const nextSeed = generateRandomSeed();
          setSeedInput(String(nextSeed));
          restartWithSeed(nextSeed);
        }}
      />

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
              在 10 回合里调制两瓶香水，在顺序链、重复浓度、顾客奖励与腐朽风险之间寻找最优封瓶时机。
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
              const nextSeed = Number.isFinite(parsed) ? parsed : 20260710;
              setSeedInput(String(nextSeed));
              restartWithSeed(nextSeed);
            }}
          >
            <label>
              Seed / 输入种子
              <input value={seedInput} onChange={(event) => setSeedInput(event.target.value)} inputMode="numeric" />
            </label>
            <button className="primary" type="submit">
              使用种子开局
            </button>
            <button
              type="button"
              onClick={() => {
                const nextSeed = generateRandomSeed();
                setSeedInput(String(nextSeed));
                restartWithSeed(nextSeed);
              }}
            >
              随机开局
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
            <RulesPanel onOpenRulebook={() => setShowRulebook(true)} />
          </aside>

          <section className="workbench" aria-label="香水调制工作台">
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
