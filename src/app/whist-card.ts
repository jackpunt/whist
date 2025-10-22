import { C, F, type XYWH } from "@thegraid/common-lib";
import { AliasLoader, CenterText, ImageGrid, NamedContainer, RectShape, type CountClaz, type GridSpec, type Paintable } from "@thegraid/easeljs-lib";
import { Container, Graphics, type DisplayObject, type Rectangle } from "@thegraid/easeljs-module";
import { Tile } from "@thegraid/hexlib";
import { CardShape } from "./card-shape";
import { TextTweaks, type TWEAKS } from "./text-tweaks";

// Aname: suit, color: bgcolor, y0: image offset, ranks: all the cards to make
type CARD = {
  Aname: string, color: string, x0?: number, y0?: number, ranks: string[],
};

export class PaintableCont extends NamedContainer implements Paintable {
  constructor(Aname = '', cx = 0, cy = 0) {
    super(Aname, cx, cy);
  }
  paint(colorn?: string, force?: boolean): Graphics {
    let rv = new Graphics();
    this.children.forEach(child => {
      const pc = child as Paintable;
      if (typeof pc.paint == 'function') {
        rv = pc.paint(colorn, force); // capture the last Paintable Graphics
      }
    })
    return rv;
  }

  calcBounds(): XYWH {
    const { x, y, width: w, height: h } = this.getBounds();
    return {x, y, w, h};
  }

  /** ensure PaintableCont is cached; uses getBounds() ?? calcBounds().
   *
   * copied from PaintableShape
   *
   * @param scale [1] scale to use if cache is created
   */
  setCacheID(scale = 1) {
    if (this.cacheID) return;  // also: if already cached, get/setBounds is useless
    let b = this.getBounds() as Pick<Rectangle, 'x' | 'y' | 'width' | 'height'>
    if (!b) {
      const { x, y, w, h } = this.calcBounds();
      b = { x, y, width: w, height: h }
    }
    this.cache(b.x, b.y, b.width, b.height, scale);
  }
}

// from cubitos...
export class WhistCard extends Tile  {
  // Select family with fontLead:

  // static family = 'SF Compact Rounded'; static fontLead = 0;
  // static family = 'Nunito'; static fontLead = 0;
  // static family = 'Futura'; static fontLead = 12; // Futura steps on itself..
  // static family = 'DIN Alternate'; static fontLead = -10;
  static family = 'Arial Narrow'; static fontLead = 4;
  // static family = 'Trebuchet MS'; static fontLead = -12; // STIX Two Math
  // static family = 'Times New Roman'; static fontLead = -12; // STIX Two Math
  // static family = 'Fishmonger CS'; static fontLead = -12;

  static rankSize = 120;
  static rankFont = F.fontSpec(WhistCard.rankSize, `${WhistCard.family}`, 'condensed');
  static backFont = F.fontSpec(WhistCard.rankSize/2, `${WhistCard.family}`, 'condensed');
  static ptFont = F.fontSpec(100, `Nunito`, 'normal');
  static ruleFont = F.fontSpec(60, `${WhistCard.family}`, 'condensed');

  static kernTen = -14;
  static get fnames() {
    return WhistCard.cards.flatMap(card => [card.Aname, `Ninja-${card.Aname}`]);
  }

  static ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'K'];

  static archers = ['x', 'X'];

  // four suits: 800 x 1100; but some images off-center; correct that for tokens
  static cards: CARD[] = [
    { Aname: 'arrows', color: 'yellow', ranks: this.archers, y0: 0, },
    { Aname: 'sword', color: 'white', ranks: WhistCard.ranks, y0: 0, },
    { Aname: 'staff', color: 'purple', ranks: WhistCard.ranks, y0: 80, },
    { Aname: 'stars', color: 'blue', ranks: WhistCard.ranks, y0: 60, },
    { Aname: 'knives', color: 'red', ranks: WhistCard.ranks, y0: 50, },
  ];

  /** color map: canonical name -> hmtl color code */
  static cmap = {
    red: 'rgba(254, 132, 140, 1)',
    orange: 'orange',
    yellow: 'rgba(251, 255, 137, 1)',
    green: 'rgb(51,193,69)',
    blue: 'rgba(164, 196, 255, 1)',
    purple:'rgba(218, 164, 254, 1)',// '0x7e27bc',
    brown: 'rgb(166, 128, 50)',
    white: 'rgba(232, 232, 232, 1)',
    pure: 'white',
    transp: C.transparent,
  } as Record<string, string>;

  /** main color of card: cmap[this.color] */
  get mcolor() {
    return WhistCard.cmap[this.color] ?? C.BLACK;
  }

  static allCards(): CountClaz[] {
    return WhistCard.cards.flatMap((card: CARD) =>
      card.ranks.map(rank => [1, WhistCard, card, rank]) as CountClaz[]
    );
  }

  static A0 = WhistCard.archers[0];
  static A1 = WhistCard.archers[1];

  override get radius() { return WhistCard.gridSpec.cardh ?? 734 } // nextRadius (750 x 1050)

  x0 = 0; // offset image
  y0 = 0; // offset image
  color = 'white';
  rank: string = '';
  image?: ImageBitmap;

  static cardSingle_3_5: GridSpec = {
    width: 3600, height: 5400, nrow: 6, ncol: 3, cardw: 1050, cardh: 750, // (inch_w*dpi + 2*bleed)
    x0: 120 + 3.5 * 150 + 30, y0: 83 + 3.5 * 150 + 30, delx: 1125, dely: 825, bleed: 30, double: false,
  };
  static gridSpec = ImageGrid.cardSingle_3_5;

  /* make specific rank (from desc.ranks) */
  constructor(desc: CARD, rank = WhistCard.A1) {
    super(desc.Aname); // cannot inject color directly
    this.color = desc.color;
    this.rank = rank;
    this.x0 = desc.x0 ?? 0;
    this.y0 = desc.y0 ?? 0;
    this.replaceBaseShape();
    this.addComponents();
  }

  /** constructor makes Shape before color is set, redo it here: */
  replaceBaseShape() {
    this.removeChild(this.baseShape);
    this.baseShape = this.makeShape();
    this.addChildAt(this.baseShape, 0);
  }

  declare baseShape: RectShape;  // so we can easily extract _sSiz or _rect
  // WARN: invoked by constructor.super() BEFORE this.color is set
  override makeShape(size = this.radius): RectShape {
    const ss = 45, safe = 25, rr = safe + ss / 2, ar = 3.5 / 2.5;
    // const ss = 45, rr = 45, ar = 3.5 / 2.5; // safe margin is 25px
    return new CardShape(this.mcolor, 'white', size, ar, ss, rr); // size, portrait, ss, corner
  }

  override makeBleed(bleed: number): DisplayObject {
    const bs =  this.baseShape;
    const { x, y, w, h } = bs._rect, ss = bs._sSiz+0, b = ss/2 + bleed;
    // enlarge by 'bleed'; add corner radius and stroke size
    const xywhrs = { x: x - b, y: y - b, w: w + b * 2, h: h + b * 2, r: 70, s: ss };
    const rv = new RectShape(xywhrs, bs.strokec, ''); // (xywhrs, fillc, strokec)
    rv.rotation = this.rotation
    return rv;
  }

  /**
   * put dobj @ this.getBounds() + { x: dx, y: dy }
   * if dobj2: put it upside down in opposite corner
   * @param dobj - Text or Bitmap
   * @param dx
   * @param dy
   * @param dobj2 - copy of dobj
   */
  set2corners(dobj: DisplayObject, dx = 0, dy = 0, dobj2?: DisplayObject) {
    const { x, y, width, height } = this.getBounds();
    dobj.x = x + dx;
    dobj.y = y + dy;
    this.addChild(dobj);
    // this.addChild(new RectShape({ x: dobj.x, y: dobj.y, w: 2, h: 2 }, 'red', ''))
    if (dobj2) {
      dobj2.rotation = 180;
      dobj2.x = x + width - dx;
      dobj2.y = y + height - dy;
      this.addChild(dobj2);
      // this.addChild(new RectShape({ x: dobj2.x, y: dobj2.y, w: 2, h: 2 }, 'green', ''))
    }
  }

  // Bitmap of image for this Card (Ninja or Icon/weapon)
  suitBitmap(si = 1, icon = false) {
    const iwide = WhistCard.gridSpec.cardw! * .8;
    const cname = `${icon ? '' : 'Ninja-'}${this.Aname}`;
    return AliasLoader.loader.getBitmap(cname, si * iwide); // offsetReg to center of image!
  }

  npips(n = 1, dw = .20) {
    // const r0 = 0, r1 = .32, r2 = .28, r3 = .25, r4 = .09;
    const r0 = 0, r1 = .35, r2 = .33, r3 = .33, r4 = .09;
    const a0 = 0, a2 = 0, a4 = 45, a6 = 60, a8 = 90;
    // { r: radius, a: angle }
    const randx = [
      [{ r: r0 , a: a0 }], // 0: filler
      [{ r: r0 , a: a0 }], // 1: face card: aces, kings, archers
      [{ r: r1 , a: a2 }, { r: -r1, a: a2 }],  // 2
      [{ r: r0 , a: a0 }, { r:  r2, a: -a4 }, { r: -r2, a: -a4 }],  // 3
      [{ r: r2 , a: a4 }, { r: -r2 , a: a4 }, { r: -r2 , a: -a4 }, { r: r2 , a: -a4 }], // 4
      [{ r: r2 , a: a4 }, { r: -r2 , a: a4 }, { r: -r2 , a: -a4 }, { r: r2 , a: -a4 }, { r: r0 , a: a0 }],
      [{ r: r2 , a: a6 }, { r: -r2 , a: a6 }, { r: -r2 , a: -a6 }, { r: r2 , a: -a6 }, { r: r1 , a: a2 }, { r: -r1 , a: a2 }], // 6
      [{ r: r2 , a: a6 }, { r: -r2 , a: a6 }, { r: -r2 , a: -a6 }, { r: r2 , a: -a6 }, { r: r1 , a: a2 }, { r: -r1 , a: a2 }, { r: r0 , a: a0 }], // 7

      [{ r: r2 , a: a4 }, { r: -r2 , a: a4 }, { r: -r2 , a: -a4 }, { r: r2 , a: -a4 },  // 4
       { r: r1 , a: a2 }, { r: -r1 , a: a2 }, { r: r3 , a: a8 }, { r: -r3 , a: a8 }],   // 8
      [{ r: r2 , a: a4 }, { r: -r2 , a: a4 }, { r: -r2 , a: -a4 }, { r: r2 , a: -a4 },  // 4
       { r: r1 , a: a2 }, { r: -r1 , a: a2 }, { r: r3 , a: a8 }, { r: -r3 , a: a8 }, { r: r0 , a: a0}], // 9
      [{ r: r2 , a: a4 }, { r: -r2 , a: a4 }, { r: -r2 , a: -a4 }, { r: r2 , a: -a4 },  // 4
       { r: r1 , a: a2 }, { r: -r1 , a: a2 }, { r: r3 , a: a8 }, { r: -r3 , a: a8 }, { r: r4 , a: a2 }, { r: -r4 , a: a2}], // 4
    ] as { r: number, a: number }[][];
    const { width, height } = this.getBounds();

    randx[n].forEach(({ r, a: deg }) => {
      const img = this.suitBitmap(dw); // new instance for each pip
      const rad = deg * Math.PI / 180.;
      const x = Math.sin(rad) * r;
      const y = Math.cos(rad) * r;
      img.x = x * width;
      img.y = y * height;
      img.rotation = - deg  + (r <= 0 ? 0 : 180);
      this.addChild(img);
    })
  }

  addPips() {
    const dw = ((this.rank == 'A' || this.rank == WhistCard.A0) ? .5
      : (this.rank == 'K' || this.rank == WhistCard.A1) ? .68 : .20);
    const bmImage = this.suitBitmap(dw);
    if (bmImage) {
      if (dw > .3) {
        this.addChild(bmImage);
      } else {
        this.npips(Number.parseInt(this.rank), dw); // pips are smaller
      }
    }
  }

  addComponents() {
    this.addPips();
    const si = .15; // scale image (icon)
    const font = WhistCard.rankFont;
    const edge = this.baseShape._sSiz / 2;
    const mlh = new CenterText('A', font).getMeasuredLineHeight(); // ~98
    // const imagey = Math.max(125, mlh); // mlh + lead + si*(1200/2) = 833; 155 = 98 + 30 + 37
    const imagey = mlh + WhistCard.fontLead + si * (400 - this.y0); // TODO: use dy to raise centered image
    const width = this.getBounds().width;

    // show rank (Text) in each corner:
    const rank = (this.rank == '10' ? '1' : this.rank);

    // show suitBitmap icon below each rtext:
    const sImage1 = this.suitBitmap(si, true);
    const sImage2 = this.suitBitmap(si, true);
    if (sImage1) {
      const dx = edge + 60 * width / 750;
      const dy = edge + imagey ;         // downset image from top of card
      this.set2corners(sImage1, dx, dy, sImage2);
    }

    const dx = edge + (rank == '1' ? 37 : 400 * si); // inset text & image from edge of card
    const dy = edge + WhistCard.fontLead; // top of text

    const tweak1 = new TextTweaks(new NamedContainer('tweak1'));
    const tweak2 = new TextTweaks(new NamedContainer('tweak2'));
    const tweaks = { dx, dy, align: 'center', baseline: 'top' } as TWEAKS;
    const t1 = tweak1.setTextFrag(rank, font, tweaks);
    const t2 = tweak2.setTextFrag(rank, font, tweaks);
    if (this.rank == '10') {
      const kern = t1.getMeasuredWidth() + WhistCard.kernTen;
      tweak1.setTextFrag('0', font, { ...tweaks, dx: dx + kern })
      tweak2.setTextFrag('0', font, { ...tweaks, dx: dx + kern })
    }
    this.set2corners(tweak1.cont, 0, 0, tweak2.cont);
    this.paint(this.color)
  }

  override paint(colorn?: string, force?: boolean): void {
    super.paint(this.mcolor, force);
    return;
  }
}

export class LogoText extends Container {
  static ninjaFam = 'aAssassinNinja';
  static ninjaFont = `500 200px aAssassinNinja`; // 65px semibold?
  static whistFont = `500 170px Fishmonger ES`;

  ninjaColor = 'rgba(249, 87, 0, 1)';
  whistColor = 'rgba(168, 58, 0, 1)';
  tweaker: TextTweaks = new TextTweaks(this);

  constructor(width = 300) {
    super();
    const tweaks = { align: 'center', baseline: 'middle' } as TWEAKS;
    this.tweaker.setTextFrag('Ninja', LogoText.ninjaFont, { color: this.ninjaColor, dy: .33 * width, rotation: -100, ...tweaks });
    this.tweaker.setTextFrag('whist', LogoText.whistFont, { color: this.whistColor, dy: -.31 * width, rotation: -90, ...tweaks });
  }
}

export class WhistBack extends WhistCard {

  constructor() {
    super({ Aname: 'back', color: 'pure', ranks: [] }, '?');
  }

  override addComponents(): void {
    const width = this.getBounds().width;
    this.addChild(new LogoText(width))
  }
}

export class RuleCard extends WhistCard {

  constructor() {
    super({ Aname: 'rules', color: 'pure', ranks: [] }, '?');
  }

  override addComponents(): void {
    const font = WhistCard.ruleFont;
    const mlh = new CenterText('A', font).getMeasuredLineHeight(); //
    const tweaker = new TextTweaks(this);
    const {width, height} = this.getBounds();
    const top = -height / 2;
    const twk = { align: 'left', dx: -width / 2 } as TWEAKS;
    const rules = [
      { text: 'Rules:', tweaks: { ...twk, align: 'center', dx: 0} },
      { text: '2. line2', tweaks: twk },
      { text: '3. rule3', tweaks: twk },
      { text: '4. longer line', tweaks: twk },
      { text: '5. last line', tweaks: twk },
    ] as {text: string, tweaks: TWEAKS}[]
    rules.forEach(({ text, tweaks }, n: number) => {
      tweaker.setTextTweaks(text, font, { dy: top + n * mlh, ...tweaks })
    })
  }
}
