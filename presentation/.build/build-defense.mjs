import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "/home/tengis/Documents/Tengis/rag_chatbot";
const templatePath = path.join(workspaceDir, "presentation/template.pptx");
const skillDir = "/home/tengis/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const runtimePython = "/home/tengis/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python";
process.env.RUNTIME_NODE = "/home/tengis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node";
process.env.RUNTIME_NODE_MODULES = "/home/tengis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
process.env.RUNTIME_BIN_DIR = "/home/tengis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin";
process.env.RUNTIME_PYTHON = runtimePython;
const stagingDir = path.join(workspaceDir, "presentation/.build/finalizer");
const finalPath = path.join(workspaceDir, "presentation/output/RAG_Chatbot_Defense_v3.pptx");
const font = "Noto Sans";
const navy = "#315C7D";
const textBlue = "#547B98";

await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });

const presentation = await PresentationFile.importPptx(await FileBlob.load(templatePath));

// Keep the cover, background, objectives, methodology, findings, discussion,
// reflection and closing layouts. The source template remains untouched.
for (const index of [9, 2, 1]) {
  presentation.slides.getItem(index).delete();
}

function setText(id, value, options = {}) {
  const shape = presentation.resolve(id);
  shape.text = value;
  shape.text.style = {
    typeface: font,
    fontSize: options.fontSize ?? 27,
    bold: options.bold ?? false,
    color: options.color ?? textBlue,
    autoFit: options.autoFit ?? "shrinkText",
    wrap: true,
    verticalAlignment: options.verticalAlignment ?? "middle",
    alignment: options.alignment ?? "left",
    lineSpacing: options.lineSpacing ?? 1.08,
  };
  if (options.position) shape.position = options.position;
  return shape;
}

function setTitle(id, value, position) {
  return setText(id, value, {
    fontSize: 49,
    bold: true,
    color: navy,
    autoFit: "shrinkText",
    verticalAlignment: "middle",
    alignment: "left",
    lineSpacing: 0.95,
    position,
  });
}

function setFooter(id, slideNumber) {
  setText(id, "CALLPRO LABS  •  ҮЙЛДВЭРЛЭЛИЙН ДАДЛАГА", {
    fontSize: 14,
    color: "#6F91AA",
    alignment: "left",
  });
  const numberIds = {
    2: "sh/jadsz2xk",
    3: "sh/x4vedgvm",
    4: "sh/w32twb6l",
    5: "sh/eh0ba1sr",
    6: "sh/o7ydoret",
    7: "sh/bih4na5w",
  };
  if (numberIds[slideNumber]) {
    setText(numberIds[slideNumber], String(slideNumber).padStart(2, "0"), {
      fontSize: 16,
      bold: true,
      color: navy,
      alignment: "center",
    });
  }
}

// 1 — Cover
setText("sh/hofulsf2", "БАРИМТАД ТУЛГУУРЛАСАН\nRAG ЧАТБОТ", {
  fontSize: 56,
  bold: true,
  color: navy,
  alignment: "center",
  lineSpacing: 0.92,
  position: { left: 360, top: 440, width: 1200, height: 190 },
});
presentation.resolve("sh/ul4vaxgb").delete();
setText("sh/wn6dc7eh", "Үйлдвэрлэлийн дадлагын хамгаалалт", {
  fontSize: 22,
  color: textBlue,
  alignment: "center",
  position: { left: 610, top: 584, width: 700, height: 105 },
});
setText("sh/vmdcj2xw", "Ц. Тэнгис  •  CallPro Labs  •  2026", {
  fontSize: 19,
  color: "#6F91AA",
  alignment: "center",
});
presentation.resolve("nt/y90nupkv").setText(
  "20 секунд. Сайн байна уу. Намайг Ц. Тэнгис гэдэг. Би CallPro Labs компанид хийсэн үйлдвэрлэлийн дадлагынхаа хүрээнд хөгжүүлсэн баримтад тулгуурласан RAG чатботын ажлыг танилцуулна."
);

// 2 — Company and internship role
setText("sh/kbm987y5", "БАЙГУУЛЛАГА БА МИНИЙ ОРОЛЦОО", {
  fontSize: 44,
  bold: true,
  color: navy,
  position: { left: 760, top: 175, width: 930, height: 105 },
  lineSpacing: 0.95,
});
setText("sh/5cva1cfq",
  "CALLPRO LABS\nCallPro-ийн AI чиглэлийн хөгжүүлэлт, монгол яриаг текст болгох загварын өгөгдөл бэлтгэдэг.\n\nМИНИЙ ҮҮРЭГ\n• 5–60 секундын аудио бичлэгийг сонсож текст болгон буулгасан\n• Сул авиа болон зөв бичгийн дүрмийг бүрэн тэмдэглэсэн\n• Өдөр тутмын ажлын зэрэгцээ RAG чатботын бие даасан төсөл хөгжүүлсэн",
  { fontSize: 27, position: { left: 760, top: 300, width: 920, height: 540 }, lineSpacing: 1.05 }
);
setFooter("sh/i94r6xgz", 2);
presentation.resolve("nt/jyx0ra1s").setText(
  "50 секунд. CallPro Labs нь CallPro-ийн AI чиглэлийн ажлыг гүйцэтгэдэг. Миний өдөр тутмын ажил нь оператор, хэрэглэгчийн таван секундээс нэг минут орчим аудиог сонсож, сул авиа хүртэл нь орхилгүй текст болгон буулгах байсан. Энэ өгөгдөл дараагийн шатны хяналтаар орж, speech-to-text загварын сургалтад ашиглагддаг. Үүний зэрэгцээ дадлагын удирдагчийн зөвлөмжөөр RAG чатботын бие даасан төслийг хийсэн."
);

// 3 — Problem and goal
setTitle("sh/dgbulwnm", "ТӨСЛИЙН ЗОРИЛГО");
setText("sh/z2tcnm5s", "01", { fontSize: 30, bold: true, color: navy, alignment: "center" });
setText("sh/cf2tcr61",
  "АСУУДАЛ\nБайгууллагын PDF, журам, тайлангаас мэдээллийг гараар хайхад хугацаа их ордог. Түлхүүр үгийн хайлт нь өөр үгээр бичсэн ижил утгыг алдаж болно.",
  { fontSize: 28, alignment: "center", lineSpacing: 1.08 }
);
setText("sh/l4bupwny", "02", { fontSize: 30, bold: true, color: navy, alignment: "center" });
setText("sh/yhkbe1o7",
  "ШИЙДЭЛ\nХэрэглэгчийн баримтаас утгаар хайж, зөвхөн олдсон контекстээр хариулан, ашигласан эх сурвалжийг хамт харуулах RAG чатботын MVP бүтээх.",
  { fontSize: 28, alignment: "center", lineSpacing: 1.08 }
);
setFooter("sh/w32dkbuh", 3);
presentation.resolve("nt/i107q5of").setText(
  "45 секунд. Байгууллагын мэдлэг PDF тайлан, журам, гарын авлагад тархан хадгалагддаг. Хэрэглэгч аль файлд байгааг таамаглан нээж хайдаг бөгөөд түлхүүр үг өөр байвал хэрэгтэй хэсэг олдохгүй. Иймээс хэрэглэгч өөрийн баримтыг оруулж, утгаар хайсан хэсэгтээ тулгуурласан хариулт болон эх сурвалж авах систем бүтээх зорилго тавьсан."
);

// 4 — Engineering path
setTitle("sh/yhg7epsj", "ХЭРЭГЖҮҮЛСЭН ДАРААЛАЛ");
setText("sh/ml07i9sv", "01", { fontSize: 30, bold: true, color: navy, alignment: "center" });
setText("sh/zi98nu94",
  "ШААРДЛАГА БА ЗОХИОМЖ\nАсуудлыг тодорхойлж, web–API–өгөгдлийн сангийн архитектур болон хэрэглэгчийн тусгаарлалтыг төлөвлөсөн.",
  { fontSize: 25, lineSpacing: 1.05 }
);
setText("sh/7m98ru9g", "02", { fontSize: 30, bold: true, color: navy, alignment: "center" });
setText("sh/87ipkzal",
  "ТЕХНОЛОГИЙН СОНГОЛТ\nReact/Vite, Fastify, PostgreSQL + pgvector, Gemini, Expo-г MVP-ийн шаардлага болон зардалд тулгуурлан сонгосон.",
  { fontSize: 25, lineSpacing: 1.05 }
);
setText("sh/oryp8fah", "03", { fontSize: 30, bold: true, color: navy, alignment: "center" });
setText("sh/98rqt4r6",
  "ХЭРЭГЖҮҮЛЭЛТ БА ТУРШИЛТ\nИндексжүүлэлт, хайлт, хариулт, нэвтрэлт, web/mobile клиент болон байршуулалтыг үе шаттай хийж шалгасан.",
  { fontSize: 25, lineSpacing: 1.05 }
);
setFooter("sh/h4bupgn6", 4);
presentation.resolve("nt/x8f69ofe").setText(
  "65 секунд. Эхлээд функц бичихээс өмнө системийн шаардлага, өгөгдлийн урсгал, олон хэрэглэгчийн тусгаарлалтыг тодорхойлсон. Дараа нь web болон mobile нэг API ашиглахаар архитектураа тогтоосон. Энгийн өгөгдөл болон embedding векторыг нэг газар хадгалахын тулд PostgreSQL дээр pgvector ашигласан. TypeScript ашиглан React, Fastify, Expo клиентүүдийн өгөгдлийн бүтцийг нийцүүлсэн. Ингээд баримт боловсруулах урсгалаас эхэлж, хайлт, хариулт, auth, клиент, байршуулалт гэсэн дарааллаар хөгжүүлсэн."
);

// 5 — Architecture and stack
setText("sh/cb2tkvap", "АРХИТЕКТУР БА ТЕХНОЛОГИЙН СОНГОЛТ", {
  fontSize: 40,
  bold: true,
  color: navy,
  position: { left: 500, top: 90, width: 1280, height: 100 },
  lineSpacing: 0.95,
});
setText("sh/dcbud0ra",
  "ЯАГААД ЭНЭ АРХИТЕКТУР ВЭ?\n\n• Web болон mobile нэг Fastify API ашиглана\n• PostgreSQL өгөгдөл ба 768 хэмжээст векторыг хамт хадгална\n• Better Auth session-аар бүх хүсэлтийг user_id-аар тусгаарлана\n• Gemini embedding болон хариулт үүсгэлтийг серверээс дуудна",
  { fontSize: 25, position: { left: 80, top: 275, width: 710, height: 560 }, lineSpacing: 1.08 }
);
const architectureBytes = await fs.readFile(path.join(workspaceDir, "report/figures/architecture.png"));
const architectureImage = presentation.resolve("im/wz6dk3it");
architectureImage.replace({ blob: architectureBytes, contentType: "image/png", alt: "RAG chatbot system architecture", fit: "contain" });
architectureImage.frame = { left: 790, top: 215, width: 1060, height: 690 };
architectureImage.geometry = "roundRect";
architectureImage.borderRadius = 18;
setFooter("sh/l0vuh0rm", 5);
presentation.resolve("nt/gnmp4jqx").setText(
  "65 секунд. Энэ зурагт хоёр клиент нэг Fastify API руу хандаж байгааг харуулсан. API нь documents, ingestion, retrieval, chat, auth гэсэн модулиудад хуваагдсан. PostgreSQL нь хэрэглэгч, баримт, чат зэрэг энгийн өгөгдөлтэй хамт 768 хэмжээст embedding векторыг хадгалдаг. Better Auth-аас ирсэн хэрэглэгчийн id бүх баримт, chunk, conversation, message хүсэлтэд шүүлт болдог. Gemini түлхүүр зөвхөн backend дээр хадгалагддаг."
);

// 6 — RAG concepts
setTitle("sh/tkby9kzm", "RAG-Д СУРСАН ШИНЭ ОЙЛГОЛТУУД", { left: 780, top: 110, width: 960, height: 105 });
presentation.resolve("sh/ri9g7uhw").delete();
presentation.resolve("sh/6h0fypgb").delete();
const ragBytes = await fs.readFile(path.join(workspaceDir, "report/figures/rag-flow.png"));
const ragSlide = presentation.resolve("sl/fu1gfa1s");
ragSlide.images.add({
  blob: ragBytes,
  contentType: "image/png",
  alt: "RAG indexing, retrieval and grounded generation flow",
  fit: "contain",
  position: { left: 45, top: 205, width: 860, height: 690 },
  geometry: "roundRect",
  borderRadius: 18,
});
setText("sh/sjix0zy1",
  "CHUNK\nУрт баримтыг давхцалтай жижиг хэсгүүдэд хуваана.\n\nEMBEDDING\nТекстийн утгыг 768 хэмжээст вектор болгоно.\n\nRETRIEVAL + GROUNDING\nАсуултад ойр хэсгийг хайж, зөвхөн олдсон контекстээр хариулна. Эх сурвалжийг хамт буцаана.",
  { fontSize: 27, position: { left: 965, top: 270, width: 770, height: 530 }, lineSpacing: 1.06 }
);
setFooter("sh/id0fu50z", 6);
presentation.resolve("nt/fu1gfa1s").setText(
  "70 секунд. RAG дээр надад шинээр орж ирсэн гол ойлголтуудыг хэрэгжүүлэлттэй нь холбож тайлбарлая. Chunk гэдэг нь урт баримтыг давхцалтай жижиг хэсгүүдэд хуваах үйлдэл. Embedding нь хэсгийн утгыг 768 хэмжээст тоон вектор болгодог. Асуултыг мөн вектор болгож, cosine similarity болон HNSW индексээр ойр хэсгүүдийг олно. Олдсон хэсгийг context болгон Gemini-д өгч, зөвхөн түүний хүрээнд хариулахыг заасан. Ингэснээр хариулт бүрт ашигласан source snippet-ийг харуулах боломжтой болсон."
);

// 7 — Tests and evidence
setTitle("sh/1cfmhgne", "ТУРШИЛТ БА БОДИТ ҮР ДҮН");
setText("sh/0b65obm9",
  "БАТАЛГААЖУУЛСАН\n\n• PDF болон текст боловсруулалт\n• Эх сурвалжтай grounded хариулт\n• Web ба standalone Android APK\n• Хоёр бүртгэлээр өгөгдлийн тусгаарлалт\n• Azure + Cloudflare HTTPS байршуулалт",
  { fontSize: 27, position: { left: 155, top: 280, width: 700, height: 510 }, lineSpacing: 1.08 }
);
setText("sh/nex4jq5k",
  "ШИЙДСЭН АСУУДЛУУД\n\n• Кирилл баримт, латин асуултын threshold\n• Gemini 429 квотод завсарлагатай дахин оролдлого\n• Mobile boot loop ба API хаягийн сонголт\n• Шинэ хувилбарын drain, backup, rollback\n\nХязгаарлалт: mobile UI болон анхны cold start-ыг сайжруулах шаардлагатай.",
  { fontSize: 25, position: { left: 970, top: 255, width: 720, height: 570 }, lineSpacing: 1.06 }
);
setFooter("sh/9gzml0nq", 7);
presentation.resolve("nt/udsvah03").setText(
  "70 секунд. Үндсэн урсгалыг PDF, шууд текст, боловсруулалтын төлөв, grounded хариулт, эх сурвалжаар шалгасан. Android APK-г бодит төхөөрөмж дээр суулгаж, production API-тай ажиллуулсан. Хоёр тусдаа бүртгэлээр нэг хэрэглэгчийн баримт, чат нөгөөд харагдахгүйг баталгаажуулсан. Хөгжүүлэлтийн үед кирилл баримт ба латин асуултын similarity бага гарахад threshold-ыг туршилтаар тохируулсан. Мөн Gemini-ийн 429 квот, mobile API хаяг, boot loop, production release-ийн drain болон rollback асуудлуудыг шийдсэн. Mobile UI болон анхны cold start одоогийн мэдэгдэж буй хязгаарлалт."
);

// 8 — Conclusion
setText("sh/xcryxg7y", "ДҮГНЭЛТ", {
  fontSize: 58,
  bold: true,
  color: navy,
  alignment: "center",
  position: { left: 530, top: 250, width: 860, height: 100 },
});
const closingSlide = presentation.resolve("sl/jetc3ut0");
const closingBody = closingSlide.shapes.add({
  geometry: "textbox",
  position: { left: 380, top: 390, width: 1160, height: 285 },
  fill: "none",
  line: { fill: "none", width: 0 },
});
closingBody.text = "Баримтад тулгуурласан, эх сурвалжтай, олон хэрэглэгчийн web/mobile RAG системийг хөгжүүлж, бодит сервер болон Android төхөөрөмж дээр баталгаажуулсан.\n\nЭзэмшсэн чадвар: RAG  •  pgvector  •  auth  •  Docker  •  CI/CD  •  cloud deployment";
closingBody.text.style = {
  typeface: font,
  fontSize: 28,
  color: textBlue,
  alignment: "center",
  verticalAlignment: "middle",
  autoFit: "shrinkText",
  wrap: true,
  lineSpacing: 1.12,
};
setText("sh/61kzalof", "АНХААРАЛ ХАНДУУЛСАНД БАЯРЛАЛАА", {
  fontSize: 17,
  color: "#6F91AA",
  alignment: "center",
});
presentation.resolve("nt/jetc3ut0").setText(
  "35 секунд. Дүгнэж хэлбэл, дадлагын хугацаанд баримтад тулгуурлан хариулдаг RAG системийн бүрэн урсгалыг судалгаанаас эхлэн хөгжүүлж, web, mobile болон production орчинд баталгаажуулсан. Энэ ажлаар RAG, vector search, authentication, container deployment, CI/CD болон алдаа оношлох практик чадваруудыг эзэмшсэн. Анхаарал хандуулсанд баярлалаа. Асуулт байвал хариулъя."
);

const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, "container_tools/artifact_tool_utils.mjs")
).href);
const candidatePath = path.join(stagingDir, "candidate-v3.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

await finalizePresentation({
  explicitTotalSlideCount: 8,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "18288000,10287000",
    "--validate-heading-fit",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy: {
    basis: "design",
    families: [font],
  },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "RAG_Chatbot_Defense_v3.validation.json"),
});

console.log(finalPath);
