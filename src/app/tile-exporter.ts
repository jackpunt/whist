import { ImageGrid, TileExporter as TileExporterLib, type CountClaz, type GridSpec, type PageSpec } from "@thegraid/easeljs-lib";
import { WhistCard } from "./whist-card";
import { WhistToken } from "./whist-token";

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

  // TODO: extra cards for cursus, player aides for GtR,
  // whist[44] A-2-10-K, 8 x [R&G pair] ten-pt-counters, trick-bonus [32]
  // 44 + (16 + 32)/2 =  44 + 24 = 68 < 75; +7 cards (lesser Joker, & 6 aides?)
  override makeImagePages() {
    // [...[count, claz, ...constructorArgs]]
    const whistCards_base_back = [
    ] as CountClaz[];
    const whistCards_base = [
      ...WhistCard.allCards(),
    ] as CountClaz[];

    const whistTokens_base = [
      ...WhistToken.allTokens(),
    ];
    const pageSpecs: PageSpec[] = [];
    this.clazToTemplate(whistTokens_base, WhistToken.gridSpec, pageSpecs);
    this.clazToTemplate(whistCards_base, WhistCard.gridSpec, pageSpecs);

    return pageSpecs;
  }

}
export class TileExporter1 extends TileExporter {
}
