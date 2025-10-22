import type { XYWH } from "@thegraid/common-lib";
import { ImageGrid, type PageSpec, LayoutSpec, NamedContainer, TileExporter, CenterText, PageMaker } from "@thegraid/easeljs-lib";
import { Rectangle, type Bitmap, type DisplayObject } from "@thegraid/easeljs-module";

// Tuckbox is like a Card/Tile -- a collection of dobjs/images stacked to get cut onto a cardboard.
// TileExporter is really a TileGridExporter
// Here we make a TuckboxExporter; makes a page with one (maybe 2) TuckBox objects

// TuckGeom is more like CardShape: how to make single instance
// TuckSpec is maybe like GridSpec? but assembles a single tuckbox, not an array of Card?

// the layout of the various components of a tuckbox:
type TuckGeom =  {
  front: XYWH;
  back: XYWH;
  left: XYWH;
  right: XYWH;
  top: XYWH;
  bottom: XYWH;
  flap: XYWH;
  bflap: XYWH;
};
type TuckSpec = LayoutSpec & TuckGeom;

type TuckArgs = Partial<Record<keyof(TuckGeom), DisplayObject>>

/** locations of the printable sections, 'front' has the cutout for the 'flap' */
export class Tuckbox {
  constructor(Aname: string, args: TuckArgs) {

  }
}

export class TuckboxExporter extends PageMaker {

  static poker_75: TuckGeom & LayoutSpec = {
    width: 3600, height: 5400, bleed: 30,

    right: { x: 1300, y: 545, w: 2395 - 1300, h: 847 - 545 }, // 1095 x 302
    back: { x: 1300, y: 847, w: 2395 - 1300, h: 1612 - 847 }, // 1095 x 765
    left: { x: 1300, y: 1612, w: 2395 - 1300, h: 1915 - 1612 }, // 1095 x 303
    front: { x: 1300, y: 1915, w: 2395 - 1300, h: 2684 - 1915 }, // 1095 x 769

    bottom: { x: 1004, y: 847, w: 1300 - 1004, h: 1612 - 847 }, // 296 x 765
    top: { x: 2396, y: 847, w:  2695-2396, h: 1612 - 847 },  // 299 x 765
    flap: { x: 2695, y: 847, w: 2904-2695, h: 1612 - 847 }, // 209 x 765
    bflap: { x: 820, y: 847, w: 1004-795, h: 1612 - 847 }, // 209 x 765
  }

  tuckboxToTemplate(args: TuckArgs, spec: TuckGeom, pageSpecs: PageSpec[]) {
    const cont = new NamedContainer('tuckbox')
    const keys = Object.keys(spec) as (keyof TuckArgs)[];
    keys.forEach(key => {
      const { x, y, w, h } = spec[key]; // placement of component '$key'
      const landscape = (w >= h);   // target slot is landscape
      const dobj = args[key]!; // assert: dobj is self-centered; for placement and rotation
      dobj.x = x + w / 2;
      dobj.y = y + h / 2;
      const { width, height } = dobj.getBounds(), do_landscape = width >= height;
      const rot = (landscape === do_landscape) ? 0 : 90;
      dobj.rotation = rot;
      cont.addChild(dobj);
    })

    this.addObjects(pageSpecs[0])
  }

    override addObjects(pageSpec: PageSpec) {
        const cont = new NamedContainer('default', this.canvas.width / 2, this.canvas.height / 2);
        cont.addChild(new CenterText('override addObjects() to see page contents'));
        this.stage.addChild(cont);
        return 1
    }
}
