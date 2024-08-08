<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted } from "vue";
import { mitBus } from "@/stores/mitt";
import tool from "@/components/Tool.vue";
// import { materialFunction } from '@/utils/cesium/material.ts'
// import { drawMask } from '@/utils/cesium/entity.ts'
import { eagleEye } from '@/utils/cesium/eagleEye.ts'
let viewer: Cesium.Viewer;
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZDljOTg3Yy03ZDkxLTRkNTAtODhhYy03ZDIzNTU0YzgxZjYiLCJpZCI6MTMxNzg4LCJpYXQiOjE2ODA0ODg3NzB9.BK0bnFs_lhI-RLOZNMBxiOyGI8ZOGwG7Cok07TECti0";
onMounted(() => {
  iniMap();
});
async function iniMap() {
  try {
    viewer = new Cesium.Viewer("container", {
      fullscreenButton: true, //全屏显示
      vrButton: false, //
      homeButton: true,
      infoBox: false, //显示信息框
      selectionIndicator: false,
      animation: true,
      timeline: true,
      // sceneModePicker: true,//3D/2D选择器
      // terrain: Cesium.Terrain.fromWorldTerrain(),
      // terrainProvider:await Cesium.createWorldTerrainAsync({
      //   requestWaterMask: true,
      //   requestVertexNormals: true
      // }),
      // terrainProvider: await Cesium.createWorldTerrainAsync(),
      // terrainProvider:await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl("https://services.arcgisonline.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"),
      //显示模型阴影
      shadows: true,
    });
    //开启地形检测
    viewer.scene.globe.depthTestAgainstTerrain = true;
    // viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
  } catch (error) {
    console.log(error);
  } finally {
    //当主视图相机变化时，鹰眼视图跟着变化
    let eyeViewer=new eagleEye(viewer)
    eyeViewer.initViewer()
    mitBus.emit("viewer", viewer);
  }
}

</script>

<template>
  <div id="mymap">
    <div id="container">
    </div>
    <div id="eagleEye"></div>
    <tool></tool>
  </div>
</template>

<style>
#mymap {
  width: 100%;
  height: 100%;
}

#container {
  width: 100%;
  height: 100%;
  /* color: #75f320; */
}

#eagleEye {
  position: absolute;
  bottom: 30px;
  right: 3px;
  width: 20%;
  height: 20%;
  z-index: 2001;
  border: 2px #1b0ced solid;
}
</style>
