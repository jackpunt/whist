import { PageSpec, TileExporter as TileExporterLib, type CountClaz, type GridSpec, type Tile } from "@thegraid/easeljs-lib";
import { WhistCard } from "./whist-card";
import type { DisplayObject } from "@thegraid/easeljs-module";

// end imports

type CardCount = Record<string, number>;


/** multi-format TileExporter base class */
export class TileExporter extends TileExporterLib {

  // TODO: migrate these to createjs-lib
  // x0 = pixel margin + bleed + width/2
  static euroPoker: GridSpec = {
    width: 3600, height: 5400, nrow: 6, ncol: 3, cardw: 1040, cardh: 734, double: false,
    x0: 158 + 30 + 1040/2, y0: 320 + 30 + 734/2, delx: 1122.5, dely: 803, bleed: 30,
  }

  /** for home printer 8x10 @ 300dpi = 2400 x 3000 */
  static euroPoker2: GridSpec = {
    width: 2400, height: 3000, nrow: 4, ncol: 2, cardw: 1040, cardh: 734, double: false,
    x0: 60 + 1040/2, y0: 25 + 734/2, delx: 1122.5, dely: 734, bleed: 0, bgColor: 'white',
  }
  static fourUp: GridSpec = {
    width: 2400, height: 3000, nrow: 4, ncol: 2, cardh: 1040, cardw: 734, double: false,
    y0: 60 + 1040/2, x0: 25 + 734/2, dely: 1122.5, delx: 814, bleed: 30, bgColor: 'white',
  }

  static myGrid: GridSpec = TileExporter.fourUp;
  cardCountAry: CardCount[] = [{ 'Player Aid': 1 }]; // an minimal default
  pageNames: string[] = [];

  constructor() {
    super();
    // this.cardCountAry = [this.namesSmall];
  }

  override makeImagePages() {
    // [...[count, claz, ...constructorArgs]]
    const cardSingle_euro_back = [
    ] as CountClaz[];
    const cardSingle_euro_base = [
      ...WhistCard.allCards(),
    ] as CountClaz[];

    const pageSpecs = this.clazToTemplate(cardSingle_euro_base, TileExporter.myGrid);
    return pageSpecs;
  }

}
export class TileExporter1 extends TileExporter {
}
