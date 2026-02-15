/**
 * A Cell that doesn't do anything. It just draws empty lines.
 * Used as a placeholder in column spanning.
 * @constructor
 */
class ColSpanCell {
  init(tableOptions) {}

  draw() {
    return '';
  }

  mergeTableOptions() {}
}

export default ColSpanCell;
