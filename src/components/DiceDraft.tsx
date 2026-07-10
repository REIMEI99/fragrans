import { INGREDIENT_INFO } from "../game/data";
import type { GameState } from "../game/types";

interface DiceDraftProps {
  state: GameState;
  onToggle: (index: number) => void;
  onConfirm: () => void;
}

export function DiceDraft({ state, onToggle, onConfirm }: DiceDraftProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>香材骰池</h2>
        <span className="muted">每轮从 4 枚中选 2 枚</span>
      </div>
      <div className="dice-grid">
        {state.rolledDice.map((ingredient, index) => {
          const active = state.chosenDice.includes(index);
          return (
            <button
              key={`${state.round}-${index}`}
              className={`die-card ${active ? "active" : ""}`}
              style={{ ["--die-color" as string]: INGREDIENT_INFO[ingredient].color }}
              onClick={() => onToggle(index)}
              disabled={state.phase !== "choose"}
            >
              <span className="die-short">{INGREDIENT_INFO[ingredient].short}</span>
              <span className="die-name">{INGREDIENT_INFO[ingredient].label}</span>
            </button>
          );
        })}
      </div>
      <div className="inline-actions">
        <button className="primary" onClick={onConfirm} disabled={state.phase !== "choose" || state.chosenDice.length !== 2}>
          确认这 2 枚
        </button>
        <span className="muted">
          已选 {state.chosenDice.length} / 2
        </span>
      </div>
    </section>
  );
}
