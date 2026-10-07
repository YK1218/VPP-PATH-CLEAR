export type FrameSource = HTMLVideoElement | HTMLCanvasElement;
export type TensorLayout = "nhwc" | "nchw";
export type PixelChannelOrder = "rgb" | "bgr";
export type PixelNormalization = "none" | "zero-to-one" | "minus-one-to-one";

export interface FrameProcessingOptions {
  width: number;
  height: number;
  layout: TensorLayout;
  channelOrder?: PixelChannelOrder;
  normalization?: PixelNormalization;
}

/** Resizes one camera frame and returns RGB/BGR pixel data in the requested layout. */
export function processFrame(
  source: FrameSource,
  options: FrameProcessingOptions
): Float32Array {
  const { width, height, layout } = options;
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new Error("Frame output width and height must be positive integers.");
  }

  const sourceWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
  const sourceHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("The camera frame has no available image data.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Could not create a 2D canvas context to process the camera frame.");
  }

  context.drawImage(source, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const channelOrder = options.channelOrder ?? "rgb";
  const normalization = options.normalization ?? "none";
  const output = new Float32Array(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const channels = channelOrder === "rgb"
        ? [pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]]
        : [pixels[pixelIndex + 2], pixels[pixelIndex + 1], pixels[pixelIndex]];

      for (let channel = 0; channel < 3; channel += 1) {
        const rawValue = channels[channel] ?? 0;
        const value = normalization === "zero-to-one"
          ? rawValue / 255
          : normalization === "minus-one-to-one"
            ? rawValue / 127.5 - 1
            : rawValue;
        const outputIndex = layout === "nhwc"
          ? (y * width + x) * 3 + channel
          : channel * width * height + y * width + x;
        output[outputIndex] = value;
      }
    }
  }

  return output;
}
