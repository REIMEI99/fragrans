import type { GameState } from "../game/types";

interface ScoreboardProps {
  state: GameState;
  registerRootRef?: (node: HTMLElement | null) => void;
}

export function Scoreboard({ state, registerRootRef }: ScoreboardProps) {
  const rotPenalty = state.bottles.reduce((sum, bottle) => sum + (bottle?.rotTokens ?? 0) * 2, 0);
  const displayScore = state.score - rotPenalty;

  return (
    <section ref={registerRootRef} className="panel panel-compact">
      <div className="panel-header">
        <h2>局面数据</h2>
      </div>
      <div className="score-list">
        <div className="score-item">
          <span className="eyebrow">Round</span>
          <strong>
            {Math.min(state.round, state.maxRounds)} / {state.maxRounds}
          </strong>
        </div>
        <div className="score-item">
          <span className="eyebrow">Score</span>
          <strong>{state.score}</strong>
        </div>
        <div className="score-item">
          <span className="eyebrow">Rot Penalty</span>
          <strong>{rotPenalty}</strong>
        </div>
        <div className="score-item">
          <span className="eyebrow">Live Total</span>
          <strong>{displayScore}</strong>
        </div>
        <div className="score-item">
          <span className="eyebrow">Phase</span>
          <strong>{phaseLabel(state.phase)}</strong>
        </div>
        <div className="score-item">
          <span className="eyebrow">Seed</span>
          <strong>{state.seed}</strong>
        </div>
      </div>
    </section>
  );
}

function phaseLabel(phase: GameState["phase"]): string {
  switch (phase) {
    case "choose":
      return "选材";
    case "place":
      return "放置";
    case "seal":
      return "封瓶";
    case "finished":
      return "结算";
  }
}
