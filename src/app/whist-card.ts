import { C, F } from "@thegraid/common-lib";
import { AliasLoader, CenterText, NamedContainer, RectShape, RectWithDisp, type CountClaz, type Paintable } from "@thegraid/easeljs-lib";
import { Shape, Text, type Bitmap, type Container, type DisplayObject } from "@thegraid/easeljs-module";
import { Tile } from "@thegraid/hexlib";
import { CardShape } from "./card-shape";
import { TileExporter } from "./tile-exporter";

// some cards have multiple 'run' boxes! so we allow string | string[]
type CARD = {
  Aname: string, color: string, cost: string|number,
};
type BoxKey = Extract<keyof CARD, 'now'|'active'|'run'>;
type CARD_DESC = Required<Pick<CARD, BoxKey>>;

function rgbaToName(v: Uint8ClampedArray, alpha?: number|string) {
    return `rgba(${v[0]},${v[1]},${v[2]},${alpha ?? (v[3]/255).toFixed(2)})`
  }

export class WhistCard extends Tile  {
  // static family = 'SF Compact Rounded'; static fontLead = 0;
  // static family = 'Nunito'; static fontLead = 0;
  // static family = 'Futura'; static fontLead = 12; // Futura steps on itsefl..
  // static family = 'Helvetica Neue'; static fontLead = 6;
  static family = 'Fishmonger CS'; static fontLead = 13;
  static nameFont = (`condensed 500 65px ${WhistCard.family}`); // semibold ?
  static coinFont = F.fontSpec(80, `${WhistCard.family}`, 'bold');
  // static titleFont = F.fontSpec(36, `${CubeCard.family}`, '800 condensed');
  static titleFont = `36px ${WhistCard.family} bold`;
  static textFont = F.fontSpec(36, `${WhistCard.family}`, 'condensed');
  static get fnames() {
    return WhistCard.cards.flatMap(card => [card.Aname, `Ninja-${card.Aname}`]);
  }
  // four suits:
  static cards: CARD[] = [
    {Aname: 'sword', cost: 5, color: 'white', },
    {Aname: 'staff', cost: '9*', color: 'red', },
    {Aname: 'stars', cost: 7, color: 'blue', },
    {Aname: 'knives', cost: 5, color: 'purple', },
];

  /** main color of card: cmap[this.color] */
  get mcolor() {
    return WhistCard.cmap[this.color] ?? 'pink';
  }
  get useAltColor() {
    return (this.color == 'yellow') || (this.color == 'white');
  }
  /** text color on card, generally WHITE, but white & yellow cards use alternate color */
  get tcolor() {
    return (this.color == 'yellow') ? '#003300' : (this.color == 'white') ? 'DARKBLUE' : C.WHITE;
  }

  // todo: map from canonical names to print colors
  /** color map: canonical name -> hmtl color code */
  static cmap = {
    red: 'rgba(227, 79, 79, 1)',
    orange: 'orange',
    yellow: 'yellow',
    green: 'rgb(51,193,69)',
    blue: 'rgba(139, 171, 229, 1)',
    purple:'rgba(157, 97, 197, 1)',// '0x7e27bc',
    brown: 'rgb(166, 128, 50)',
    white: 'rgba(221, 220, 228, 1)',
  } as Record<string, string>;

  static allCards(): CountClaz[] {
    return WhistCard.cards.map((card: CARD) => [1, WhistCard, card]);
  }

  override get radius() { return 734 } // nextRadius

  x0 = 200; // align title, colored text/boxes
  color = 'white';
  cost = '2';
  desc: CARD_DESC;
  image?: ImageBitmap;
  gridSpec = TileExporter.myGrid;

  constructor(desc: CARD) {
    super(desc.Aname);
    this.desc = { now: '', active: '', run: '', ...desc };
    this.color = desc.color;
    this.cost = `${desc.cost}`;
    this.addComponents();
  }

  // invoked by constructor.super()
  override makeShape(): Paintable {
    return new CardShape('lavender', this.color, this.radius, true, 3, 10);
  }

  addComponents() {
    //
    const h = this.gridSpec.cardh!;
    const cname = `Ninja-${this.Aname}`;
    const imgWide = this.gridSpec.cardw! * .8;
    const bmImage = AliasLoader.loader.getBitmap(cname, imgWide); // scaled to fit cardw
    const { x, y, height, width } = this.baseShape.getBounds();
    const x0 = this.x0 = x + width * .455; // where to position Graphics to right of image
    if (bmImage) {
      bmImage.x += 0; // can fudge if you want to see the cropped bleed graphics
      this.addChild(bmImage);
    }

    // this.reCache(); // do not reCache: extends bouds to whole bmImage!
    this.paint(this.color)
  }

  lineShape(y = 0, x0 = 0, dx = 90, color = 'red') {
    const s = new Shape();
    s.graphics.beginStroke(color).mt(x0, y).lt(x0+dx, y).endStroke();
    return s;
  }

  darken(color: string, dc = .8) {
    const rgb = C.nameToRgba(color);
    const darka = rgb.map(cv => Math.min(255, Math.floor(cv * dc)));
    const rgba = rgbaToName(darka, 1); // leave alpha at 1 for now
    return rgba;
  }

  corner = 8;
  border = 6;

  override paint(colorn?: string, force?: boolean): void {
    super.paint(this.mcolor, force);
    return;
  }
}


