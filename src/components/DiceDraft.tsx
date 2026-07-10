import { INGREDIENT_INFO } from "../game/data";
import type { GameState } from "../game/types";

interface DiceDraftProps {
  state: GameState;
  onToggle: (index: number) => void;
  onConfirm: () => void;
}

export function DiceDraft({ state, onToggle, onConfirm }: DiceDraftProps) {
  return (
    <section className="draft-panel">
      <div className="draft-panel__header">
        <div>
          <div className="eyebrow">Action</div>
          <h2>本轮萃取两种香材</h2>
        </div>
        <div className="draft-panel__status">已选 {state.chosenDice.length} / 2</div>
      </div>

      <div className="cards">
        {state.rolledDice.map((ingredient, index) => {
          const active = state.chosenDice.includes(index);
          return (
            <button
              key={`${state.round}-${index}`}
              className={`essence-card ${active ? "is-selected" : ""}`}
              style={{ ["--swatch" as string]: INGREDIENT_INFO[ingredient].color }}
              onClick={() => onToggle(index)}
              disabled={state.phase !== "choose"}
            >
              <span className="essence-card__type">{densityLabel(INGREDIENT_INFO[ingredient].density)}</span>
              <span className="essence-card__swatch" />
              <span className="essence-card__name">{INGREDIENT_INFO[ingredient].label}</span>
              <span className="essence-card__short">{INGREDIENT_INFO[ingredient].short}</span>
            </button>
          );
        })}
      </div>

      <div className="draft-panel__footer">
        <button className="primary seal-btn" onClick={onConfirm} disabled={state.phase !== "choose" || state.chosenDice.length !== 2}>
          确认这 2 个香材
        </button>
        <p className="muted">选中的两种香材必须全部使用，可以同瓶，也可以拆分到两瓶。</p>
      </div>
    </section>
  );
}

function densityLabel(density: "light" | "mid" | "heavy"): string {
  switch (density) {
    case "light":
      return "Light";
    case "mid":
      return "Middle";
    case "heavy":
      return "Heavy";
  }
}
