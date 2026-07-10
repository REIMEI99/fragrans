import { INGREDIENT_INFO, POSITION_INFO } from "../game/data";
import { baseScoreForBottle, canStartSeal, correctnessScoreForBottle, densityScoreForBottle, orderChainLength, orderScoreForBottle } from "../game/rules";
import type { Bottle } from "../game/types";

interface BottleViewProps {
  bottle: Bottle | null;
  slotIndex: 0 | 1;
}

export function BottleView({ bottle, slotIndex }: BottleViewProps) {
  if (!bottle) {
    return (
      <section className="panel bottle empty-bottle">
        <div className="panel-header">
          <h2>{slotIndex === 0 ? "一号工作台" : "二号工作台"}</h2>
        </div>
        <p className="muted">空位。可在这里开始一瓶新香水。</p>
      </section>
    );
  }

  return (
    <section className="panel bottle">
      <div className="panel-header">
        <h2>{bottle.label}</h2>
        <span className={`stage-pill stage-${bottle.stage}`}>{stageLabel(bottle.stage)}</span>
      </div>
      <div className="sequence-grid">
        {bottle.slots.map((slot, index) => (
          <div key={index} className={`sequence-slot slot-${slot.state}`}>
            <div className="sequence-slot-header">
              <span className="slot-index">{POSITION_INFO[index].label}</span>
              <span className="muted">{POSITION_INFO[index].name}</span>
            </div>
            {slot.ingredient ? (
              <div className="sequence-slot-body">
                <span className="slot-dot" style={{ background: INGREDIENT_INFO[slot.ingredient].color }} />
                <span>{INGREDIENT_INFO[slot.ingredient].label}</span>
                <span className="muted">{densityLabel(INGREDIENT_INFO[slot.ingredient].density)}</span>
              </div>
            ) : (
              <div className="sequence-slot-body">
                <span className="muted">空</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bottle-meta">
        <span>基础分 {baseScoreForBottle(bottle)}</span>
        <span>排列分 {orderScoreForBottle(bottle)}（最长链 {orderChainLength(bottle)}）</span>
        <span>浓度分 {densityScoreForBottle(bottle)}</span>
        <span>顺调分 {correctnessScoreForBottle(bottle)}</span>
        <span>{canStartSeal(bottle) ? "3 格以上，可封瓶" : "未到 3 格"}</span>
        <span>腐朽标记 {bottle.rotTokens}</span>
      </div>
    </section>
  );
}

function densityLabel(density: "light" | "mid" | "heavy"): string {
  switch (density) {
    case "light":
      return "淡";
    case "mid":
      return "中";
    case "heavy":
      return "浓";
  }
}

function stageLabel(stage: Bottle["stage"]): string {
  switch (stage) {
    case "none":
      return "未暴露";
    case "fresh":
      return "新鲜";
    case "faded":
      return "变淡";
  }
}
