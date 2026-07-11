import { INGREDIENT_INFO, POSITION_INFO } from "../game/data";
import {
  baseScoreForBottle,
  canStartSeal,
  densityScoreForBottle,
  nextEmptySlotIndex,
  orderChainLength,
  orderScoreForBottle,
} from "../game/rules";
import type { Bottle } from "../game/types";

interface BottleViewProps {
  bottle: Bottle | null;
  slotIndex: 0 | 1;
  registerRootRef?: (node: HTMLElement | null) => void;
  placeMode?: boolean;
  placeLabel?: string;
  placeDisabled?: boolean;
  placeActive?: boolean;
  receiveActive?: boolean;
  onPlace?: () => void;
  registerPlaceButtonRef?: (node: HTMLButtonElement | null) => void;
  registerTargetSlotRef?: (node: HTMLDivElement | null) => void;
}

export function BottleView({
  bottle,
  slotIndex,
  registerRootRef,
  placeMode = false,
  placeLabel = "放入此瓶",
  placeDisabled = true,
  placeActive = false,
  receiveActive = false,
  onPlace,
  registerPlaceButtonRef,
  registerTargetSlotRef,
}: BottleViewProps) {
  const title = slotIndex === 0 ? "I 路 · Alabaster" : "II 路 · Gossamer";
  const previewBottle = bottle ?? {
    id: `preview-${slotIndex}`,
    label: "",
    slots: POSITION_INFO.map(() => ({ ingredient: null, state: "empty" as const })),
    stage: "none" as const,
    rotTokens: 0,
  };
  const nextSlot = nextEmptySlotIndex(previewBottle);

  if (!bottle) {
    return (
      <section ref={registerRootRef} className={`vessel-wrap ${placeActive ? "is-targeted" : ""}`}>
        <div className="vessel-neck" />
        <div className={`vessel is-empty ${receiveActive ? "is-receiving" : ""}`}>
          {POSITION_INFO.map((slot) => (
            <div key={slot.index} ref={slot.index === nextSlot ? registerTargetSlotRef : undefined} className="vessel__slot vessel__slot-empty">
              <span>{slot.label}</span>
            </div>
          ))}
        </div>
        <div className="vessel-name">{title}</div>
        <p className="vessel-empty-copy">空瓶。可以在这里开启新的调制路线。</p>
        {placeMode ? (
          <button
            ref={registerPlaceButtonRef}
            className={`vessel-action ${placeActive ? "is-active" : ""}`}
            type="button"
            disabled={placeDisabled}
            onClick={onPlace}
          >
            {placeLabel}
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section ref={registerRootRef} className={`vessel-wrap ${placeActive ? "is-targeted" : ""}`}>
      <div className="vessel-neck" />
      <div className={`vessel ${receiveActive ? "is-receiving" : ""}`}>
        {bottle.slots.map((slot, index) => (
          <div
            key={index}
            ref={!slot.ingredient && index === nextSlot ? registerTargetSlotRef : undefined}
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
      {placeMode ? (
        <button
          ref={registerPlaceButtonRef}
          className={`vessel-action ${placeActive ? "is-active" : ""}`}
          type="button"
          disabled={placeDisabled}
          onClick={onPlace}
        >
          {placeLabel}
        </button>
      ) : null}
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
