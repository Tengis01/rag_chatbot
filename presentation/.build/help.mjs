import { Presentation } from "@oai/artifact-tool";

const p = Presentation.create({ slideSize: { width: 1920, height: 1080 } });
const slide = p.slides.add();
console.log("presentation", Object.getOwnPropertyNames(Object.getPrototypeOf(p)));
console.log("slides", Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides)));
console.log("slide", Object.getOwnPropertyNames(Object.getPrototypeOf(slide)));
console.log("shapes", Object.getOwnPropertyNames(Object.getPrototypeOf(slide.shapes)));
const sh = slide.shapes.add({ geometry: "textbox", position: { left: 10, top: 10, width: 100, height: 40 }, fill: "none", line: { fill: "none", width: 0 } });
console.log("shape", Object.getOwnPropertyNames(Object.getPrototypeOf(sh)));
console.log("text", Object.getOwnPropertyNames(Object.getPrototypeOf(sh.text)));
console.log("speakerNotes", Object.getOwnPropertyNames(Object.getPrototypeOf(slide.speakerNotes)));
for (const search of [
  "slides add remove delete reorder move",
  "shape delete slide shapes add image textbox",
  "speakerNotes setText",
  "transition animation fade",
]) {
  const result = p.help("*", { search, include: ["index", "examples", "notes"], maxChars: 12000 });
  console.log(`--- ${search} ---`);
  console.log(result.ndjson);
}
