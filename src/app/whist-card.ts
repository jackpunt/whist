import { C, F } from "@thegraid/common-lib";
import { AliasLoader, CenterText, RectShape, type CountClaz, type Paintable } from "@thegraid/easeljs-lib";
import { type DisplayObject } from "@thegraid/easeljs-module";
import { Tile } from "@thegraid/hexlib";
import { CardShape } from "./card-shape";
import { TileExporter } from "./tile-exporter";

// some cards have multiple 'run' boxes! so we allow string | string[]
type CARD = {
  Aname: string, color: string,
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
  // four suits:
  static cards: CARD[] = [
    {Aname: 'sword', color: 'white', },
    {Aname: 'staff', color: 'purple', },
    {Aname: 'stars', color: 'blue', },
    {Aname: 'knives', color: 'red', },
    {Aname: 'arrows', color: 'yellow', },
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
    return WhistCard.cards.map((card: CARD) => [1, WhistCard, card, 'A']);
  }

  override get radius() { return 734 } // nextRadius

  x0 = 200; // align title, colored text/boxes
  color = 'white';
  rank: string = '';
  image?: ImageBitmap;
  gridSpec = TileExporter.myGrid;

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
  override makeShape(): Paintable {
    return new CardShape(this.mcolor, this.mcolor, this.radius, true, 0, 60);
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

  addComponents() {
    //
    const h = this.gridSpec.cardh!;
    const cname = `Ninja-${this.Aname}`;
    const imgWide = this.gridSpec.cardw! * .8;
    const bmImage = AliasLoader.loader.getBitmap(cname, imgWide); // scaled to fit cardw
    if (bmImage) {
      this.addChild(bmImage); // TODO: maybe make 'pips' with smaller image (except K & A)
    }
    const font = WhistCard.rankFont;
    const { x, y, width, height } = this.getBounds();
    const dx = width * .1;
    const dy = dx * 2.4;
    const rtext = new CenterText(this.rank, font, C.BLACK); rtext.textAlign = 'right';
    const rtext2 = new CenterText(this.rank, font, C.BLACK); rtext2.textAlign = 'right';
    this.set2corners(rtext, dx*1.15, rtext.getMeasuredLineHeight() * 1.1, rtext2);

    const sWide = imgWide * .15;
    const sImage = AliasLoader.loader.getBitmap(this.Aname, sWide);
    const sImage2 = AliasLoader.loader.getBitmap(this.Aname, sWide);
    if (sImage) {
      this.set2corners(sImage, dx - sWide * .15, dy, sImage2);
    }
    this.paint(this.color)
  }

  override paint(colorn?: string, force?: boolean): void {
    super.paint(this.mcolor, force);
    return;
  }
}


