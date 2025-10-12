import { C } from "@thegraid/common-lib";
import { RectShape } from "@thegraid/easeljs-lib";

// a 3.5 x 2.5 RoundedRect
export class CardShape extends RectShape {
  /** override to set size of your card (750px) */
  static get defaultSize() { return 750 };

  /** length short side */
  size: number;

  /**
   * * RoundedRect: stroke size straddles the rect s/2 on each side.
   * * RectShape: expand RndRect by s/2 so stroke is outside the given rect (for highlighting in Ankh/PlayerPanel).
   * * CardShape: shrink RectShape by s/2 so stroke again straddles the rect (so interior cRad works)
   *
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
    const w = (portrait ? size : size * a) - s; // shrink by s/2 on each side
    const h = (portrait ? size * a : size) - s;
    const r = rr ?? Math.max(h, w) * .05;
    super({ x: -w / 2, y: -h / 2, w, h, r, s }, fillc, strokec);
    this.size = size;
    this._cgf = this.rscgf;     // replace ()=>{} with direct function (now that we can say 'this')
    this.paint(fillc, true); // this.graphics = rscgf(...)
  }
}
