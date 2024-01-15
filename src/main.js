const fs = require("fs/promises");
const sharp = require("sharp");
const { glob } = require("glob");
const process = require("process");

let inputDir;
let outputDir;
let format;

for (let index = 2; index < process.argv.length; index++) {
  const element = process.argv[index];

  if (/^--input/.test(element)) {
    inputDir = element.replace(/^--input=(.*)/, "$1");

    continue;
  }

  if (/^--output/.test(element)) {
    outputDir = element.replace(/^--output=(.*)/, "$1");

    continue;
  }

  if (/^--format/.test(element)) {
    format = element.replace(/^--format=(.*)/, "$1");

    continue;
  }
}

main(inputDir, outputDir, format);

async function main(inputDir, outDir, format) {
  const inputGlob = await glob(inputDir + "/**/*", {
    nodir: true,
  });

  const inputDirRegexp = new RegExp(`${inputDir}(.*)`);

  for (const file of inputGlob) {
    const fileName = file.replace(inputDirRegexp, "$1");
    const filterDir = fileName.split("/");
    const outDirPath =
      outDir +
      filterDir
        .filter((_, index) => {
          return index < filterDir.length - 1;
        })
        .join("/");

    const outFile = `${outDirPath}/${filterDir.at(-1).split(".")[0]}.${format}`;

    try {
      await fs.readdir(outDirPath);
    } catch (error) {
      try {
        await fs.mkdir(outDirPath, { recursive: true });

        console.log("Create -->", outDirPath, "<-- Success");
      } catch (error) {
        console.error(`Create --> ${outDirPath} <-- Fail`);
      }
    }

    sharp(file)
      .sharpen()
      .toFormat(format)
      .toFile(outFile)
      .then((info) => {
        console.log("Sharp -->", outFile, "size:", info.size + "B");
      });
  }
}
