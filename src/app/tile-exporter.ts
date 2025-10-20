import { ImageGrid, TileExporter as TileExporterLib, type CountClaz, type GridSpec, type PageSpec } from "@thegraid/easeljs-lib";
import { TP } from "@thegraid/hexlib";
import { GtrCard } from "../../../gtr/src/app/gtr-card";
import { SpecialDead } from "./special-dead";
import { WhistBack, WhistCard } from "./whist-card";
import { BidCounter, BonusBack, PointCounter, PointsBack, WhistToken } from "./whist-token";

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
  pageNames: string[] = [];

  constructor() {
    super();
    TP.cacheTiles = 0;
  }

  // TODO: extra cards for cursus incl: tableau layouts, player aides for GtR,
  // whist[44] A-2-10-K, 17x PointCounter, 9x[0-7 BidCounter], trick-bonus [32]
  // 46 + (32+17+9)/2 =  46 + 29 = 75 < 75;
  // TODO: border around card

  override makeImagePages() {
    const width = WhistCard.gridSpec.cardh ?? 750, r180 = 180;
    const allCards = WhistCard.allCards();

    // [...[count, claz, ...constructorArgs]]
    const whistCards_back = [
      [18, WhistBack, 'Back' ],
    ] as CountClaz[];

    const whistCards = [
      ...allCards, //.slice(0, 36),
    ] as CountClaz[];

    const mixedFront = [
      // ...allCards.slice(36),
      [2, GtrCard, 'GtrLeaderCard', width],
      [1, GtrCard, 'Odd-000-Jack', width],
      [5, GtrCard, 'Player Aid', width],
    ] as CountClaz[];

    const mixedBacks = [
      [9, WhistBack, 'Back'],
      [2, GtrCard, 'GtrLeaderCard', width, r180],
      [1, WhistBack, 'Back'],
      [2, GtrCard, 'Player Aid2', width, r180],
      [1, GtrCard, 'Odd-000-Jack', width, r180],
      [3, GtrCard, 'Player Aid2', width, r180],
    ] as CountClaz[];


    const whistTokens_counters = [
      [15, PointCounter, 'Points'], // [1, .., 10]
      [8, BidCounter, 'BidFront', '0', '1', '2', '3'],
      ...WhistToken.allTokens(30, 32),
      [5, SpecialDead, 'Special', 525],
    ] as CountClaz[];

    const whistTokens_counter_back = [
      [15, PointsBack, 'PointsBack', 'point\ncounter'],
      [5, BidCounter, 'BidBack', '4', '5', '6', '7'],
      [2, BonusBack, 'bonusBack', `Trick Bonus`],
      [3, BidCounter, 'BidBack', '4', '5', '6', '7'],
      [5, SpecialDead, 'Special', 525],
    ] as CountClaz[];

    const whistTokens_front = [
      ...WhistToken.allTokens(0, 30),
    ] as CountClaz[];

    const whistTokens_back = [
      [30, BonusBack, 'bonusBack', 'Trick Bonus'],
    ] as CountClaz[];
    const pageSpecs: PageSpec[] = [];
    this.clazToTemplateN(whistTokens_counters, WhistToken.gridSpec, pageSpecs, 'counters'); // TODO: include columns 4-color
    this.clazToTemplateN(whistTokens_counter_back, WhistToken.gridSpec, pageSpecs, 'counter_back');

    this.clazToTemplateN(whistTokens_front, WhistToken.gridSpec, pageSpecs, 'tokens');
    this.clazToTemplateN(whistTokens_back, WhistToken.gridSpec, pageSpecs, 'token_backs');

    // this.clazToTemplate(whistCards_back, WhistCard.gridSpec, pageSpecs, 'card_backs');
    this.clazToTemplateN([...whistCards], WhistCard.gridSpec, pageSpecs, 'cards', true);
    this.clazToTemplateN([...mixedFront], WhistCard.gridSpec, pageSpecs, 'mixed');

    this.clazToTemplateN(mixedBacks, WhistCard.gridSpec, pageSpecs, 'mixed_backs');
    this.clazToTemplateN(whistCards_back, WhistCard.gridSpec, pageSpecs, 'card_backs');
    // TODO: set spec.basename
    return pageSpecs;
  }

  clazToTemplateN(countClaz: CountClaz[], gridSpec?: GridSpec, pageSpecs: PageSpec[] = [], pageName = '', open = false): PageSpec[] {
    const zth = pageSpecs?.length ?? 0;
    const psa = this.clazToTemplate(countClaz, gridSpec, pageSpecs, open);
    const nth = psa.length;
    for (let i = zth; i < nth; i++) {
      psa[i].basename = psa[i].basename ?? pageName;
    }
    return psa;
  }
}
export class TileExporter1 extends TileExporter {
}
