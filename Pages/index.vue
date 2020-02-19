<template>
  <div>
    <video :width="dimension" :height="dimension"></video>
    <vueCanvas class="vueCanvas" :width="dimension" :height="dimension">
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
    <div>
      <div class="largeText" v-text="colors[nextToScan]"></div>
      <div class="largeText" v-text="solvingSteps"></div>
      <button class="largeText" :width="dimension" @click="searchforDevices()">Suche nach Geräten</button>
      <button class="largeText" :width="dimension" @click="scan()">Scan</button>
      <button class="largeText" :width="dimension" @click="grabColors()">Grab Colors</button>
      <button class="largeText" :width="dimension" @click="back()">Undo</button>
    </div>
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
})

import {searchforDevices} from '../lib/bluetooth.js';

const solver = require("rubiks-cube-solver");
const nearestColor = require("nearest-color").from({
  white: "#FFFFFF",
  red: { r: 147, g: 34, b: 54 },
  yellow: { r: 220, g: 217, b: 51 },
  blue: "#00f",
  green: "#008000",
  orange: { r: 228, g: 100, b: 32 }
});

import devtools from "@vue/devtools";
import vueCanvas from "~/Components/vueCanvas.vue";
import vueCirle from "~/Components/vueCirle.vue";

export default {
  data: function() {
    return {
      err: "",
      dimension : 1080,
      video: undefined,
      circles: []
    };
  },
  components: { vueCanvas, vueCirle },
  async mounted() {
    if (process.env.NODE_ENV === "development") {
      //devtools.connect("192.168.178.29");
    }
    try {
      const video = document.querySelector("video");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: this.dimension / 2, height: this.dimension / 2, facingMode: "environment" }
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
      const spacingBetween = this.dimension / 4;
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
        ctx.drawImage(this.video, 0, 0, this.dimension / 2, this.dimension / 2);
        const image = ctx.getImageData(0, 0, this.dimension / 2, this.dimension / 2).data;
        this.circles.forEach(circle => {
          const index = (circle.y / 2) * (this.dimension) + (circle.x / 2) * 4;
          circle.color = nearestColor({
            r: image[index],
            g: image[index + 1],
            b: image[index + 2]
          }).name;
        });
      }, 1000);
     }
    },
    scan() {
      const circles = this.circles;
      if (circles[4].color === this.colors[this.nextToScan]) {
        this.scanned += circles.map(circle => circle.color.charAt(0)).join("");
        this.nextToScan++;
        if (this.nextToScan == 6) {
          console.log(this.scanned);
          this.solvingSteps = solver(this.scanned);
          this.nextToScan = 0;
          this.scanned = "";
        }
      }
    },
    undo() {
      this.nextToScan--;
      this.scanned.splice(-6, 6);
    },
    grabColors () {
      const offscreenCanvas = new OffscreenCanvas(400, 400);
      const ctx = offscreenCanvas.getContext("2d");
      ctx.drawImage(this.video, 0, 0, 400, 400);
      const image = ctx.getImageData(0, 0, 400, 400).data;     
      this.circles.forEach(circle => {
        const index = (circle.y / 2) * (400 * 4) + (circle.x / 2) * 4;
        console.log( `y: ${circle.y} x: ${circle.x} { r: ${image[index]}, g: ${image[index + 1]}, b: ${image[index + 2]}}`);
      })
    }
  }
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
.largeText {
  font-size: 5rem;
  margin: 1rem 0;
}
.scan {
  width: 1080px;
  padding: 0 2rem;
}
</style>