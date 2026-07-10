import { INGREDIENT_INFO } from "../game/data";

const LAYER_INGREDIENTS = {
  top: ["citrus", "green"],
  middle: ["floral", "fruit"],
  base: ["wood", "spice"],
} as const;

const LAYER_LABELS = {
  top: "淡香材",
  middle: "中香材",
  base: "浓香材",
} as const;

export function NoteGuide() {
  return (
    <section className="panel note-guide">
      <div className="panel-header">
        <h2>香调图鉴</h2>
        <span className="muted">可自由落位；放到对应区段时拿顺调分</span>
      </div>
      <div className="guide-grid">
        {(Object.keys(LAYER_INGREDIENTS) as Array<keyof typeof LAYER_INGREDIENTS>).map((layer) => (
          <div key={layer} className="guide-card">
            <span className="eyebrow">{LAYER_LABELS[layer]}</span>
            <div className="guide-items">
              {LAYER_INGREDIENTS[layer].map((ingredient) => (
                <div key={ingredient} className="guide-item">
                  <span
                    className="slot-dot"
                    style={{ background: INGREDIENT_INFO[ingredient].color }}
                  />
                  <span>{INGREDIENT_INFO[ingredient].label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
