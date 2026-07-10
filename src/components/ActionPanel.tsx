import { INGREDIENT_INFO } from "../game/data";
import { canStartSeal } from "../game/rules";
import type { Bottle, GameState } from "../game/types";

interface ActionPanelProps {
  state: GameState;
  onPlaceDie: (draftIndex: number, bottleIndex: 0 | 1) => void;
  onSealBottle: (bottleIndex: 0 | 1) => void;
  onFinishSealPhase: () => void;
  onFinishGame: () => void;
}

export function ActionPanel({
  state,
  onPlaceDie,
  onSealBottle,
  onFinishSealPhase,
  onFinishGame,
}: ActionPanelProps) {
  return (
    <section className="panel actions">
      <div className="panel-header">
        <h2>操作区</h2>
      </div>

      {state.phase === "choose" && <p className="muted">从骰池中选择 2 个香材进入本轮。</p>}

      {state.phase === "place" && (
        <>
          <p className="muted">选中的 2 个香材必须全部使用。放入同一瓶时，会自动接到当前最右侧空位。</p>
          <div className="action-stack">
            {state.pendingDice.map((draftIndex) => {
              const ingredient = state.rolledDice[draftIndex];
              return (
                <div key={draftIndex} className="pending-card">
                  <strong>{INGREDIENT_INFO[ingredient].label}</strong>
                  <div className="inline-actions">
                    {[0, 1].map((bottleIndex) => (
                      <button key={bottleIndex} onClick={() => onPlaceDie(draftIndex, bottleIndex as 0 | 1)}>
                        放入{bottleIndex === 0 ? "一号瓶" : "二号瓶"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {state.phase === "seal" && (
        <>
          <p className="muted">3 格以上香水可手动封瓶。全部决定完后，进入本轮结尾挥发。</p>
          <div className="action-stack">
            {state.bottles.map((bottle, index) => (
              <SealOption
                key={index}
                bottle={bottle}
                label={`封${index === 0 ? "一号瓶" : "二号瓶"}`}
                onClick={() => onSealBottle(index as 0 | 1)}
              />
            ))}
            <button className="primary" onClick={onFinishSealPhase}>
              进入回合结尾
            </button>
          </div>
        </>
      )}

      {state.phase === "finalAutoSeal" && (
        <>
          <p className="muted">第 {state.maxRounds} 轮已结束。剩余香水将自动封瓶，不获得顾客分。</p>
          <button className="primary" onClick={onFinishGame}>
            执行自动封瓶
          </button>
        </>
      )}

      {state.phase === "finished" && <p className="muted">本局已完成，可以更换种子继续测试。</p>}
    </section>
  );
}

function SealOption({
  bottle,
  label,
  onClick,
}: {
  bottle: Bottle | null;
  label: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} disabled={!bottle || !canStartSeal(bottle)}>
      {label}
    </button>
  );
}
