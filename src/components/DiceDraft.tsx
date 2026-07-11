import { INGREDIENT_INFO } from "../game/data";
import type { GameState } from "../game/types";

interface DiceDraftProps {
  state: GameState;
  activePlacementDie: number | null;
  onToggle: (index: number) => void;
  onConfirm: () => void;
  onSelectPlacementDie: (index: number) => void;
  registerCardRef: (index: number, node: HTMLButtonElement | null) => void;
  registerSwatchRef: (index: number, node: HTMLSpanElement | null) => void;
  registerRootRef?: (node: HTMLElement | null) => void;
  animationLocked: boolean;
  animatingDraftIndex: number | null;
}

export function DiceDraft({
  state,
  activePlacementDie,
  onToggle,
  onConfirm,
  onSelectPlacementDie,
  registerCardRef,
  registerSwatchRef,
  registerRootRef,
  animationLocked,
  animatingDraftIndex,
}: DiceDraftProps) {
  const visibleIndexes = state.phase === "place" ? state.pendingDice : state.rolledDice.map((_, index) => index);

  return (
    <section ref={registerRootRef} className={`draft-panel ${state.phase === "place" ? "is-place-mode" : ""}`}>
      <div className="draft-panel__header">
        <div>
          <div className="eyebrow">Action</div>
          <h2>{state.phase === "place" ? "先点香材，再点瓶子" : "本轮抽取两种香材"}</h2>
        </div>
        <div className="draft-panel__status">
          {state.phase === "place" ? `待放置 ${state.pendingDice.length} / 2` : `已选 ${state.chosenDice.length} / 2`}
        </div>
      </div>

      <div className={`cards ${state.phase === "place" ? "cards--placement" : ""}`}>
        {visibleIndexes.map((index) => {
          const ingredient = state.rolledDice[index];
          const chosen = state.chosenDice.includes(index);
          const pending = state.pendingDice.includes(index);
          const active = state.phase === "place" ? activePlacementDie === index : chosen;
          const animating = animatingDraftIndex === index;

          return (
            <button
              key={`${state.round}-${index}`}
              ref={(node) => registerCardRef(index, node)}
              className={`essence-card ${active ? "is-selected" : ""} ${pending ? "is-pending" : ""} ${animating ? "is-draining" : ""}`}
              style={{ ["--swatch" as string]: INGREDIENT_INFO[ingredient].color }}
              onClick={() => {
                if (state.phase === "choose") {
                  onToggle(index);
                  return;
                }
                if (state.phase === "place" && pending && !animationLocked) {
                  onSelectPlacementDie(index);
                }
              }}
              disabled={
                state.phase === "choose" ? false : state.phase === "place" ? !pending || animationLocked : true
              }
            >
              <span className="essence-card__type">{densityLabel(INGREDIENT_INFO[ingredient].density)}</span>
              <span ref={(node) => registerSwatchRef(index, node)} className="essence-card__swatch" />
              <span className="essence-card__name">{INGREDIENT_INFO[ingredient].label}</span>
              <span className="essence-card__short">{INGREDIENT_INFO[ingredient].short}</span>
            </button>
          );
        })}
      </div>

      <div className="draft-panel__footer">
        {state.phase === "choose" ? (
          <>
            <button
              className="primary seal-btn"
              onClick={onConfirm}
              disabled={state.phase !== "choose" || state.chosenDice.length !== 2}
            >
              确认这 2 个香材
            </button>
            <p className="muted">选中的两种香材必须全部使用，可以同瓶，也可以拆分到两瓶。</p>
          </>
        ) : state.phase === "place" ? (
          <p className="muted">点击一张待放置香材，它会高亮；随后点击瓶子下方按钮，将它送入对应瓶中。</p>
        ) : (
          <p className="muted">本回合香材放置已经完成，可以进入封瓶与结算阶段。</p>
        )}
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
