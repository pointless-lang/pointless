import Jimp from "jimp";
import { checkType } from "../lang/values.js";
import { checkWhole } from "../lang/num.js";
import { Panic } from "../lang/panic.js";
import { get } from "./Obj.js";
import im from "../immutable/immutable.js";

class PtlsImage {
  static ptlsName = "image";

  constructor(jimpImage) {
    this._jimp = jimpImage;
  }

  repr() {
    return `Image(${this._jimp.bitmap.width} x ${this._jimp.bitmap.height})`;
  }
}

function checkChannel(value, channel) {
  checkType(value, "number");
  checkWhole(value);

  if (value < 0 || value > 255) {
    throw new Panic("channel value must be between 0 and 255", {
      channel,
      value,
    });
  }

  return value;
}

function getPixelObj(jImg, x, y) {
  const rgba = Jimp.intToRGBA(jImg.getPixelColor(x, y));
  return im.OrderedMap({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a });
}

function colorToInt(color) {
  checkType(color, "object");
  const r = checkChannel(get(color, "r"), "r");
  const g = checkChannel(get(color, "g"), "g");
  const b = checkChannel(get(color, "b"), "b");
  const a = checkChannel(get(color, "a"), "a");
  return Jimp.rgbaToInt(r, g, b, a);
}

export async function load(path) {
  // Load an image from `path`. Supports PNG, JPEG, BMP, TIFF, and GIF.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // Image.load("photo.png")
  // ```

  checkType(path, "string");

  try {
    return new PtlsImage(await Jimp.read(path));
  } catch (err) {
    throw new Panic("image load error", { path, err: String(err) });
  }
}

export async function save(image, path) {
  // Write `image` to `path`. Format is determined by the file extension.
  // Returns `image`.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.save(img, "out.jpg")
  // ```

  checkType(image, "image");
  checkType(path, "string");

  try {
    await image._jimp.writeAsync(path);
    return image;
  } catch (err) {
    throw new Panic("image save error", { path, err: String(err) });
  }
}

export function blank(imgWidth, imgHeight, color) {
  // Create a new image of `imgWidth` by `imgHeight` pixels filled with `color`.
  // `color` must be an object `{ r, g, b, a }` with values (0-255).
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // Image.blank(100, 100, { r: 255, g: 0, b: 0, a: 255 })
  // ```

  checkType(imgWidth, "number");
  checkType(imgHeight, "number");
  checkWhole(imgWidth);
  checkWhole(imgHeight);

  if (imgWidth <= 0) {
    throw new Panic("width must be positive", { width: imgWidth });
  }

  if (imgHeight <= 0) {
    throw new Panic("height must be positive", { height: imgHeight });
  }

  return new PtlsImage(new Jimp(imgWidth, imgHeight, colorToInt(color)));
}

export function width(image) {
  // Return the width of `image` in pixels.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.width(img)
  // ```

  checkType(image, "image");
  return image._jimp.bitmap.width;
}

export function height(image) {
  // Return the height of `image` in pixels.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.height(img)
  // ```

  checkType(image, "image");
  return image._jimp.bitmap.height;
}

export function scale(image, imgWidth, imgHeight) {
  // Return a copy of `image` scaled to `imgWidth` by `imgHeight` pixels.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.scale(img, 800, 600)
  // ```

  checkType(image, "image");
  checkType(imgWidth, "number");
  checkType(imgHeight, "number");
  checkWhole(imgWidth);
  checkWhole(imgHeight);

  if (imgWidth <= 0) {
    throw new Panic("width must be positive", { width: imgWidth });
  }

  if (imgHeight <= 0) {
    throw new Panic("height must be positive", { height: imgHeight });
  }

  return new PtlsImage(image._jimp.clone().resize(imgWidth, imgHeight));
}

export function scaleWidth(image, imgWidth) {
  // Return a copy of `image` scaled to `imgWidth` pixels wide, adjusting height
  // automatically to preserve the aspect ratio.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.scaleWidth(img, 800)
  // ```

  checkType(image, "image");
  checkType(imgWidth, "number");
  checkWhole(imgWidth);

  if (imgWidth <= 0) {
    throw new Panic("width must be positive", { width: imgWidth });
  }

  const ratio = imgWidth / image._jimp.bitmap.width;
  const imgHeight = Math.max(1, Math.round(image._jimp.bitmap.height * ratio));
  return new PtlsImage(image._jimp.clone().resize(imgWidth, imgHeight));
}

export function scaleHeight(image, imgHeight) {
  // Return a copy of `image` scaled to `imgHeight` pixels tall, adjusting width
  // automatically to preserve the aspect ratio.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.scaleHeight(img, 600)
  // ```

  checkType(image, "image");
  checkType(imgHeight, "number");
  checkWhole(imgHeight);

  if (imgHeight <= 0) {
    throw new Panic("height must be positive", { height: imgHeight });
  }

  const ratio = imgHeight / image._jimp.bitmap.height;
  const imgWidth = Math.max(1, Math.round(image._jimp.bitmap.width * ratio));
  return new PtlsImage(image._jimp.clone().resize(imgWidth, imgHeight));
}

export function stretchWidth(image, imgWidth) {
  // Return a copy of `image` with width set to `imgWidth` pixels. Height is
  // unchanged, so the image may be distorted.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.stretchWidth(img, 800)
  // ```

  checkType(image, "image");
  checkType(imgWidth, "number");
  checkWhole(imgWidth);

  if (imgWidth <= 0) {
    throw new Panic("width must be positive", { width: imgWidth });
  }

  return new PtlsImage(
    image._jimp.clone().resize(imgWidth, image._jimp.bitmap.height),
  );
}

export function stretchHeight(image, imgHeight) {
  // Return a copy of `image` with height set to `imgHeight` pixels. Width is
  // unchanged, so the image may be distorted.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.stretchHeight(img, 600)
  // ```

  checkType(image, "image");
  checkType(imgHeight, "number");
  checkWhole(imgHeight);

  if (imgHeight <= 0) {
    throw new Panic("height must be positive", { height: imgHeight });
  }

  return new PtlsImage(
    image._jimp.clone().resize(image._jimp.bitmap.width, imgHeight),
  );
}

export function scaleBy(image, factor) {
  // Return a copy of `image` with both dimensions scaled by `factor`. Aspect
  // ratio is preserved.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.scaleBy(img, 0.5)
  // ```

  checkType(image, "image");
  checkType(factor, "number");

  if (factor <= 0) {
    throw new Panic("scale factor must be positive", { factor });
  }

  const imgWidth = Math.max(1, Math.round(image._jimp.bitmap.width * factor));
  const imgHeight = Math.max(1, Math.round(image._jimp.bitmap.height * factor));
  return new PtlsImage(image._jimp.clone().resize(imgWidth, imgHeight));
}

export function stretchWidthBy(image, factor) {
  // Return a copy of `image` with width scaled by `factor`. Height is
  // unchanged, so the image may be distorted.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.stretchWidthBy(img, 2)
  // ```

  checkType(image, "image");
  checkType(factor, "number");

  if (factor <= 0) {
    throw new Panic("scale factor must be positive", { factor });
  }

  const imgWidth = Math.max(1, Math.round(image._jimp.bitmap.width * factor));
  return new PtlsImage(
    image._jimp.clone().resize(imgWidth, image._jimp.bitmap.height),
  );
}

export function stretchHeightBy(image, factor) {
  // Return a copy of `image` with height scaled by `factor`. Width is
  // unchanged, so the image may be distorted.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.stretchHeightBy(img, 2)
  // ```

  checkType(image, "image");
  checkType(factor, "number");

  if (factor <= 0) {
    throw new Panic("scale factor must be positive", { factor });
  }

  const imgHeight = Math.max(1, Math.round(image._jimp.bitmap.height * factor));
  return new PtlsImage(
    image._jimp.clone().resize(image._jimp.bitmap.width, imgHeight),
  );
}

export function crop(image, x, y, cropWidth, cropHeight) {
  // Return a copy of `image` cropped to the rectangle at (`x`, `y`) with
  // dimensions `cropWidth` by `cropHeight`.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.crop(img, 10, 10, 200, 150)
  // ```

  checkType(image, "image");
  checkType(x, "number");
  checkType(y, "number");
  checkType(cropWidth, "number");
  checkType(cropHeight, "number");
  checkWhole(x);
  checkWhole(y);
  checkWhole(cropWidth);
  checkWhole(cropHeight);

  try {
    return new PtlsImage(image._jimp.clone().crop(x, y, cropWidth, cropHeight));
  } catch (err) {
    throw new Panic("crop error", {
      x,
      y,
      cropWidth,
      cropHeight,
      err: String(err),
    });
  }
}

export function rotate(image, deg) {
  // Return a copy of `image` rotated by `deg` degrees clockwise.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.rotate(img, 90)
  // ```

  checkType(image, "image");
  checkType(deg, "number");
  return new PtlsImage(image._jimp.clone().rotate(deg));
}

export function flipX(image) {
  // Return a copy of `image` flipped horizontally.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.flipX(img)
  // ```

  checkType(image, "image");
  return new PtlsImage(image._jimp.clone().flip(true, false));
}

export function flipY(image) {
  // Return a copy of `image` flipped vertically.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.flipY(img)
  // ```

  checkType(image, "image");
  return new PtlsImage(image._jimp.clone().flip(false, true));
}

export function blur(image, radius) {
  // Return a copy of `image` with a Gaussian blur of `radius` pixels applied.
  // `radius` must be a positive integer.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.blur(img, 3)
  // ```

  checkType(image, "image");
  checkType(radius, "number");
  checkWhole(radius);

  if (radius < 1) {
    throw new Panic("blur radius must be at least 1", { radius });
  }

  return new PtlsImage(image._jimp.clone().blur(radius));
}

export function grayscale(image) {
  // Return a grayscale copy of `image`.
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.grayscale(img)
  // ```

  checkType(image, "image");
  return new PtlsImage(image._jimp.clone().greyscale());
}

export function getPixel(image, x, y) {
  // Return the pixel at (`x`, `y`) as an object `{ r, g, b, a }` with values
  // (0-255).
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.getPixel(img, 0, 0)
  // ```

  checkType(image, "image");
  checkType(x, "number");
  checkType(y, "number");
  checkWhole(x);
  checkWhole(y);

  const imgWidth = image._jimp.bitmap.width;
  const imgHeight = image._jimp.bitmap.height;

  if (x < 0 || x >= imgWidth) {
    throw new Panic("x out of bounds", { x, width: imgWidth });
  }

  if (y < 0 || y >= imgHeight) {
    throw new Panic("y out of bounds", { y, height: imgHeight });
  }

  return getPixelObj(image._jimp, x, y);
}

export function setPixel(image, x, y, color) {
  // Return a copy of `image` with the pixel at (`x`, `y`) set to `color`.
  // `color` must be an object `{ r, g, b, a }` with values (0-255).
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  // Image.setPixel(img, 0, 0, { r: 255, g: 0, b: 0, a: 255 })
  // ```

  checkType(image, "image");
  checkType(x, "number");
  checkType(y, "number");
  checkWhole(x);
  checkWhole(y);

  const imgWidth = image._jimp.bitmap.width;
  const imgHeight = image._jimp.bitmap.height;

  if (x < 0 || x >= imgWidth) {
    throw new Panic("x out of bounds", { x, width: imgWidth });
  }

  if (y < 0 || y >= imgHeight) {
    throw new Panic("y out of bounds", { y, height: imgHeight });
  }

  const cloned = image._jimp.clone();
  cloned.setPixelColor(colorToInt(color), x, y);
  return new PtlsImage(cloned);
}

export async function mapPixels(image, fn) {
  // Return a copy of `image` with each pixel transformed by `fn`. `fn` takes an
  // `{ r, g, b, a }` object and must return a new `{ r, g, b, a }` object with
  // values (0-255).
  //
  // ```ptls --no-eval
  // Image = import "std:Image"
  // img = Image.load("photo.png")
  //
  // fn invert(p)
  //   { r: 255 - p.r, g: 255 - p.g, b: 255 - p.b, a: p.a }
  // end
  //
  // Image.mapPixels(img, invert)
  // ```

  checkType(image, "image");
  checkType(fn, "function");

  const cloned = image._jimp.clone();
  const imgWidth = cloned.bitmap.width;
  const imgHeight = cloned.bitmap.height;

  for (let y = 0; y < imgHeight; y++) {
    for (let x = 0; x < imgWidth; x++) {
      const pixel = getPixelObj(cloned, x, y);
      const result = await fn.call(pixel);
      checkType(result, "object");
      const r = checkChannel(get(result, "r"), "r");
      const g = checkChannel(get(result, "g"), "g");
      const b = checkChannel(get(result, "b"), "b");
      const a = checkChannel(get(result, "a"), "a");
      cloned.setPixelColor(Jimp.rgbaToInt(r, g, b, a), x, y);
    }
  }

  return new PtlsImage(cloned);
}
