import { C, F } from "@thegraid/common-lib";
import { AliasLoader, CenterText, ImageGrid, RectShape, type CountClaz, type GridSpec, type Paintable } from "@thegraid/easeljs-lib";
import { Container, type DisplayObject } from "@thegraid/easeljs-module";
import { Tile } from "@thegraid/hexlib";
import { CardShape } from "./card-shape";
import { TextTweaks, type TWEAKS } from "./text-tweaks";

// some cards have multiple 'run' boxes! so we allow string | string[]
type CARD = {
  Aname: string, color: string, ranks: string[],
};

export class WhistCard extends Tile  {
  static rankSize = 120;
  // static family = 'SF Compact Rounded Bold'; static fontLead = 0;
  // static family = 'Nunito'; static fontLead = 0;
  // static family = 'Futura'; static fontLead = 12; // Futura steps on itself..
  static family = 'Helvetica Neue'; static fontLead = -14;
  // static family = 'Fishmonger CS'; static fontLead = 13;
  static nameFont = (`condensed 500 65px ${WhistCard.family}`); // semibold
  static coinFont = F.fontSpec(80, `${WhistCard.family}`, 'bold');
  // static titleFont = F.fontSpec(36, `${CubeCard.family}`, '800 condensed');
  static titleFont = `36px ${WhistCard.family} bold`;
  static rankFont = F.fontSpec(WhistCard.rankSize, `${WhistCard.family}`, 'condensed');
  static get fnames() {
    return WhistCard.cards.flatMap(card => [card.Aname, `Ninja-${card.Aname}`]);
  }

  static ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'K'];

  // four suits:
  static cards: CARD[] = [
    { Aname: 'arrows', color: 'yellow', ranks: ['J', 'j'] },
    { Aname: 'sword', color: 'white', ranks: WhistCard.ranks },
    { Aname: 'staff', color: 'purple', ranks: WhistCard.ranks, },
    { Aname: 'stars', color: 'blue', ranks: WhistCard.ranks, },
    { Aname: 'knives', color: 'red', ranks: WhistCard.ranks, },
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

  override get radius() { return WhistCard.gridSpec.cardh ?? 734 } // nextRadius (750 x 1050)

  x0 = 200; // align title, colored text/boxes
  color = 'white';
  rank: string = '';
  image?: ImageBitmap;

  static cardSingle_3_5: GridSpec = {
    width: 3600, height: 5400, nrow: 6, ncol: 3, cardw: 1050, cardh: 750, // (inch_w*dpi + 2*bleed)
    x0: 120 + 3.5 * 150 + 30, y0: 83 + 3.5 * 150 + 30, delx: 1125, dely: 825, bleed: 30, double: false,
  };
  // static gridSpec = TileExporter.myGrid;
  static gridSpec = ImageGrid.cardSingle_3_5;

  /* make specific rank (from desc.ranks) */
  constructor(desc: CARD, rank = 'J') {
    super(desc.Aname); // cannot inject color directly
    this.color = desc.color;
    this.rank = rank;
    this.replaceBaseShape();
    this.addComponents();
  }

  /** constructor makes Shape before color is set, redo it here: */
  replaceBaseShape() {
    this.removeChild(this.baseShape);
    this.baseShape = this.makeShape();
    this.addChildAt(this.baseShape, 0);
  }

  // WARN: invoked by constructor.super() BEFORE this.color is set
  override makeShape(size = this.radius): Paintable {
    const bleed = WhistCard.gridSpec.bleed ?? 0
    return new CardShape(this.mcolor, 'white', size, true, 45, 45); // size, portrait, ss, corner
  }

  override makeBleed(bleed: number): DisplayObject {
    const bs = this.baseShape as RectShape;
    const { x, y, w, h } = bs._rect, ss = bs._sSiz+0, b = ss/2 + bleed;
    // enlarge by 'bleed'; add corner radius and stroke size
    const xywhrs = { x: x - b, y: y - b, w: w + b * 2, h: h + b * 2, r: 70, s: ss };
    const rv = new RectShape(xywhrs, bs.strokec, ''); // (xywhrs, fillc, strokec)
    rv.rotation = this.rotation
    // const rv = super.makeBleed(bleed) as RectShape;
    // rv.paint(rv.strokec, true);
    return rv;
  }

  /**
   * put dobj @ this.getBounds() + { x: dx, y: dy }
   * if dobj2: put it upside down in opposite corner
   * @param dobj
   * @param dx
   * @param dy
   * @param dobj2
   */
  set2corners(dobj: DisplayObject, dx = 0, dy = 0, dobj2?: DisplayObject) {
    const { x, y, width, height } = this.getBounds();
    dobj.x = x + dx;
    dobj.y = y + dy;
    this.addChild(dobj);
    if (dobj2) {
      dobj2.rotation = 180;
      dobj2.x = x + width - dx;
      dobj2.y = y + height - dy;
      this.addChild(dobj2);
    }
  }

  // Bitmap of image for this Card
  suitBitmap(dw = 1, icon = false) {
    const iwide = WhistCard.gridSpec.cardw! * .8;
    const cname = `${icon ? '' : 'Ninja-'}${this.Aname}`;
    return AliasLoader.loader.getBitmap(cname, iwide * dw);
  }

  npips(n = 1, dw = .25) {
    const r0 = 0, r1 = .30, r2 = .33, r3 = .33, r4 = .09;
    const a0 = 0, a1 = 0, a2 = 49, a3 = 60, a4 = 90;
    // { r: radius, a: angle }
    const randx = [
      [{ r: r0 , a: a0 }], // 'A' or 'K' or 'J'
      [{ r: r0 , a: a0 }], // 'A' or 'K' or 'J'
      [{ r: r1 , a: a1 }, { r: -r1, a: a1 }],  // 2
      [{ r: r2 , a: -a2 }, { r: -r2 , a: -a2 }, { r: r0 , a: a0 }], // 3
      [{ r: r2 , a: a2 }, { r: -r2 , a: a2 }, { r: -r2 , a: -a2 }, { r: r2 , a: -a2 }], // 4
      [{ r: r2 , a: a2 }, { r: -r2 , a: a2 }, { r: -r2 , a: -a2 }, { r: r2 , a: -a2 }, { r: r0 , a: a0 }],
      [{ r: r2 , a: a3 }, { r: -r2 , a: a3 }, { r: -r2 , a: -a3 }, { r: r2 , a: -a3 }, { r: r2 , a: a1 }, { r: -r2 , a: a1 }], // 6
      [{ r: r2 , a: a3 }, { r: -r2 , a: a3 }, { r: -r2 , a: -a3 }, { r: r2 , a: -a3 }, { r: r2 , a: a1 }, { r: -r2 , a: a1 }, { r: r0 , a: a0 }], // 7

      [{ r: r2 , a: a2 }, { r: -r2 , a: a2 }, { r: -r2 , a: -a2 }, { r: r2 , a: -a2 },
       { r: r3 , a: a0 }, { r: -r3 , a: a0 }, { r: r3 , a: a4 }, { r: -r3 , a: a4 }], // 4
      [{ r: r2 , a: a2 }, { r: -r2 , a: a2 }, { r: -r2 , a: -a2 }, { r: r2 , a: -a2 },
       { r: r3 , a: a0 }, { r: -r3 , a: a0 }, { r: r3 , a: a4 }, { r: -r3 , a: a4 }, { r: r0 , a: a0}], // 4
      [{ r: r2 , a: a2 }, { r: -r2 , a: a2 }, { r: -r2 , a: -a2 }, { r: r2 , a: -a2 },
       { r: r3 , a: a0 }, { r: -r3 , a: a0 }, { r: r3 , a: a4 }, { r: -r3 , a: a4 }, { r: r4 , a: a0 }, { r: -r4 , a: a0}], // 4
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
    const dw = ((this.rank == 'A' || this.rank == 'j') ? .5 : (this.rank == 'K' || this.rank == 'J') ? .68 : .20);
    const bmImage = this.suitBitmap(dw);
    if (bmImage) {
      if (dw > .3) {
        this.addChild(bmImage); // TODO: maybe make 'pips' with smaller image (except K & A)
      } else {
        this.npips(Number.parseInt(this.rank), dw)
      }
    }
  }

  addComponents() {
    this.addPips();
    const font = WhistCard.rankFont;
    const { x, y, width, height } = this.getBounds();
    const bleed = WhistCard.gridSpec.bleed ?? 0;

    // show rank (Text) in each corner:
    const rank = (this.rank == 'j' ? 'J' : this.rank);
    const dx = bleed + width * (rank !== '10' ? .01 : -.02); // inset text & image from edge of card
    const rtext = new CenterText(rank, font, C.BLACK); rtext.textAlign = 'left'; rtext.textBaseline = 'top';
    const rtext2 = new CenterText(rank, font, C.BLACK); rtext2.textAlign = 'left'; rtext2.textBaseline = 'top';
    const mlh = rtext.getMeasuredLineHeight();
    const dy = bleed + mlh * .05 + WhistCard.fontLead;
    this.set2corners(rtext, dx, dy, rtext2);

    // show suitBitmap below each rtext:
    const si = .15; // scale image
    const sImage1 = this.suitBitmap(si, true);
    const sImage2 = this.suitBitmap(si, true);
    if (sImage1) {
      const { width, height } = { ...sImage1.getBounds(), width: 800 } // so staff.widht = 800
      const dx = bleed + si * width / 2.2;           // inset; a bit left of center
      const dy = bleed + si * height / 6 + mlh ;     // downset image from top of card
      this.set2corners(sImage1, dx, dy, sImage2);
    }
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
