import { useEffect, useState } from "react";
import {
  BENCHMARK_SAMPLE_SIZE,
  BENCHMARK_STRATEGIES,
  benchmarkTierLabel,
  percentileForScore,
} from "../game/benchmark";

interface SettlementModalProps {
  open: boolean;
  score: number;
  seed: number;
  onClose: () => void;
  onRestartRandom: () => void;
}

export function SettlementModal({
  open,
  score,
  seed,
  onClose,
  onRestartRandom,
}: SettlementModalProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }

    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 1400);
    return () => window.clearTimeout(timer);
  }, [open, score]);

  if (!open) {
    return null;
  }

  const percentile = percentileForScore(score);
  const tier = benchmarkTierLabel(percentile);

  return (
    <div className="rulebook-backdrop" role="dialog" aria-modal="true" aria-labelledby="settlement-title">
      <section className="rulebook settlement">
        <div className="panel-header">
          <h2 id="settlement-title">本局结算</h2>
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </div>

        {!ready ? (
          <div className="settlement__loading">
            <div className="eyebrow">Comparing Records</div>
            <h3>正在比对其他调香师的对局记录</h3>
            <p>
              使用 {BENCHMARK_STRATEGIES.join(" / ")} 四种策略，共 {BENCHMARK_SAMPLE_SIZE} 局模拟数据进行结算中。
            </p>
          </div>
        ) : (
          <div className="settlement__body">
            <div className="settlement__hero">
              <div className="eyebrow">Final Score</div>
              <strong>{score}</strong>
              <p>{tier}</p>
            </div>

            <div className="settlement__stats">
              <article className="brief">
                <div className="eyebrow">排名反馈</div>
                <h3>你战胜了 {percentile}% 的模拟调香师</h3>
                <p>这是拿你的最终分数，和离线模拟出的 `greedy / growth / density / order` 四类对手总样本做直接比较后的结果。</p>
              </article>

              <article className="brief">
                <div className="eyebrow">本局信息</div>
                <h3>本局种子：{seed}</h3>
                <p>如果你想复盘这一局或分享给别人，可以直接记录这个 seed。相同 seed 会得到相同开局序列。</p>
              </article>
            </div>

            <div className="settlement__actions">
              <button className="primary" type="button" onClick={onRestartRandom}>
                再来一局随机开局
              </button>
              <button type="button" onClick={onClose}>
                留在结算页
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
