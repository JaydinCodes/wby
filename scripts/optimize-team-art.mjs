import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.resolve("public/images/team-art");
const outputDirectory = path.join(sourceDirectory, "optimized");
const sizes = [720, 1440];
const qualityByWidth = new Map([
  [720, 80],
  [1440, 84],
]);

await mkdir(outputDirectory, { recursive: true });

const sourceFiles = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith("-hero.png"));

await Promise.all(
  sourceFiles.flatMap((file) => {
    const baseName = path.basename(file, ".png");
    const source = path.join(sourceDirectory, file);

    return sizes.map(async (width) => {
      const output = path.join(outputDirectory, `${baseName}-${width}.webp`);

      await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: qualityByWidth.get(width), effort: 6 })
        .toFile(output);

      console.log(`Created ${path.relative(process.cwd(), output)}`);
    });
  }),
);
