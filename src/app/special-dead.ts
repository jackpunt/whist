import { C } from "@thegraid/common-lib";
import type { RectShape } from "@thegraid/easeljs-lib";
import { Shape, type Graphics } from "@thegraid/easeljs-module";
import { CardShape } from "./card-shape";
import { WhistToken } from "./whist-token";

// from 'columns' project:

type Faction =  (0 | 1 | 2 | 3 | 4 | 5);
export class FacShape extends Shape {
  static bidFactions: Faction[][] = [[], [2, 4, 1, 3, ], [1, 3], [2, 4], [0]];
  static factionColors = [C.BLACK, C.RED, C.coinGold, C.BLUE, C.PURPLE, C.WHITE];

  /** a square of faction colors at [0,0] */
  facRect(bidCol: number, d2 = 20, y = 0, g = this.graphics) {
    const factions = FacShape.bidFactions[bidCol];
    const colors = factions.map(n => FacShape.factionColors[n])

    switch (colors.length) {
      case 1: this.oneRect(g, colors, d2); break;
      case 2: this.twoRect(g, colors, d2); break;
      case 4: this.fourRect(g, colors, d2); break;
    }
    this.y += y;
    return factions;
  }

  fourRect(g: Graphics, c: string[], d2 = 20, r = d2 * .05) {
    const d = d2 / 2;
    g.ss(1).s(C.black)
    g.f(c[2]).rc(-d, 0, d, d, r, 0, 0, 0)
    g.f(c[0]).rc(+0, 0, d, d, 0, r, 0, 0)
    g.f(c[1]).rc(+0, d, d, d, 0, 0, r, 0)
    g.f(c[3]).rc(-d, d, d, d, 0, 0, 0, r)
    return g
  }
  twoRect(g: Graphics, c: string[], d2 = 20, r = d2 * .05) {
    const d = d2 / 2
    g.ss(1).s(C.black)
    g.f(c[0]).rc(-d, 0, d2, d, r, r, 0, 0)
    g.f(c[1]).rc(-d, d, d2, d, 0, 0, r, r)
    return g
  }
  oneRect(g: Graphics, c: string[], d2 = 20, r = d2 * .05) {
    const d = d2 / 2
    g.ss(1).s(C.black)
    g.f(c[0]).rc(-d, 0, d2, d2, r, r, r, r)
    return g
  }
}

export class SpecialDead extends WhistToken {
  constructor(Aname: string, radius = 525) {
    super(Aname, '');
    const facShape = new FacShape(), rad = this.radius * .67;
    facShape.facRect(1, rad, -rad / 2);
    facShape.regX = -rad / 2;
    facShape.regY = rad / 2;
    facShape.rotation = 90;

    this.addChildAt(facShape, 1);
    this.paint('rgb(200,200,200)');
  }
  override get bleedColor(): string {
    return C.black;
  }
  override addImages(chars: string[]): void {
  }

  // tweak ss to match black border of col-card:
  override makeShape(size = this.radius, color = C.grey128, strokec = C.BLACK): RectShape {
    const ss = 41, safe = 25, rr = safe + 15, ar = 2.5 / 1.75;
    return new CardShape(color, strokec, size, ar, ss, rr);
  }
}
