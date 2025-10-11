import { ImageGrid, TileExporter as TileExporterLib, type CountClaz, type GridSpec, type PageSpec } from "@thegraid/easeljs-lib";
import { WhistBack, WhistCard } from "./whist-card";
import { BidCounter, PointCounter, WhistToken } from "./whist-token";
import { arrayN } from "@thegraid/common-lib";

// end imports

type CardCount = Record<string, number>;


/** multi-format TileExporter base class */
export class TileExporter extends TileExporterLib {

  /** for home printer 8x10 @ 300dpi = 2400 x 3000, no space between */
  static euroPoker2: GridSpec = {
    width: 2400, height: 3000, nrow: 4, ncol: 2, cardw: 1040, cardh: 734, double: false,
    x0: 60 + 1040/2, y0: 25 + 734/2, delx: 1122.5, dely: 734, bleed: 30, bgColor: 'white',
  }
  static fourUp: GridSpec = {
    width: 2600, height: 3600, nrow: 3, ncol: 3, cardh: 1040, cardw: 734, double: false,
    y0: 60 + 1040/2, x0: 85 + 734/2, dely: 1122.5, delx: 814, bleed: 30, bgColor: 'white',
  }

  static myGrid: GridSpec = ImageGrid.cardSingle_3_5;
  cardCountAry: CardCount[] = [{ 'Player Aid': 1 }]; // an minimal default
  pageNames: string[] = [];

  constructor() {
    super();
    // this.cardCountAry = [this.namesSmall];
  }

  // TODO: extra cards for cursus incl: tableau layouts, player aides for GtR,
  // whist[44] A-2-10-K, 17x PointCounter, 9x[0-7 BidCounter], trick-bonus [32]
  // 46 + (32+17+9)/2 =  46 + 29 = 75 < 75;
  // TODO: border around card

  override makeImagePages() {
    // [...[count, claz, ...constructorArgs]]
    const whistCards_base_back = [
      [8, WhistBack, 'Back' ],
    ] as CountClaz[];
    const whistCards_base = [
      ...WhistCard.allCards(),
    ] as CountClaz[];

    const whistTokens_base = [
      [8, PointCounter, 'Points'], // [1, .., 10]
      [4, BidCounter, 'BidFront', '0', '1', '2', '3'],
      [4, BidCounter, 'BidBack', '4', '5', '6', '7'],
      ...WhistToken.allTokens(),
    ] as CountClaz[];
    const pageSpecs: PageSpec[] = [];
    this.clazToTemplate(whistCards_base_back, WhistCard.gridSpec, pageSpecs);

    // this.clazToTemplate(whistTokens_base, WhistToken.gridSpec, pageSpecs);
    this.clazToTemplate(whistCards_base, WhistCard.gridSpec, pageSpecs);

    return pageSpecs;
  }

}
export class TileExporter1 extends TileExporter {
}
