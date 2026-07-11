import type { TutorialStep } from "../tutorial/types";

interface TutorialOverlayProps {
  open: boolean;
  step: TutorialStep | null;
  highlightRects: Array<{ left: number; top: number; width: number; height: number }>;
  stepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
}

function renderTutorialBody(body: string) {
  return body.split("\n").map((line, lineIndex) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    return (
      <span key={`line-${lineIndex}`} className="tutorial-card__line">
        {parts.map((part, partIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={`part-${lineIndex}-${partIndex}`}>{part.slice(2, -2)}</strong>;
          }
          return <span key={`part-${lineIndex}-${partIndex}`}>{part}</span>;
        })}
      </span>
    );
  });
}

export function TutorialOverlay({
  open,
  step,
  highlightRects,
  stepIndex,
  totalSteps,
  canGoBack,
  onBack,
  onNext,
  onExit,
}: TutorialOverlayProps) {
  if (!open || !step) {
    return null;
  }

  const manual = step.completion.type === "manual";
  const overlayWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const overlayHeight = typeof window !== "undefined" ? window.innerHeight : 0;

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <svg className="tutorial-overlay__mask" aria-hidden="true" width={overlayWidth} height={overlayHeight}>
        <defs>
          <mask id="tutorial-hole-mask">
            <rect x="0" y="0" width={overlayWidth} height={overlayHeight} fill="white" />
            {highlightRects.map((rect, index) => (
              <rect
                key={`mask-${index}-${rect.left}-${rect.top}`}
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx="10"
                ry="10"
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={overlayWidth}
          height={overlayHeight}
          fill="rgba(24, 21, 17, 0.22)"
          mask="url(#tutorial-hole-mask)"
        />
      </svg>
      {highlightRects.map((rect, index) => (
        <div
          key={`${index}-${rect.left}-${rect.top}`}
          className="tutorial-overlay__highlight"
          style={{
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          }}
        />
      ))}
      <section className="tutorial-card">
        <div className="tutorial-card__progress">
          <span className="eyebrow">Tutorial</span>
          <strong>
            {stepIndex + 1} / {totalSteps}
          </strong>
        </div>
        <h2 id="tutorial-title">{step.title}</h2>
        <div className="tutorial-card__body">{renderTutorialBody(step.body)}</div>

        <div className="tutorial-card__footer">
          <div className="tutorial-card__hint">
            {manual ? "阅读完这一条后继续。" : "请按照当前步骤进行操作，完成后会自动进入下一步。"}
          </div>
          <div className="tutorial-card__actions">
            <button type="button" onClick={onExit}>
              退出教程
            </button>
            {canGoBack ? (
              <button type="button" onClick={onBack}>
                上一步
              </button>
            ) : null}
            {manual ? (
              <button className="primary" type="button" onClick={onNext}>
                {step.primaryLabel ?? "下一步"}
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
