import { analyzeImageQuality } from "./agents/quality-critic";
import { generateCaptions } from "./agents/caption-agent";
import * as fs from "fs";

async function main() {
  const imgPath = `${process.env.HOME}/Downloads/eco.jpg`;
  console.log("Using image:", imgPath);

  const buf = fs.readFileSync(imgPath);
  console.log("\n[1/2] Running quality critic...");
  const quality = await analyzeImageQuality(buf);
  console.log("Quality result:", JSON.stringify(quality, null, 2));

  console.log("\n[2/2] Running caption agent...");
  const captions = await generateCaptions(quality.garment_description, "lusaka_lifestyle");
  console.log("Captions result:", JSON.stringify(captions, null, 2));

  console.log("\n✅ Both agents responded successfully.");
}

main().catch(console.error);
