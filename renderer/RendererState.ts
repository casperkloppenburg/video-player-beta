import { ElementState } from './ElementState';

export interface RendererState {
  /**
   * When the renderer's state can be reversed, it is 'true'. See the renderer's undo and redo functions.
   */
  undo: boolean;

  /**
   * When the renderer's state can be reapplied, it is 'true'. See the renderer's undo and redo functions.
   */
  redo: boolean;

  /**
   * Duration of the video in seconds.
   */
  duration: number;

  /**
   * The source JSON of the video/image without the 'elements' property.
   */
  source: Record<string, any>;

  /**
   * The elements in this video/image
   */
  elements: ElementState[];
}
