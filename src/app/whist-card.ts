import { C, F, type XY } from "@thegraid/common-lib";
import { AliasLoader, CenterText, ImageGrid, RectShape, type CountClaz, type Paintable } from "@thegraid/easeljs-lib";
import { type DisplayObject } from "@thegraid/easeljs-module";
import { Tile } from "@thegraid/hexlib";
import { CardShape } from "./card-shape";
import { TileExporter } from "./tile-exporter";

// some cards have multiple 'run' boxes! so we allow string | string[]
type CARD = {
  Aname: string, color: string, ranks: string[],
};

function rgbaToName(v: Uint8ClampedArray, alpha?: number|string) {
    return `rgba(${v[0]},${v[1]},${v[2]},${alpha ?? (v[3]/255).toFixed(2)})`
  }

export class WhistCard extends Tile  {
  static rankSize = 120;
  // static family = 'SF Compact Rounded Bold'; static fontLead = 0;
  // static family = 'Nunito'; static fontLead = 0;
  static family = 'Futura'; static fontLead = 12; // Futura steps on itself..
  // static family = 'Helvetica Neue'; static fontLead = 6;
  // static family = 'Fishmonger CS'; static fontLead = 13;
  static nameFont = (`condensed 500 65px ${WhistCard.family}`); // semibold ?
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
    {Aname: 'arrows', color: 'yellow', ranks: ['J'] },
    {Aname: 'sword', color: 'white', ranks: WhistCard.ranks},
    {Aname: 'staff', color: 'purple', ranks: WhistCard.ranks, },
    {Aname: 'stars', color: 'blue', ranks: WhistCard.ranks, },
    {Aname: 'knives', color: 'red', ranks: WhistCard.ranks, },
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

  override get radius() { return 734 } // nextRadius

  x0 = 200; // align title, colored text/boxes
  color = 'white';
  rank: string = '';
  image?: ImageBitmap;

  // static gridSpec = TileExporter.myGrid;
  static gridSpec = ImageGrid.cardSingle_3_5;

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
    const bleed = WhistCard.gridSpec.bleed
    return new CardShape(this.mcolor, this.mcolor, size, true, bleed, 60);
  }

  override makeBleed(bleed: number): DisplayObject {
    const rv = super.makeBleed(bleed) as RectShape;
    rv.paint(rv.strokec, true);
    return rv;
  }

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

  suitBitmap(dw = 1, icon = false) {
    const iwide = WhistCard.gridSpec.cardw! * .8;
    const cname = `${icon ? '' : 'Ninja-'}${this.Aname}`;
    return AliasLoader.loader.getBitmap(cname, iwide * dw);
  }

  // y: -1 or y: -2 --> rotate 180
  npips(n = 1, dw = .25) {
    const xyndx = [
      [{ x: 0, y: 0 }], // 'A' or 'K' or 'J'
      [{ x: 0, y: 0 }], // 'A' or 'K' or 'J'
      [{ x: 0, y: -2 }, { x: 0, y: 2 }],
      [{ x: 1, y: -2 }, { x: -1, y: 2 }, { x: 0, y: 0 }],
      [{ x: -1, y: -2 }, { x: 1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }],
      [{ x: -1, y: -2 }, { x: 1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 0, y: 0 }],
      [{ x: -1, y: -2 }, { x: -2, y: 0 }, { x: -1, y: 2 }, { x: 1, y: -2 }, { x: 2, y: 0 }, { x: 1, y: 2 }], // 6
      [{ x: -1, y: -2 }, { x: -2, y: 0 }, { x: -1, y: 2 }, { x: 1, y: -2 }, { x: 2, y: 0 }, { x: 1, y: 2 }, { x: 0, y: -1 }], // 7
      [{ x: -1, y: -2 }, { x: -2, y: 0 }, { x: -1, y: 2 }, { x: 1, y: -2 }, { x: 2, y: 0 }, { x: 1, y: 2 }, { x: 0, y: -1 }, { x: 0, y: 1 }], // 8
      [{ x: -1, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 }, { x: 1, y: -2 }, { x: 2, y: -1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 0 }], // 9
      [{ x: -1, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 }, { x: 1, y: -2 }, { x: 2, y: -1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: -2 }], // 10
    ] as XY[][];
    const x1 = .22, x2 = .28;
    const y2 = .35, y1 = y2 * .33, y10 = y2 * .51, y20 = y2 * .55;
    const { width, height } = this.getBounds();
    const xp = (x: number) => [-x2, -x1, 0, x1, x2][x + 2];
    const ypa = (x: number) => (x == 0) ? [-y20, -y10, 0, y10, y20] : [-y2, -y1, 0, y1, y2];
    const yp = (x: number, y: number) => ypa(x)[y + 2];
    const xyp = (n: number) => xyndx[n].map(({ x, y }) => ({ x: xp(x), y: yp(x, y) } as XY));
    const xyAry = xyp(n);
    xyAry.forEach(({ x, y }) => {
      const img = this.suitBitmap(dw);
      img.x = x * width;
      img.y = y * height;
      if (y > 0) img.rotation = 180;
      this.addChild(img);
    })
  }
  addComponents() {
    const dw = (this.rank == 'A' ? .6 : (this.rank == 'K' || this.rank == 'J') ? .75 : .23);
    const bmImage = this.suitBitmap(dw);
    if (bmImage) {
      if (dw > .5) {
        this.addChild(bmImage); // TODO: maybe make 'pips' with smaller image (except K & A)
      } else {
        this.npips(Number.parseInt(this.rank), dw)
      }
    }
    const font = WhistCard.rankFont;
    const { x, y, width, height } = this.getBounds();
    const dx = width * .1;
    const dy = dx * 2.65;
    const rtext = new CenterText(this.rank, font, C.BLACK); rtext.textAlign = 'right';
    const rtext2 = new CenterText(this.rank, font, C.BLACK); rtext2.textAlign = 'right';
    this.set2corners(rtext, dx * 1.15, rtext.getMeasuredLineHeight() * 1.1, rtext2);

    const sImage1 = this.suitBitmap(.15, true);
    const sImage2 = this.suitBitmap(.15, true);
    if (sImage1) {
      this.set2corners(sImage1, dx - 13, dy, sImage2);
    }
    this.paint(this.color)
  }

  override paint(colorn?: string, force?: boolean): void {
    super.paint(this.mcolor, force);
    return;
  }
}


