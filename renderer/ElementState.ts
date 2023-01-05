export interface ElementState {
  /**
   * This element's track number.
   */
  track: number;

  /**
   * This element's appearance time in relation to its composition.
   */
  time: number;

  /**
   * This element's duration in seconds.
   */
  duration: number;

  /**
   * Exit transition time in seconds, i.e. how long the next element overlaps it.
   */
  exit: number;

  /**
   * The source JSON of the element without the 'elements' property.
   */
  source: Record<string, any>;

  /**
   * This composition's elements. It's only set if the element is a composition.
   */
  elements?: ElementState[];
}
