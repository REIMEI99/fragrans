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
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="kicker">Fragrans Prototype</p>
          <h1>余香</h1>
          <p className="hero-copy">
            这是一个先验证规则张力的 React 原型。重点不是美术，而是观察“多等一轮值不值”以及“顾客会不会改变封瓶时机”。
          </p>
        </div>
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
            固定种子（输入 -1 为随机）
            <input value={seedInput} onChange={(event) => setSeedInput(event.target.value)} inputMode="numeric" />
          </label>
          <button className="primary" type="submit">
            重新开局
          </button>
        </form>
      </section>

      <NoteGuide />
      <RulesPanel />
      <Scoreboard state={state} />

      <section className="top-grid">
        <CustomerCardView customers={state.currentCustomers} />
        <DiceDraft
          state={state}
          onToggle={(index) => applyPlayerAction({ type: "toggleDie", index })}
          onConfirm={() => applyPlayerAction({ type: "confirmChoice" })}
        />
      </section>

      <section className="workspace-grid">
        <BottleView bottle={state.bottles[0]} slotIndex={0} />
        <BottleView bottle={state.bottles[1]} slotIndex={1} />
      </section>

      <section className="bottom-grid">
        <ActionPanel
          state={state}
          onPlaceDie={(draftIndex, bottleIndex) => applyPlayerAction({ type: "placeDie", draftIndex, bottleIndex })}
          onSealBottle={(bottleIndex) => applyPlayerAction({ type: "sealBottle", bottleIndex })}
          onFinishSealPhase={() => applyPlayerAction({ type: "finishSealPhase" })}
          onFinishGame={() => applyPlayerAction({ type: "finishGame" })}
        />
        <LogPanel log={state.log} />
      </section>
    </main>
  );
}
