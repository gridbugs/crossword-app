import { createWorker } from "tesseract.js";
import loadImage from 'image-promise';

(async () => {
  const sample = await loadImage("/samples/smh-cryptic-2020-07-16.png");
  document.body.appendChild(sample);
  const worker = createWorker({
    logger: m => console.log(m)
  });
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const out = await worker.recognize(sample);
  console.log(out);
})();
