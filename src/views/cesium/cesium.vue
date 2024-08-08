<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted } from "vue";
import { mitBus } from "@/stores/mitt";
import tool from "@/components/Tool.vue";
import { materialFunction } from '@/utils/cesium/material.ts'
import { loadData, tdtOnline } from '@/utils/cesium/cesiumData'
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
    mitBus.emit("viewer", viewer);
  }
  materialFunction(viewer)
  loadData(viewer)
  let rightImageryVec = tdtOnline(viewer, 'vec_w', 'vec', 'tdtVec')
  let rightImageryCva = tdtOnline(viewer, 'cva_w', 'cva', 'tdtCva')
  // 设置图像分割前该影像在右侧显示
  rightImageryCva.splitDirection = Cesium.SplitDirection.RIGHT
  rightImageryVec.splitDirection = Cesium.SplitDirection.RIGHT
  // 获取或设置图像分割器在视口中的初始位置。有效值为0.0~1.0
  viewer.scene.splitPosition = 0.5
  let slider = document.getElementById("slider");
  //卷帘状态，true 表示开启，false 表示关闭
  let moveActive = false;
  //为卷帘工具实例化对象 ScreenSpaceEventHandler 
  let handler = new Cesium.ScreenSpaceEventHandler(slider as HTMLCanvasElement);
  //当鼠标左键单击时，开启卷帘
  handler.setInputAction(function () {
    console.log('左键')
    moveActive = true;
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  //当鼠标左键弹起时，关闭卷帘
  handler.setInputAction(function () {
    console.log('左键抬起')
    moveActive = false;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
  //当鼠标移动时，更新图像分割器的位置及卷帘的位置
  handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  //移动卷帘
  function move(movement: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (!moveActive) {
      return;
    }
    //获取鼠标在卷帘工具中移动结束时的屏幕坐标
    let relativeOffset = movement.endPosition.x;
    //计算图像分割器在视口中的新位置
    let splitPosition = (slider!.offsetLeft + relativeOffset) / slider!.parentElement!.offsetWidth;
    console.log(splitPosition)
    //卷帘移动，更新卷帘的位置
    slider!.style.left = `${100.0 * splitPosition}% `;
    //更新图像分割器在视口中的位置
    viewer.scene.splitPosition = splitPosition;
  }
}
</script>

<template>
  <div id="mymap">
    <div id="container">
      <div id="slider" style="width: 50px;height: 50px;background-color: aqua;">
      </div>
    </div>
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
</style>
