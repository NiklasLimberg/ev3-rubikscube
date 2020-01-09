<template>
  <div>
    <video width="800px" height="800px"></video>
    <vueCanvas class="vueCanvas" width="800px" height="800px">
      <vueCirle
        v-for="circle in circles"
        :key="circle.id"
        :x="circle.x"
        :y="circle.y"
        :color="circle.color"
        :innerRadius="10"
        :outerRadius="20"
      ></vueCirle>
    </vueCanvas>
    <div class="info">
      <div v-text="err"></div>
    </div>
  </div>
</template>
<script>
const nearestColor = require("nearest-color").from({
  white: "#FFFFFF",
  black: "#000000",
  red: "#f00",
  yellow: "#ff0",
  blue: "#00f",
  green: "#008000",
  orange: "#FFA500"
});

import devtools from "@vue/devtools";
import vueCanvas from "~/Components/vueCanvas.vue";
import vueCirle from "~/Components/vueCirle.vue";

export default {
  data: function() {
    return {
      err: "",
      video: undefined,
      circles: []
    };
  },
  components: { vueCanvas, vueCirle },
  async mounted() {
    if (process.env.NODE_ENV === "development") {
      devtools.connect("192.168.178.29");
    }
    try {
      const video = document.querySelector("video");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: 400, height: 400, facingMode: "environment" }
      });
      video.srcObject = mediaStream;
      video.onloadedmetadata = function(e) {
        video.play();
      };
      this.video = video;

      this.drawLoop();
    } catch (err) {
      this.err = err.name + ": " + err.message;
      // always check for errors at the end.
    }
  },
  methods: {
    createCircles() {
      let circles = [];
      const spacingBetween = 800 / 4;
      for (let i = 0; i <= 2; i++) {
        for (let x = 0; x <= 2; x++) {
          circles.push({
            y: (i + 1) * spacingBetween,
            x: (x + 1) * spacingBetween,
            color: "#fff"
          });
        }
      }
      circles.map((val, id) => {
        return { id: id, x: val.x, y: val.y };
      });

      return circles;
    },
    drawLoop(model) {
      const offscreenCanvas = new OffscreenCanvas(400, 400);
      const ctx = offscreenCanvas.getContext("2d");
      this.circles = this.createCircles();
      setInterval(() => {
        ctx.drawImage(this.video, 0, 0, 400, 400);
        const image = ctx.getImageData(0, 0, 400, 400).data;
        this.circles.forEach(circle => {
          const index = (circle.y / 2) * (400 * 4) + (circle.x / 2) * 4;
          circle.color = nearestColor({
            r: image[index],
            g: image[index + 1],
            b: image[index + 2]
          }).name;
        });
      }, 1000);
    }
  }
};
</script>
<style>
body {
  margin: 0;
  padding: 0;
}

video {
  position: absolute;
  top: 0;
  left: 0;
  width: 800px;
  height: 800px;
}
.vueCanvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
}
.info {
  font-size: 3rem;
  position: absolute;
  bottom: 0;
  left: 0;
}
</style>