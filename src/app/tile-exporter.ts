import { AliasLoader, TileExporter as TileExporterLib, type CountClaz, type GridSpec, type PageSpec } from "@thegraid/easeljs-lib";
import { TP } from "@thegraid/hexlib";
import { GtrCard } from "../../../gtr/src/app/gtr-card";
import { SpecialDead } from "./special-dead";
import { TuckboxMaker } from "./tuckbox";
import { LogoText, RuleCard, WhistBack, WhistCard } from "./whist-card";
import { BidCounter, BonusBack, PointCounter, PointsBack, WhistToken } from "./whist-token";

// end imports

type CardCount = Record<string, number>;


/** multi-format TileExporter base class */
export class TileExporter extends TileExporterLib {
  // tbe = new TuckboxExporter();
  constructor() {
    super(TuckboxMaker); // creates this.imageGrid; setButton --> makeImagePages()
    TP.cacheTiles = 0;
  }

  // TODO: extra cards for cursus incl: tableau layouts, player aides for GtR,
  // whist[44] A-2-10-K, 15x PointCounter, 8x[0-7 BidCounter], trick-bonus [32]
  // 46 + (32+15+8)/2 =  46 + 27 = 73 < 75;
  // TODO: border around card

  /** invoked from button click: "MakePage" */
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
      // ...allCards.slice(36, 46),    // 3 rows, left
      [1, RuleCard, 'rules', width],   // center
      [1, GtrCard, 'GtrLeaderCard', width], // right
      [1, GtrCard, 'Odd-000-Jack', width],  // left
      [5, GtrCard, 'Player Aid', width],   // center, right, row
    ] as CountClaz[];

    const mixedBacks = [
      [9, WhistBack, 'Back'], // 3 rows
      [1, GtrCard, 'GtrLeaderCard', width, r180], // left
      [1, RuleCard, 'rule back', width],  // center
      [1, WhistBack, 'Back'], // right
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
    // this.clazToTemplateN(whistTokens_counters, WhistToken.gridSpec, pageSpecs, 'counters'); // TODO: include columns 4-color
    // this.clazToTemplateN(whistTokens_counter_back, WhistToken.gridSpec, pageSpecs, 'counter_back');

    // this.clazToTemplateN(whistTokens_front, WhistToken.gridSpec, pageSpecs, 'tokens');
    // this.clazToTemplateN(whistTokens_back, WhistToken.gridSpec, pageSpecs, 'token_backs');

    // this.clazToTemplateN([...whistCards], WhistCard.gridSpec, pageSpecs, 'cards', true);
    // this.clazToTemplateN([...mixedFront], WhistCard.gridSpec, pageSpecs, 'mixed');

    // this.clazToTemplateN(mixedBacks, WhistCard.gridSpec, pageSpecs, 'mixed_backs');
    // this.clazToTemplateN(whistCards_back, WhistCard.gridSpec, pageSpecs, 'card_backs');

    this.makeTuckbox(pageSpecs); // add another canvas/page of objects
    return pageSpecs;
  }

  toTuckbox(pageSpecs: PageSpec[]) {

  }

  makeTuckbox(pageSpecs: PageSpec[]) {
    const spec = TuckboxMaker.poker_75, s = spec.safe ?? 20;
    const front = AliasLoader.loader.getBitmap('Ninja-stars', spec.front.h - 2 * s);
    const back = AliasLoader.loader.getBitmap('Ninja-arrows', spec.back.h - 2 * s);
    const left = new LogoText(Math.min(spec.left.w, spec.front.h) - 2 * s);
    const right = new LogoText(Math.min(spec.right.w, spec.back.h) - 2 * s);
    const top  = new LogoText(spec.top.h - 2 * s)
    const bottom  = new LogoText(spec.bottom.h - 2 * s)
    const tbArgs = {
      front, back, left, right, top, bottom,
    };
    (this.imageGrid as TuckboxMaker).tuckboxToTemplate(tbArgs, spec, pageSpecs)

  }

  /** compose 'Claz' objects, add them to stage->canvas, according to GridSpec; record in PageSpec */
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
