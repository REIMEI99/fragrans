import { INGREDIENT_INFO } from "../game/data";

const GROUPS = {
  light: ["citrus", "green"],
  mid: ["floral", "fruit"],
  heavy: ["wood", "spice"],
} as const;

const TITLES = {
  light: "淡香材",
  mid: "中香材",
  heavy: "浓香材",
} as const;

export function NoteGuide() {
  return (
    <section className="panel panel-compact">
      <div className="panel-header">
        <h2>香调图鉴</h2>
      </div>
      <div className="guide-grid">
        {(Object.keys(GROUPS) as Array<keyof typeof GROUPS>).map((group) => (
          <div key={group} className="guide-card">
            <div className="eyebrow">{TITLES[group]}</div>
            <div className="guide-items">
              {GROUPS[group].map((ingredient) => (
                <div key={ingredient} className="guide-item">
                  <span className="slot-dot" style={{ background: INGREDIENT_INFO[ingredient].color }} />
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
