import { INGREDIENT_INFO, POSITION_INFO } from "../game/data";
import { baseScoreForBottle, canStartSeal, densityScoreForBottle, orderChainLength, orderScoreForBottle } from "../game/rules";
import type { Bottle } from "../game/types";

interface BottleViewProps {
  bottle: Bottle | null;
  slotIndex: 0 | 1;
}

export function BottleView({ bottle, slotIndex }: BottleViewProps) {
  const title = slotIndex === 0 ? "I · Alabaster" : "II · Gossamer";

  if (!bottle) {
    return (
      <section className="vessel-wrap">
        <div className="vessel-neck" />
        <div className="vessel is-empty">
          {POSITION_INFO.map((slot) => (
            <div key={slot.index} className="vessel__slot">
              <span>{slot.label}</span>
              <i className="vessel__dot" />
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
          <div key={index} className={`vessel__slot ${slot.ingredient ? "is-filled" : ""}`}>
            <div className="vessel__slot-main">
              <span>{POSITION_INFO[index].label}</span>
              <span className="vessel__slot-name">{slot.ingredient ? INGREDIENT_INFO[slot.ingredient].label : POSITION_INFO[index].name}</span>
            </div>
            <i
              className="vessel__dot"
              style={slot.ingredient ? ({ ["--slot-color" as string]: INGREDIENT_INFO[slot.ingredient].color }) : undefined}
            />
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
