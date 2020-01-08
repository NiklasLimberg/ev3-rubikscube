<script>
// Note how there's no template or styles in this component.

export default {
  // Gets us the provider property from the parent <my-canvas> component.
  inject: ["provider"],

  props: {
    // Start coordinates (percentage of canvas dimensions).
    x: {
      type: Number,
      default: 200
    },
    y: {
      type: Number,
      default: 200
    },
    innerRadius: {
      type: Number,
      default: 20
    },
    outerRadius: {
      type: Number,
      default: 40
    },
    color: {
      type: String,
      default: "#000"
    }
  },

  render() {
    // Since the parent canvas has to mount first, it's *possible* that the context may not be
    // injected by the time this render function runs the first time.
    if (!this.provider.context) return;
    const ctx = this.provider.context;
    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.arc(this.x, this.y, this.outerRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.innerRadius, 0, 2* Math.PI);
    ctx.fill()
  }
};
</script>