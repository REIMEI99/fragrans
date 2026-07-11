import { canStartSeal } from "../game/rules";
import type { GameState } from "../game/types";

interface ActionPanelProps {
  state: GameState;
  onSealBottle: (bottleIndex: 0 | 1) => void;
  onFinishSealPhase: () => void;
  registerRootRef?: (node: HTMLElement | null) => void;
}

export function ActionPanel({ state, onSealBottle, onFinishSealPhase, registerRootRef }: ActionPanelProps) {
  const canSealLeft = state.phase === "seal" && Boolean(state.bottles[0]) && canStartSeal(state.bottles[0]!);
  const canSealRight = state.phase === "seal" && Boolean(state.bottles[1]) && canStartSeal(state.bottles[1]!);
  const canFinishSeal = state.phase === "seal";

  return (
    <section ref={registerRootRef} className="top-action-bar" aria-label="操作栏">
      <div className="top-action-bar__inner">
        <div className="top-action-bar__meta">
          <span className="eyebrow">Action Bar</span>
          <strong>{phaseHint(state)}</strong>
        </div>

        <div className="top-action-bar__actions">
          <button
            className={`top-action-btn ${canSealLeft ? "is-live" : ""}`}
            type="button"
            disabled={!canSealLeft}
            onClick={() => onSealBottle(0)}
          >
            封一号瓶
          </button>
          <button
            className={`top-action-btn ${canSealRight ? "is-live" : ""}`}
            type="button"
            disabled={!canSealRight}
            onClick={() => onSealBottle(1)}
          >
            封二号瓶
          </button>
          <button
            className={`top-action-btn ${canFinishSeal ? "is-live" : ""}`}
            type="button"
            disabled={!canFinishSeal}
            onClick={onFinishSealPhase}
          >
            回合结束
          </button>
        </div>
      </div>
    </section>
  );
}

function phaseHint(state: GameState): string {
  switch (state.phase) {
    case "choose":
      return "先选 2 张香材";
    case "place":
      return "先点香材，再点瓶子";
    case "seal":
      return "可封瓶，或结束回合";
    case "finished":
      return "本局已结算";
  }
}
