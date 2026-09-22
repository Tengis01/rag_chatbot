import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const source = "/home/tengis/Documents/Tengis/rag_chatbot/presentation/template.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(source));
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,layout",
  include: "id,slide,name,title,bbox,text,textPreview,alt,isPlaceholder,placeholders",
  maxChars: 30000,
});
console.log(snapshot.ndjson);
