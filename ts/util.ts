/**
 * Takes the src of an image and returns a Promise which resolves to
 * a HTMLImageElement containing the image.
 */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onerror = reject;
    img.onload = () => {
      resolve(img);
    };
  });
}
