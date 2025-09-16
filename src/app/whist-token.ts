import { C } from "@thegraid/common-lib";
import { AliasLoader, CircleShape, ImageGrid, type CountClaz, type Paintable } from "@thegraid/easeljs-lib";
import { Tile } from "@thegraid/hexlib";
import { CardShape } from "./card-shape";
import { WhistCard } from "./whist-card";

export class WhistToken extends Tile {
  // 32 tokens (old template holds 4 * 9 = 36 cards)
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
      [1, WhistToken, token, ...token.split('')]
    );
  }
  static imageNames = [
    'arrows', 'sword', 'staff', 'stars', 'knives',
  ]
  static gridSpec = ImageGrid.cardSingle_1_75;

  override get radius() { return WhistToken.gridSpec.cardh! } // nextRadius

  // WARN: invoked by constructor.super() BEFORE this.color is set
  override makeShape(size = this.radius): Paintable {
    const bleed = WhistToken.gridSpec.bleed
    return new CardShape(C.grey128, C.grey128, size, true, bleed, 60);
  }

  constructor(Aname: string, ... chars: string[]) {
    super(Aname);
    const nums = chars.map(c => Number.parseInt(c));
    this.addImages(nums)
  }

  suitImage(n: number, w = 50) {
    const name = WhistToken.imageNames[n];
    const bitmap = AliasLoader.loader.getBitmap(name, w);
    return bitmap;
  }

  addImages(nums: number[]) {
    const cardw = WhistToken.gridSpec.cardw!;
    const n = nums.length;
    const rad = cardw * .1;
    nums.forEach((ndx, nth) => {
      const color = WhistCard.cmap[WhistCard.cards[ndx].color];
      const circ = new CircleShape(color, rad*1.2, '');
      const bm = this.suitImage(ndx, rad * 2)
      const seq = (nth + 1) / (n + 1) - 1 / 2;
      circ.y = bm.y = seq * (cardw+rad);
      circ.x = bm.x = 0;
      this.addChild(circ, bm)
    })
  }
}
