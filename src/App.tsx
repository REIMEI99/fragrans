import { useEffect, useMemo, useReducer, useRef, useState } from "react";
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
import { TutorialOverlay } from "./components/TutorialOverlay";
import { INGREDIENT_INFO } from "./game/data";
import { canPlaceIngredient, createBottle, createInitialState } from "./game/rules";
import { gameReducer } from "./game/reducer";
import type { GameAction, GameState } from "./game/types";
import { TUTORIAL_STEPS } from "./tutorial/script";
import type { TutorialHighlightTarget, TutorialSession } from "./tutorial/types";

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

function sortIndexes(indexes: number[]): number[] {
  return [...indexes].sort((left, right) => left - right);
}

const TUTORIAL_COOKIE = "fragrans_tutorial_seen";

function hasSeenTutorialCookie(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return document.cookie.split("; ").some((entry) => entry === `${TUTORIAL_COOKIE}=1`);
}

function markTutorialCookie(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${TUTORIAL_COOKIE}=1; max-age=31536000; path=/; samesite=lax`;
}

function createInitialTutorialSession(): TutorialSession {
  if (!hasSeenTutorialCookie()) {
    markTutorialCookie();
    return { mode: "active", stepIndex: 0 };
  }
  return { mode: "inactive", stepIndex: 0 };
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(generateRandomSeed()));
  const [seedInput, setSeedInput] = useState(String(state.seed));
  const [showRulebook, setShowRulebook] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [tutorialSession, setTutorialSession] = useState<TutorialSession>(() => createInitialTutorialSession());
  const [tutorialChosenDice, setTutorialChosenDice] = useState<number[]>([]);
  const [activePlacementDie, setActivePlacementDie] = useState<number | null>(null);
  const [flight, setFlight] = useState<FlightState | null>(null);
  const [receivingBottle, setReceivingBottle] = useState<0 | 1 | null>(null);
  const previousPhase = useRef(state.phase);
  const flightTimerRef = useRef<number | null>(null);
  const cardRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const swatchRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const bottleButtonRefs = useRef<Record<0 | 1, HTMLButtonElement | null>>({ 0: null, 1: null });
  const bottleTargetRefs = useRef<Record<0 | 1, HTMLDivElement | null>>({ 0: null, 1: null });
  const tutorialTargetRefs = useRef<Record<string, HTMLElement | null>>({});
  const [highlightRects, setHighlightRects] = useState<Array<{ left: number; top: number; width: number; height: number }>>([]);

  const tutorialActive = tutorialSession.mode === "active";
  const tutorialStep = tutorialActive ? TUTORIAL_STEPS[tutorialSession.stepIndex] : null;

  const displayState: GameState = useMemo(() => {
    if (!tutorialStep) {
      return state;
    }
    if (tutorialStep.completion.type === "confirm_choice") {
      return { ...tutorialStep.board, chosenDice: tutorialChosenDice };
    }
    return tutorialStep.board;
  }, [state, tutorialStep, tutorialChosenDice]);

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
    setTutorialChosenDice([]);
  }

  function restartWithSeed(seed: number) {
    setShowSettlement(false);
    clearPendingUiState();
    setTutorialSession({ mode: "inactive", stepIndex: 0 });
    applyPlayerAction({ type: "start", seed });
  }

  function startTutorial() {
    clearPendingUiState();
    setShowRulebook(false);
    setShowSettlement(false);
    setTutorialSession({ mode: "active", stepIndex: 0 });
  }

  function exitTutorial() {
    clearPendingUiState();
    setTutorialSession({ mode: "inactive", stepIndex: 0 });
  }

  function goToTutorialStep(index: number) {
    clearPendingUiState();
    if (index >= TUTORIAL_STEPS.length) {
      setTutorialSession({ mode: "completed", stepIndex: TUTORIAL_STEPS.length - 1 });
      exitTutorial();
      return;
    }
    setTutorialSession({ mode: "active", stepIndex: index });
  }

  function nextTutorialStep() {
    goToTutorialStep(tutorialSession.stepIndex + 1);
  }

  function prevTutorialStep() {
    if (tutorialSession.stepIndex > 0) {
      goToTutorialStep(tutorialSession.stepIndex - 1);
    }
  }

  useEffect(() => {
    if (previousPhase.current !== "finished" && state.phase === "finished" && !tutorialActive) {
      setShowSettlement(true);
    }
    previousPhase.current = state.phase;
  }, [state.phase, tutorialActive]);

  useEffect(() => {
    if (displayState.phase !== "place") {
      setActivePlacementDie(null);
      return;
    }

    setActivePlacementDie((current) => {
      if (current !== null && displayState.pendingDice.includes(current)) {
        return current;
      }
      return displayState.pendingDice[0] ?? null;
    });
  }, [displayState.phase, displayState.pendingDice]);

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

  useEffect(() => {
    if (!tutorialActive || !tutorialStep) {
      Object.values(tutorialTargetRefs.current).forEach((node) => {
        node?.classList.remove("tutorial-focus-target");
      });
      Object.values(cardRefs.current).forEach((node) => {
        node?.classList.remove("tutorial-focus-target");
      });
      setHighlightRects([]);
      return;
    }

    const updateRects = () => {
      const targetNodes = tutorialStep.highlightTargets
        .map((target) => resolveTutorialTarget(target))
        .filter((node): node is HTMLElement => Boolean(node));

      Object.values(tutorialTargetRefs.current).forEach((node) => {
        node?.classList.remove("tutorial-focus-target");
      });
      Object.values(cardRefs.current).forEach((node) => {
        node?.classList.remove("tutorial-focus-target");
      });
      targetNodes.forEach((node) => {
        node.classList.add("tutorial-focus-target");
      });

      const rects = targetNodes
        .filter((node): node is HTMLElement => Boolean(node))
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          };
        });
      setHighlightRects(rects);
    };

    const firstTarget = tutorialStep.highlightTargets
      .map((target) => resolveTutorialTarget(target))
      .find((node): node is HTMLElement => Boolean(node));

    if (firstTarget) {
      firstTarget.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }

    updateRects();
    window.addEventListener("resize", updateRects);
    window.addEventListener("scroll", updateRects, { passive: true });

    return () => {
      Object.values(tutorialTargetRefs.current).forEach((node) => {
        node?.classList.remove("tutorial-focus-target");
      });
      Object.values(cardRefs.current).forEach((node) => {
        node?.classList.remove("tutorial-focus-target");
      });
      window.removeEventListener("resize", updateRects);
      window.removeEventListener("scroll", updateRects);
    };
  }, [tutorialActive, tutorialStep, displayState]);

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

  function registerTutorialTarget(target: string, node: HTMLElement | null) {
    tutorialTargetRefs.current[target] = node;
  }

  function resolveTutorialTarget(target: TutorialHighlightTarget): HTMLElement | null {
    if (target === "draft-card-0") {
      return cardRefs.current[0] ?? null;
    }
    if (target === "draft-card-1") {
      return cardRefs.current[1] ?? null;
    }
    return tutorialTargetRefs.current[target] ?? null;
  }

  function handleToggleDie(index: number) {
    if (!tutorialStep) {
      applyPlayerAction({ type: "toggleDie", index });
      return;
    }

    if (tutorialStep.completion.type !== "confirm_choice") {
      return;
    }

    const expectedIndexes = tutorialStep.completion.draftIndexes;

    if (!expectedIndexes.includes(index)) {
      return;
    }

    setTutorialChosenDice((current) => {
      if (current.includes(index)) {
        return current.filter((item) => item !== index);
      }
      if (current.length >= expectedIndexes.length) {
        return current;
      }
      return [...current, index];
    });
  }

  function handleConfirmChoice() {
    if (!tutorialStep) {
      applyPlayerAction({ type: "confirmChoice" });
      return;
    }

    if (tutorialStep.completion.type !== "confirm_choice") {
      return;
    }

    const expected = sortIndexes(tutorialStep.completion.draftIndexes);
    const chosen = sortIndexes(tutorialChosenDice);
    if (JSON.stringify(expected) !== JSON.stringify(chosen)) {
      return;
    }

    nextTutorialStep();
  }

  function handleSelectPlacementDie(index: number) {
    if (!tutorialStep) {
      setActivePlacementDie(index);
      return;
    }

    if (tutorialStep.completion.type !== "place_die") {
      return;
    }

    if (index !== tutorialStep.completion.draftIndex) {
      return;
    }

    setActivePlacementDie(index);
  }

  function handlePlaceIntoBottle(bottleIndex: 0 | 1) {
    if (displayState.phase !== "place" || activePlacementDie === null || flight) {
      return;
    }

    if (tutorialStep) {
      if (tutorialStep.completion.type !== "place_die") {
        return;
      }
      if (tutorialStep.completion.draftIndex !== activePlacementDie || tutorialStep.completion.bottleIndex !== bottleIndex) {
        return;
      }
    }

    const ingredient = displayState.rolledDice[activePlacementDie];
    const source = swatchRefs.current[activePlacementDie] ?? cardRefs.current[activePlacementDie];
    const target = bottleTargetRefs.current[bottleIndex] ?? bottleButtonRefs.current[bottleIndex];

    const commitPlacement = () => {
      if (tutorialStep) {
        nextTutorialStep();
      } else {
        applyPlayerAction({ type: "placeDie", draftIndex: activePlacementDie, bottleIndex });
      }
      setActivePlacementDie(null);
      setFlight(null);
      setReceivingBottle(null);
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

  function handleSealBottle(bottleIndex: 0 | 1) {
    if (tutorialStep) {
      if (tutorialStep.completion.type === "seal_bottle" && tutorialStep.completion.bottleIndex === bottleIndex) {
        nextTutorialStep();
      }
      return;
    }
    applyPlayerAction({ type: "sealBottle", bottleIndex });
  }

  function handleFinishSealPhase() {
    if (tutorialStep) {
      if (tutorialStep.completion.type === "finish_round") {
        nextTutorialStep();
      }
      return;
    }
    applyPlayerAction({ type: "finishSealPhase" });
  }

  return (
    <main className={`app ${tutorialActive ? "is-tutorial-mode" : ""}`}>
      <ActionPanel
        state={displayState}
        onSealBottle={handleSealBottle}
        onFinishSealPhase={handleFinishSealPhase}
        registerRootRef={(node) => registerTutorialTarget("top-action-bar", node)}
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
      <TutorialOverlay
        open={tutorialActive}
        step={tutorialStep}
        highlightRects={highlightRects}
        stepIndex={tutorialSession.stepIndex}
        totalSteps={TUTORIAL_STEPS.length}
        canGoBack={tutorialSession.stepIndex > 0}
        onBack={prevTutorialStep}
        onNext={nextTutorialStep}
        onExit={exitTutorial}
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
                {Math.min(displayState.round, displayState.maxRounds).toString().padStart(2, "0")} / {displayState.maxRounds}
              </strong>
            </div>
            <div className="meta-block">
              <span className="meta-label">Current Score</span>
              <strong className="meta-value">{displayState.score.toString().padStart(3, "0")}</strong>
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
            <button type="button" onClick={startTutorial}>
              新手教程
            </button>
          </form>
        </section>

        <section className="layout">
          <aside className="sidebar">
            <CustomerCardView
              customers={displayState.currentCustomers}
              registerRootRef={(node) => registerTutorialTarget("customer-pool", node)}
            />
            <RulesPanel onOpenRulebook={() => setShowRulebook(true)} onStartTutorial={startTutorial} />
          </aside>

          <section className="workbench" aria-label="香水调制工作台">
            <div className="vessels">
              {[0, 1].map((slotIndex) => {
                const bottleIndex = slotIndex as 0 | 1;
                const bottle = displayState.bottles[bottleIndex];
                const currentBottle = bottle ?? createBottle(bottleIndex);
                const canPlace = displayState.phase === "place" && canPlaceIngredient(currentBottle);
                const ingredientLabel =
                  activePlacementDie !== null && displayState.phase === "place"
                    ? INGREDIENT_INFO[displayState.rolledDice[activePlacementDie]].label
                    : null;

                return (
                  <BottleView
                    key={bottleIndex}
                    bottle={bottle}
                    slotIndex={bottleIndex}
                    registerRootRef={(node) => registerTutorialTarget(`bottle-${bottleIndex}`, node)}
                    placeMode={displayState.phase === "place"}
                    placeLabel={ingredientLabel ? `将 ${ingredientLabel} 放入此瓶` : "先点击一张香材"}
                    placeDisabled={!canPlace || activePlacementDie === null || Boolean(flight)}
                    placeActive={displayState.phase === "place" && activePlacementDie !== null && canPlace && !flight}
                    receiveActive={receivingBottle === bottleIndex}
                    onPlace={() => handlePlaceIntoBottle(bottleIndex)}
                    registerPlaceButtonRef={(node) => registerBottleButtonRef(bottleIndex, node)}
                    registerTargetSlotRef={(node) => registerBottleTargetRef(bottleIndex, node)}
                  />
                );
              })}
            </div>
            <DiceDraft
              state={displayState}
              activePlacementDie={activePlacementDie}
              onToggle={handleToggleDie}
              onConfirm={handleConfirmChoice}
              onSelectPlacementDie={handleSelectPlacementDie}
              registerCardRef={registerCardRef}
              registerSwatchRef={registerSwatchRef}
              registerRootRef={(node) => registerTutorialTarget("draft-panel", node)}
              animationLocked={Boolean(flight)}
              animatingDraftIndex={flight?.draftIndex ?? null}
            />
          </section>

          <aside className="sidebar">
            <Scoreboard state={displayState} registerRootRef={(node) => registerTutorialTarget("score-panel", node)} />
            <NoteGuide />
            <LogPanel log={displayState.log} />
          </aside>
        </section>
      </section>
    </main>
  );
}
