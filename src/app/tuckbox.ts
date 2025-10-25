import { C, type XYWH } from "@thegraid/common-lib";
import { ImageGrid, LayoutSpec, NamedContainer, RectShape, type PageSpec } from "@thegraid/easeljs-lib";
import { type DisplayObject } from "@thegraid/easeljs-module";

// Tuckbox is like a Card/Tile -- a collection of dobjs/images stacked to get cut onto a cardboard.
// TileExporter is really a TileGridExporter
// Here we make a TuckboxExporter; makes a page with one (maybe 2) TuckBox objects

// TuckGeom is more like CardShape: how to make single instance
// TuckSpec is maybe like GridSpec? but assembles a single tuckbox, not an array of Card?
export type Geom = XYWH & { rot?: number }
// the layout of the various components of a tuckbox:
type TuckGeom =  {
  front: Geom;
  back: Geom;
  left: Geom;
  right: Geom;
  top: Geom;
  bottom: Geom;
  flap: Geom;
  bflap: Geom;
};
export type TuckSpec = LayoutSpec & TuckGeom;

type TuckArgs = Partial<Record<keyof(TuckGeom), DisplayObject>>

export class TuckboxMaker extends ImageGrid {

  static poker_75: TuckSpec = {
    width: 5400, height: 3600, bleed: 30, safe: 30, bgColor: 'white',

    right: { x: 1300, y: 545, w: 2395 - 1300, h: 847 - 545 }, // 1095 x 302
    back: { x: 1300, y: 847, w: 2395 - 1300, h: 1612 - 847, rot: 90 }, // 1095 x 765
    left: { x: 1300, y: 1612, w: 2395 - 1300, h: 1915 - 1612 }, // 1095 x 303
    front: { x: 1300, y: 1915, w: 2395 - 1300, h: 2684 - 1915, rot: 90 }, // 1095 x 769

    bottom: { x: 1004, y: 847, w: 1300 - 1004, h: 1612 - 847 }, // 296 x 765
    top: { x: 2396, y: 847, w:  2695-2396, h: 1612 - 847 },  // 299 x 765
    flap: { x: 2695, y: 847, w: 2904-2695, h: 1612 - 847 }, // 209 x 765
    bflap: { x: 820, y: 847, w: 1004-795, h: 1612 - 847 }, // 209 x 765
  }

  tuckboxToTemplate(args: TuckArgs, spec: TuckSpec, pageSpecs: PageSpec[]) {
    const frontObjs = [] as DisplayObject[];
    const keys = Object.keys(args) as (keyof TuckArgs)[];
    keys.forEach(key => {
      const { x, y, w, h, rot } = spec[key]; // placement of component '$key'
      const landscape = (w >= h);   // target slot is landscape
      const fillc = C.transparent;
      const strokec = (key == 'front' || key == 'back') ? 'blue' : 'cyan';
      const box = new RectShape({ x, y, w, h, s: 1 }, fillc, strokec)
      // frontObjs.push(box)
      const dobj = args[key]!; // assert: dobj is self-centered; for placement and rotation
      dobj.x = x + w / 2;
      dobj.y = y + h / 2;
      const { width, height } = dobj.getBounds(), do_landscape = width >= height;
      const rotation = rot ?? (landscape === do_landscape ? 0 : 90);
      dobj.rotation = rotation;
      frontObjs.push(dobj);
    })
    // shared with clasToTemplate
    const pagen = pageSpecs.length;
    const canvasId = `canvas_P${pagen}`;
    const layoutSpec = TuckboxMaker.poker_75;
    const pageSpec: PageSpec = { layoutSpec, frontObjs, basename: 'poker_75' }
    pageSpecs[pagen] = pageSpec; // append new pageSpec to pageSpecs[]
    this.makePage(pageSpec, canvasId);  // this.addObjects(pageSpec);
    return pageSpec
  }

  override addObjects(pageSpec: PageSpec): number {
    const layoutSpec = pageSpec.layoutSpec;
    if ((layoutSpec as TuckSpec).front !== undefined) {
      return this.super_addObjects(pageSpec, 0, 0);
    } else {
      return super.addObjects(pageSpec)
    }
  }

  // simple addObjects, as from PageMaker
  super_addObjects(pageSpec: PageSpec, x0 = this.canvas.width / 2, y0 = this.canvas.height / 2) {
    const cont = new NamedContainer('tuckbox', x0, y0);
    cont.addChild(...pageSpec.frontObjs!);
    this.stage.addChild(cont);
    return cont.numChildren;
  }
}
