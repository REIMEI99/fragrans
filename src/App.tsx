import { useEffect, useReducer, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ActionPanel } from "./components/ActionPanel";
import { BottleView } from "./components/BottleView";
import { CustomerCardView } from "./components/CustomerCardView";
import { DiceDraft } from "./components/DiceDraft";
import { LogPanel } from "./components/LogPanel";
import { NoteGuide } from "./components/NoteGuide";
import { RulebookModal, RulesPanel } from "./components/RulesPanel";
import { Scoreboard } from "./components/Scoreboard";
import { SettlementModal } from "./components/SettlementModal";
import { INGREDIENT_INFO } from "./game/data";
import { canPlaceIngredient, createBottle, createInitialState } from "./game/rules";
import { gameReducer } from "./game/reducer";
import type { GameAction } from "./game/types";

function generateRandomSeed(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0];
}

interface FlightState {
  draftIndex: number;
  color: string;
  startLeft: number;
  startTop: number;
  startWidth: number;
  startHeight: number;
  deltaX: number;
  deltaY: number;
  launched: boolean;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(generateRandomSeed()));
  const [seedInput, setSeedInput] = useState(String(state.seed));
  const [showRulebook, setShowRulebook] = useState(true);
  const [showSettlement, setShowSettlement] = useState(false);
  const [activePlacementDie, setActivePlacementDie] = useState<number | null>(null);
  const [flight, setFlight] = useState<FlightState | null>(null);
  const [receivingBottle, setReceivingBottle] = useState<0 | 1 | null>(null);
  const previousPhase = useRef(state.phase);
  const flightTimerRef = useRef<number | null>(null);
  const cardRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const swatchRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const bottleButtonRefs = useRef<Record<0 | 1, HTMLButtonElement | null>>({ 0: null, 1: null });
  const bottleTargetRefs = useRef<Record<0 | 1, HTMLDivElement | null>>({ 0: null, 1: null });

  function applyPlayerAction(action: GameAction) {
    dispatch(action);
  }

  function clearPendingUiState() {
    if (flightTimerRef.current !== null) {
      window.clearTimeout(flightTimerRef.current);
      flightTimerRef.current = null;
    }
    setFlight(null);
    setReceivingBottle(null);
    setActivePlacementDie(null);
  }

  function restartWithSeed(seed: number) {
    setShowSettlement(false);
    clearPendingUiState();
    applyPlayerAction({ type: "start", seed });
  }

  useEffect(() => {
    if (previousPhase.current !== "finished" && state.phase === "finished") {
      setShowSettlement(true);
    }
    previousPhase.current = state.phase;
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "place") {
      setActivePlacementDie(null);
      return;
    }

    setActivePlacementDie((current) => {
      if (current !== null && state.pendingDice.includes(current)) {
        return current;
      }
      return state.pendingDice[0] ?? null;
    });
  }, [state.phase, state.pendingDice]);

  useEffect(() => {
    if (!flight || flight.launched) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setFlight((current) => (current ? { ...current, launched: true } : null));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [flight]);

  useEffect(() => {
    return () => {
      if (flightTimerRef.current !== null) {
        window.clearTimeout(flightTimerRef.current);
      }
    };
  }, []);

  function registerCardRef(index: number, node: HTMLButtonElement | null) {
    cardRefs.current[index] = node;
  }

  function registerSwatchRef(index: number, node: HTMLSpanElement | null) {
    swatchRefs.current[index] = node;
  }

  function registerBottleButtonRef(index: 0 | 1, node: HTMLButtonElement | null) {
    bottleButtonRefs.current[index] = node;
  }

  function registerBottleTargetRef(index: 0 | 1, node: HTMLDivElement | null) {
    bottleTargetRefs.current[index] = node;
  }

  function handlePlaceIntoBottle(bottleIndex: 0 | 1) {
    if (state.phase !== "place" || activePlacementDie === null || flight) {
      return;
    }

    const ingredient = state.rolledDice[activePlacementDie];
    const source = swatchRefs.current[activePlacementDie] ?? cardRefs.current[activePlacementDie];
    const target = bottleTargetRefs.current[bottleIndex] ?? bottleButtonRefs.current[bottleIndex];

    const commitPlacement = () => {
      applyPlayerAction({ type: "placeDie", draftIndex: activePlacementDie, bottleIndex });
      setActivePlacementDie(null);
      setFlight(null);
      flightTimerRef.current = null;
    };

    if (!source || !target) {
      commitPlacement();
      return;
    }

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    setFlight({
      draftIndex: activePlacementDie,
      color: INGREDIENT_INFO[ingredient].color,
      startLeft: sourceRect.left,
      startTop: sourceRect.top,
      startWidth: sourceRect.width,
      startHeight: sourceRect.height,
      deltaX: targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2),
      deltaY: targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2),
      launched: false,
    });
    setReceivingBottle(bottleIndex);

    flightTimerRef.current = window.setTimeout(commitPlacement, 360);
  }

  return (
    <main className="app">
      <ActionPanel
        state={state}
        onSealBottle={(bottleIndex) => applyPlayerAction({ type: "sealBottle", bottleIndex })}
        onFinishSealPhase={() => applyPlayerAction({ type: "finishSealPhase" })}
      />

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

      {flight ? (
        <div className="card-flight-layer" aria-hidden="true">
          <div
            className={`card-flight ${flight.launched ? "is-launched" : ""}`}
            style={
              {
                ["--flight-left" as string]: `${flight.startLeft}px`,
                ["--flight-top" as string]: `${flight.startTop}px`,
                ["--flight-width" as string]: `${flight.startWidth}px`,
                ["--flight-height" as string]: `${flight.startHeight}px`,
                ["--flight-x" as string]: `${flight.deltaX}px`,
                ["--flight-y" as string]: `${flight.deltaY}px`,
                ["--flight-color" as string]: flight.color,
              } as CSSProperties
            }
          >
            <div className="card-flight__burst">
              <span className="card-flight__fragment card-flight__fragment--1" />
              <span className="card-flight__fragment card-flight__fragment--2" />
              <span className="card-flight__fragment card-flight__fragment--3" />
              <span className="card-flight__fragment card-flight__fragment--4" />
              <span className="card-flight__fragment card-flight__fragment--5" />
            </div>
            <span className="card-flight__mote card-flight__mote--1" />
            <span className="card-flight__mote card-flight__mote--2" />
            <span className="card-flight__mote card-flight__mote--3" />
            <span className="card-flight__mote card-flight__mote--4" />
            <span className="card-flight__mote card-flight__mote--5" />
          </div>
        </div>
      ) : null}

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
              在 10 回合里调制香水，在顺序链、重复浓度、顾客奖励与腐朽风险之间寻找最优封瓶时机。
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
            <RulesPanel onOpenRulebook={() => setShowRulebook(true)} />
          </aside>

          <section className="workbench" aria-label="香水调制工作台">
            <div className="vessels">
              {[0, 1].map((slotIndex) => {
                const bottleIndex = slotIndex as 0 | 1;
                const bottle = state.bottles[bottleIndex];
                const currentBottle = bottle ?? createBottle(bottleIndex);
                const canPlace = state.phase === "place" && canPlaceIngredient(currentBottle);
                const ingredientLabel =
                  activePlacementDie !== null && state.phase === "place"
                    ? INGREDIENT_INFO[state.rolledDice[activePlacementDie]].label
                    : null;

                return (
                  <BottleView
                    key={bottleIndex}
                    bottle={bottle}
                    slotIndex={bottleIndex}
                    placeMode={state.phase === "place"}
                    placeLabel={ingredientLabel ? `将 ${ingredientLabel} 放入此瓶` : "先点击一张香材"}
                    placeDisabled={!canPlace || activePlacementDie === null || Boolean(flight)}
                    placeActive={state.phase === "place" && activePlacementDie !== null && canPlace && !flight}
                    receiveActive={receivingBottle === bottleIndex}
                    onPlace={() => handlePlaceIntoBottle(bottleIndex)}
                    registerPlaceButtonRef={(node) => registerBottleButtonRef(bottleIndex, node)}
                    registerTargetSlotRef={(node) => registerBottleTargetRef(bottleIndex, node)}
                />
              );
            })}
            </div>
            <DiceDraft
              state={state}
              activePlacementDie={activePlacementDie}
              onToggle={(index) => applyPlayerAction({ type: "toggleDie", index })}
              onConfirm={() => applyPlayerAction({ type: "confirmChoice" })}
              onSelectPlacementDie={(index) => setActivePlacementDie(index)}
              registerCardRef={registerCardRef}
              registerSwatchRef={registerSwatchRef}
              animationLocked={Boolean(flight)}
              animatingDraftIndex={flight?.draftIndex ?? null}
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
