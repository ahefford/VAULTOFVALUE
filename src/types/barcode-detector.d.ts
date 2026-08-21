export {}

declare global {
  interface DetectedBarcode {
    rawValue: string
    format: string
  }

  class BarcodeDetector {
    constructor(options?: { formats: string[] })
    static getSupportedFormats(): Promise<string[]>
    detect(source: CanvasImageSource): Promise<DetectedBarcode[]>
  }

  interface Window {
    BarcodeDetector?: typeof BarcodeDetector
  }
}
