<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted } from "vue";
import { mitBus } from "@/stores/mitt";
// import {addEntity} from '@/utils/cesium/entity'
// import {addPrimitive,createPolygonTest} from '@/utils/cesium/primitive'
// import {leftClickGetAttributes} from '@/utils/cesium/eventClick'
// import tool from "@/components/Tool.vue";
import {loadData} from '@/utils/cesium/cesiumData'
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
      terrainProvider: await Cesium.createWorldTerrainAsync(),
      // terrainProvider:await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl("https://services.arcgisonline.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"),
      //显示模型阴影
      shadows: true,
    });
  } catch (error) {
    console.log(error);
  } finally {
    mitBus.emit("viewer", viewer);
  }
  // viewer.camera.setView({
  //   destination: Cesium.Cartesian3.fromDegrees(113, 30, 5000000.0),
  // });
  // addEntity(viewer)
  // addPrimitive(viewer)
  // leftClickGetAttributes(viewer)
  // singlePhoto(viewer)
  loadData(viewer)
  
//   viewer.camera.flyTo({
//     destination:Cesium.Cartesian3.fromDegrees(113, 30, 5000000.0)
//   })
}
</script>

<template>
  <div id="mymap">
    <div id="container"></div>
    <!-- <tool></tool> -->
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
