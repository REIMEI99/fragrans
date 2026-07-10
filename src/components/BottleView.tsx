import { INGREDIENT_INFO, POSITION_INFO } from "../game/data";
import { baseScoreForBottle, canStartSeal, densityScoreForBottle, orderChainLength, orderScoreForBottle } from "../game/rules";
import type { Bottle } from "../game/types";

interface BottleViewProps {
  bottle: Bottle | null;
  slotIndex: 0 | 1;
}

export function BottleView({ bottle, slotIndex }: BottleViewProps) {
  const title = slotIndex === 0 ? "I 路 Alabaster" : "II 路 Gossamer";

  if (!bottle) {
    return (
      <section className="vessel-wrap">
        <div className="vessel-neck" />
        <div className="vessel is-empty">
          {POSITION_INFO.map((slot) => (
            <div key={slot.index} className="vessel__slot vessel__slot-empty">
              <span>{slot.label}</span>
            </div>
          ))}
        </div>
        <div className="vessel-name">{title}</div>
        <p className="vessel-empty-copy">空瓶。可在这里开启新的调制路线。</p>
      </section>
    );
  }

  return (
    <section className="vessel-wrap">
      <div className="vessel-neck" />
      <div className="vessel">
        {bottle.slots.map((slot, index) => (
          <div
            key={index}
            className={`vessel__slot ${slot.ingredient ? "is-filled" : "vessel__slot-empty"}`}
            style={slot.ingredient ? ({ ["--slot-color" as string]: INGREDIENT_INFO[slot.ingredient].color }) : undefined}
          >
            {slot.ingredient ? (
              <span className="vessel__slot-filled-name">{INGREDIENT_INFO[slot.ingredient].label}</span>
            ) : (
              <span>{POSITION_INFO[index].label}</span>
            )}
          </div>
        ))}
      </div>
      <div className="vessel-name">
        {title}
        <span className={`stage-chip stage-${bottle.stage}`}>{stageLabel(bottle.stage)}</span>
      </div>
      <div className="vessel-stats">
        <span>基础 {baseScoreForBottle(bottle)}</span>
        <span>排列 {orderScoreForBottle(bottle)}</span>
        <span>最长链 {orderChainLength(bottle)}</span>
        <span>浓度 {densityScoreForBottle(bottle)}</span>
        <span>腐朽 {bottle.rotTokens}</span>
        <span>{canStartSeal(bottle) ? "可封瓶" : "未到 3 格"}</span>
      </div>
    </section>
  );
}

function stageLabel(stage: Bottle["stage"]): string {
  switch (stage) {
    case "none":
      return "未挥发";
    case "fresh":
      return "新鲜";
    case "faded":
      return "变淡";
  }
}
