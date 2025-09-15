import { C } from "@thegraid/common-lib";
import { RectShape } from "@thegraid/easeljs-lib";

// a 3.5 x 2.5 RoundedRect
export class CardShape extends RectShape {
  /** override to set size of your card (750px) */
  static get defaultSize() { return 750 };

  /** length short side */
  size: number;

  /**
   * RoundedRect: stroke size straddles the rect s/2 on each side.
   * RectShape: expand RndRect by s/2 so stroke is outside the given rect (for highlighting in Ankh/PlayerPanel)
   * CardShape: shrink RndRect by s   so stroke is inside the given rect
   * CardShape always centered on { x: 0, y: 0 }
   * @param fillc base color of card
   * @param strokec [C.grey64] supply '' for no stroke
   * @param size [CardShape.defaultSize] size of shorter side OR scale from defaultSize [0..3]
   * @param portrait [false] height is shorter; true -> width is shorter
   * @param ss [rad * .04] StrokeSize for outer border. (ss>0 -> outside, ss<0 -> inside)
   * @param rr [max(w,h) * .05] rounded corner radius
   */
  constructor(fillc = 'lavender', strokec = C.grey64, size = CardShape.defaultSize, portrait = false, ss?: number, rr?: number) {
    if (size <= 3) size = size * CardShape.defaultSize; // scale down for small size!
    const s = ss ?? size * .04;
    const a = 3.5 / 2.5; // aspect: length of long side relative to short side = 1.4
    const w = (portrait ? size : size * a) - 2 * s;
    const h = (portrait ? size * a : size) - 2 * s;
    const r = rr ?? Math.max(h, w) * .05;
    super({ x: -w / 2, y: -h / 2, w, h, r, s }, fillc, strokec);
    this.size = size;
    this._cgf = this.rscgf;     // replace ()=>{} with direct function (now that we can say 'this')
    this.paint(fillc, true); // this.graphics = rscgf(...)
  }

  // copied from createjs-lib.RectShape, to set: ss = 0
  override rscgf(fillc: string, g = this.g0) {
    const { x, y, w, h } = this._rect;
    const s = this.strokec ? (this._sSiz ?? 0) : 0;
    (fillc ? g.f(fillc) : g.ef());
    (this.strokec ? g.s(this.strokec) : g.es());
    if (this.strokec && (s > 0)) g.ss(s);  // use ss only if: strokec && (ss > 0)
    // DO NOT enlarge _rect to include ss;
    const ss = 0;
    if (!!this._rr) {
      const [tl, tr, br, bl] = this._rr
      g.rc(x - ss / 2, y - ss / 2, w + ss, h + ss, tl, tr, br, bl);
      // note: rc(...) is drawRoundRectComplex(x,y,w,h,rTL,rTR,rBR,rBL)
    } else if (this._cRad === 0) {
      g.dr(x - ss / 2, y - ss / 2, w + ss, h + ss);
    } else {
      g.rr(x - ss / 2, y - ss / 2, w + ss, h + ss, this._cRad);
    }
    return g;
  }
}
