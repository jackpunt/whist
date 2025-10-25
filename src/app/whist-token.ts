import { arrayN, C } from "@thegraid/common-lib";
import { AliasLoader, CenterText, CircleShape, ImageGrid, RectShape, type CountClaz, type GridSpec } from "@thegraid/easeljs-lib";
import { Shape, type Container, type DisplayObject, type Text } from "@thegraid/easeljs-module";
import { Tile } from "@thegraid/hexlib";
import { CardShape } from "./card-shape";
import { TextTweaks, type TWEAKS } from "./text-tweaks";
import { WhistCard } from "./whist-card";

/** Bonus Tokens for taking a trick */
export class WhistToken extends Tile {
  static bgcolor  = 'rgba(178, 225, 255, 1)'

  // 32 tokens (old template holds 4 * 9 = 36 cards)
  // Each char in string is numeric index into WhistToken.imageNames
  static tokens = [
    '0', '0',
    '1', '2', '3', '4',
    '11', '12', '13', '14', '22', '23', '24', '33', '34', '44',
    '112', '113', '114',
    '221', '223', '224',
    '331', '332', '334',
    '441', '442', '443',
    '234', '134', '124', '123',
  ];

  static allTokens(beg = 0, end = WhistToken.tokens.length): CountClaz[] {
    return WhistToken.tokens.slice(beg, end).map((token: string) =>
      [1, WhistToken, token, ...token.split('').map(c => Number.parseInt(c))]
    );
  }
  /** image name to load, and suit name in cards */
  static imageNames = [
    'arrows', 'sword', 'staff', 'stars', 'knives', // yellow, grey, purple, blue, red
  ]

  /** old mini card landscape */
  // static cardSingle_1_75 = {
  //   width: 3600, height: 5400, nrow: 9, ncol: 4, cardw: 750, cardh: 525, double: false,
  //   x0: 258 + 1.75 * 150 + 30, y0: 96 + 1.75 * 150 + 30, delx: 833, dely: 578.25, bleed: 25,
  // };
  /** new PPG mini-card portrait */
  static cardSingle_1_75 = {
    width: 3600, height: 5400, nrow: 6, ncol: 5, cardh: 525, cardw: 750, double: false, split: true,
    x0: 334 + 1.75 * 150   , y0: 150 + 2.5 * 150, delx: 600, dely: 825, bleed: 30,  // (2705-305)/4, (1770-120)/2
  } as GridSpec;
  /** new PPG mini-card portrait */
  static cardDouble_1_75 = {
    width: 3600, height: 5400, nrow: 3, ncol: 5, cardh: 525, cardw: 750, double: true,
    x0: 334 + 1.75 * 150   , y0: 150 + 2.5 * 150, delx: 600, dely: 825, bleed: 30,  // (2705-305)/4, (1770-120)/2
  }
  static rotateBack = 0;

  static gridSpec0 = ImageGrid.cardDouble_1_75;
  static gridSpec = WhistToken.cardSingle_1_75;

  override get radius() { return WhistToken.gridSpec.cardh! } // nextRadius (small dimension)

  // WARN: invoked by constructor.super() BEFORE this.color is set
  override makeShape(size = this.radius, color = C.grey128, strokec = color): RectShape {
    const ss = 2, safe = 25, rr = safe + 15, ar = 2.5 / 1.75
    return new CardShape(color, strokec, size, ar, ss, rr);
  }

  declare baseShape: RectShape;
  // called by TileExporter.composeTile
  override makeBleed(bleed: number): DisplayObject {
    const bs = this.baseShape;
    const { x, y, w, h } = bs._rect, ss = bs._sSiz, b = ss / 2 + bleed;
    // enlarge by 'bleed'; add corner radius and stroke size
    const xywhrs = { x: x - b, y: y - b, w: w + b * 2, h: h + b * 2, r: 2 * (bleed + 5), s: ss }; // r=70 2*(bleed+5)
    const rv = new RectShape(xywhrs, bs.strokec, ''); // (xywhrs, fillc, strokec)
    rv.rotation = this.rotation
    // rv.visible = false;
    return rv;
  }

  constructor(Aname: string, ... chars: string[]) {
    super(Aname);
    this.addImages(chars)
  }

  /**
   * return the scaled icon image (no Ninjas)
   * @param n index into imageNames
   * @param w width of scaled image
   * @returns Bitmap
   */
  suitImage(n: number, w = 50) {
    const name = WhistToken.imageNames[n];
    const bitmap = AliasLoader.loader.getBitmap(name, w);
    return bitmap;
  }

  /** add components to this card */
  addImages(chars: string[]) {
    const nums = chars.map(c => Number.parseInt(c));
    const cardw = WhistToken.gridSpec.cardw!; // the long direction!
    const n = nums.length;
    const rad = cardw * .1;
    nums.forEach((ndx, nth) => {
      const suit = WhistToken.imageNames[ndx]; // suit name
      const card = WhistCard.cards.find((card) => card.Aname == suit)!;
      const color = WhistCard.cmap[card.color];
      const circ = new CircleShape(color, rad * 1.2, '');
      const bm = this.suitImage(ndx, rad * 2)
      const seq = (nth + 1) / (n + 1) - 1 / 2;
      circ.y = bm.y = seq * (cardw + rad);
      circ.x = bm.x = 0;
      this.addChild(circ, bm)
    })
  }
}

/** back of trick bonus cards */
export class BonusBack extends WhistToken {
  tweaker: TextTweaks = new TextTweaks(this);
  constructor(Aname: string, ...strings: string[]) {
    super(Aname, ...strings);
    this.addStrings(strings)
  }

  // WARN: invoked by constructor.super() BEFORE this.color is set
  override makeShape(size = this.radius, color = C.briteGold, strokec = color): RectShape {
    return super.makeShape(size, color, strokec);
  }
  override addImages(): void {}
  addStrings(strings: string[]) {
    if (!this.tweaker) return; // super constructor...
    const backText = strings[0];
    const font = WhistCard.rankFont;
    const width = this.getBounds().width;
    const tweaks = { align: 'center', baseline: 'middle' } as TWEAKS;
    this.tweaker.setTextFrag(backText, font, { color: 'black', dx: .005 * width, rotation: -90, ...tweaks });
  }
}

class PointTweaks extends TextTweaks {
  override glyphRE = /[<^v>]/g; //

  override setGlyph(cont: Container, fragt: Text, trigger: string, linex = 0, liney = 0): number {
    const dx = 0;
    const glyph = new Shape(), g = glyph.graphics;
    const rot = trigger == '^' ? -90 : trigger == 'v' ? 90 : trigger == '<' ? 180 : 0;
    g.f('black').drawPolyStar(0, 0, 30, 3, 0, rot);
    glyph.x = linex;
    glyph.y = liney;
    this.cont.addChild(glyph)
    return dx;
  }
}

export class PointsBack extends WhistToken {
  tweaker: TextTweaks = new PointTweaks(this);
  constructor(Aname: string, ...strings: string[]) {
    super(Aname, ...strings);
    this.addStrings(strings)
  }

  // WARN: invoked by constructor.super() BEFORE this.color is set
  override makeShape(size = this.radius, color = WhistToken.bgcolor, strokec = color): RectShape {
    return super.makeShape(size, color, strokec);
  }
  override addImages(): void {} // disable
  // label on back, 4 arrow/carets
  addStrings(strings: string[]) {
    const { x, y, width, height } = this.getBounds();
    const backText = strings[0];
    const font = WhistCard.ptFont;
    const backFont = WhistCard.backFont;
    const tweaks = { align: 'center', baseline: 'bottom' } as TWEAKS; // with newline: 'bottom'
    this.tweaker.setTextFrag(backText, font, { color: 'black', dx: .005 * width, rotation: -90, ...tweaks });

    this.tweaker.setFragWithGlyphs('^', backFont, { ...tweaks, dx: 0, dy: y })
    this.tweaker.setFragWithGlyphs('\n\n0', backFont, { ...tweaks, dx: 0, dy: y })

    this.tweaker.setFragWithGlyphs('v', backFont, { ...tweaks, dx: 0, dy: y + height })
    this.tweaker.setFragWithGlyphs('20', backFont, { ...tweaks, dx: 0, dy: y + height - 90, baseline: 'bottom', rotation: 180 })

    this.tweaker.setFragWithGlyphs('<', backFont, { ...tweaks, dx: x, dy: 0 })
    this.tweaker.setFragWithGlyphs('10', backFont, { ...tweaks, dx: x + 60, dy: 0, align: 'center', baseline: 'middle', rotation: -90 })

    this.tweaker.setFragWithGlyphs('>', backFont, { ...tweaks, dx: x + width, dy: 0, })
    this.tweaker.setFragWithGlyphs('30', backFont, { ...tweaks, dx: x + width - 60, dy: 0, align: 'center', baseline: 'middle', rotation: 90 })
  }
}

export class PointCounter extends WhistToken {

  /** locate 8 points */
  static numPoints = (token: WhistToken) => {
    const { x, y, width, height } = token.getBounds();
    const insid = 0, dny1 = 180, intop = width * .2, dntop = 0 * height / 525;

  }

  constructor(name = 'Points', ...args: string[]) {
    const chars = (args.length > 0) ? args : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '10'];
    super(name, ...chars)
  }
  // WARN: invoked by constructor.super() BEFORE this.color is set
  /** assert default fillc, strokec */
  override makeShape(size = this.radius, color = WhistToken.bgcolor, strokec = color): RectShape {
    return super.makeShape(size, color, strokec);
  }

  override addImages(chars: string[]) {
    // TODO: arrange numbers in array on card
    const font = WhistCard.ptFont;
    const { width, height } = this.getBounds()
    const dw = .3 * width, dh = .1 * height;
    const cols = [1, 3, 5, 1, 3, 5, 1, 3, 5, 3,];
    const rows = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3,];
    arrayN(10, 1).forEach((c, n) => {
      const num = new CenterText(`${c}`, font);
      const col = [-3, -2, -1, 0, 1, 2][cols[n]];
      num.x = col * dw * (2/3);
      num.y = (-3.2 + 2.0 * rows[n]) * dh;
      this.addChild(num);
    })
  }
}

export class BidCounter extends PointCounter {
    constructor(name = 'Bid', ...args: string[]) {
      super(name, ...args);
  }

  override makeShape(size = this.radius, color = C.grey224, strokec = color): RectShape {
    return super.makeShape(size, color, strokec);
  }

  override addImages(chars: string[]): void {
    const font = WhistCard.rankFont;
    const { width, height } = this.getBounds()
    const locs = [{ x: -1, y: 0, a: 90 }, { x: 0, y: -1, a: 180 }, { x: 1, y: 0, a: -90 }, { x: 0, y: 1, a: 0 }]
    chars.forEach((c, n) => {
      const { x, y, a } = locs[n];
      const num = new CenterText(c, font);
      num.rotation = a;
      num.x = x * width * .4;
      num.y = y * height * .4;
      this.addChild(num);
    })

  }
}
