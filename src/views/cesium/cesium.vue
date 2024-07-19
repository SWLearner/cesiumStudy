<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted } from "vue";
import { mitter } from "@/stores/mitt";
import {addEntity} from '@/utils/cesium/entity'
import {addPrimitive} from '@/utils/cesium/primitive'
import {leftClickGetAttributes} from '@/utils/cesium/eventClick' 
let viewer: Cesium.Viewer;
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZDljOTg3Yy03ZDkxLTRkNTAtODhhYy03ZDIzNTU0YzgxZjYiLCJpZCI6MTMxNzg4LCJpYXQiOjE2ODA0ODg3NzB9.BK0bnFs_lhI-RLOZNMBxiOyGI8ZOGwG7Cok07TECti0";
onMounted(() => {
  iniMap();
  mitter.emit("viewer", viewer);
});
async function iniMap() {
  try {
    viewer = new Cesium.Viewer("container", {
      fullscreenButton: true, //全屏显示
      vrButton: false, //
      homeButton: true,
      infoBox: false, //显示信息框
      selectionIndicator:false,
      // sceneModePicker: true,//3D/2D选择器
      // terrain: Cesium.Terrain.fromWorldTerrain(),
      // terrainProvider:await Cesium.createWorldTerrainAsync({
      //   requestWaterMask: true,
      //   requestVertexNormals: true
      // }),
      terrainProvider:await Cesium.createWorldTerrainAsync(),
      //terrainProvider:await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl("https://services.arcgisonline.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"),
      //显示模型阴影
      shadows: true,
    });
  } catch (error) {
    console.log(error);
  }
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(108, 40, 6000000.0),
  });
  addPrimitive(viewer)
  addEntity(viewer)
  leftClickGetAttributes(viewer)
}
</script>

<template>
  <div id="mymap">
    <div id="container"></div>
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
</style>
