class MockComponent {
  constructor({ target, props = {} }) {
    target.textContent = props.text || `Svelte Mock Component`;
  }
}

export { MockComponent };
