import { C } from "@thegraid/common-lib";
import { AliasLoader, CenterText, CircleShape, ImageGrid, type CountClaz, type Paintable } from "@thegraid/easeljs-lib";
import { Tile } from "@thegraid/hexlib";
import { CardShape } from "./card-shape";
import { WhistCard } from "./whist-card";

export class WhistToken extends Tile {
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

  static allTokens(): CountClaz[] {
    return WhistToken.tokens.map((token: string) =>
      [1, WhistToken, token, ...token.split('').map(c => Number.parseInt(c))]
    );
  }
  /** image name to load, and suit name in cards */
  static imageNames = [
    'arrows', 'sword', 'staff', 'stars', 'knives', // yellow, grey, purple, blue, red
  ]
  static gridSpec = ImageGrid.cardSingle_1_75;

  override get radius() { return WhistToken.gridSpec.cardh! } // nextRadius

  // WARN: invoked by constructor.super() BEFORE this.color is set
  override makeShape(size = this.radius, color = C.grey128): Paintable {
    const bleed = WhistToken.gridSpec.bleed
    return new CardShape(color, color, size, true, bleed, 60);
  }

  constructor(Aname: string, ... chars: string[]) {
    super(Aname);
    this.addImages(chars)
  }

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

export class PointCounter extends WhistToken {
  constructor(name = 'Points', ...args: string[]) {
    const chars = (args.length > 0) ? args : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '', '10'];
    super(name, ...chars)
  }
  // WARN: invoked by constructor.super() BEFORE this.color is set
  override makeShape(size = this.radius, color = C.grey224): Paintable {
    const bleed = WhistToken.gridSpec.bleed
    return new CardShape(color, color, size, true, bleed, 60);
  }

  override addImages(chars: string[]) {
    // TODO: arrange numbers in array on card
    const font = WhistCard.rankFont;
    const { width, height } = this.getBounds()
    const dw = .3 * width, dh = .1 * height;
    chars.forEach((c, n) => {
      const num = new CenterText(c, font);
      const col = [-1, 1, 0][n % 3];
      num.x = col * dw;
      num.y = (-3.2 + 2.5 * Math.floor(n/3)) * dh;
      this.addChild(num);

    })
  }
}

export class BidCounter extends PointCounter {
    constructor(name = 'Bid', ...args: string[]) {
      super(name, ...args);
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
