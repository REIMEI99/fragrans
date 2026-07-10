import type { GameState } from "../game/types";

interface ScoreboardProps {
  state: GameState;
}

export function Scoreboard({ state }: ScoreboardProps) {
  const rotPenalty = state.bottles.reduce((sum, bottle) => sum + (bottle?.rotTokens ?? 0) * 2, 0);
  const displayScore = state.score - rotPenalty;

  return (
    <section className="panel scoreboard">
      <div>
        <span className="eyebrow">轮次</span>
        <strong>
          {Math.min(state.round, state.maxRounds)} / {state.maxRounds}
        </strong>
      </div>
      <div>
        <span className="eyebrow">已得分</span>
        <strong>{state.score}</strong>
      </div>
      <div>
        <span className="eyebrow">当前腐朽扣分</span>
        <strong>{rotPenalty}</strong>
      </div>
      <div>
        <span className="eyebrow">当前总分</span>
        <strong>{displayScore}</strong>
      </div>
      <div>
        <span className="eyebrow">阶段</span>
        <strong>{phaseLabel(state.phase)}</strong>
      </div>
      <div>
        <span className="eyebrow">种子</span>
        <strong>{state.seed}</strong>
      </div>
    </section>
  );
}

function phaseLabel(phase: GameState["phase"]): string {
  switch (phase) {
    case "choose":
      return "选骰";
    case "place":
      return "放置";
    case "seal":
      return "封瓶";
    case "finalAutoSeal":
      return "终局自动封瓶";
    case "finished":
      return "结算";
  }
}
