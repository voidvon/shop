declare module 'video-canvas' {
  export interface VideoCanvasOptions {
    canvas?: HTMLCanvasElement
    drawCall?: (ctx: CanvasRenderingContext2D, video: HTMLVideoElement) => void
    updateSize?: boolean
  }

  export default function videoCanvas(
    video: HTMLVideoElement,
    options?: VideoCanvasOptions,
  ): HTMLCanvasElement
}
