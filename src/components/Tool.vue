<template>
  <!-- 工具集 -->
  <div class="tool">
    <el-popover class="popover" placement="left" width="240px" trigger="click">
      <template #reference>
        <el-button class="edit" size="large" type="primary" circle
          >编辑</el-button
        >
      </template>
      <div>
        <el-button
          size="large"
          type="primary"
          name="Point"
          circle
          @click="tool.draw('point')"
          >点</el-button
        >
        <el-button
          size="large"
          type="primary"
          name="LineString"
          circle
          @click="tool.draw('line')"
          >线</el-button
        >
        <el-button
          size="large"
          type="primary"
          name="Polygon"
          circle
          @click="tool.draw('polygon')"
          >面</el-button
        >
        <el-button
          size="large"
          type="primary"
          name="Polygon"
          circle
          @click="tool.draw('circle')"
          >圆</el-button
        >
        <el-button
          size="large"
          type="primary"
          name="Polygon"
          circle
          @click="tool.draw('rectangle')"
          >正</el-button
        >
      </div>
    </el-popover>
    <el-popover class="popover" placement="left" width="120px" trigger="click">
      <template #reference>
        <el-button class="edit" size="large" type="primary" circle 
          >测量</el-button
        >
      </template>
      <div>
        <el-button size="large" type="primary" name="Length" circle @click="tool.measureLine()"
          >测线</el-button
        >
        <el-button size="large" type="primary" name="Area" circle @click="tool.measureArea()"
          >侧面</el-button
        >
      </div>
    </el-popover>
    <el-button class="edit" size="large" type="primary" circle>清除</el-button>
    <el-button class="edit" size="large" type="primary" circle>放大</el-button>
    <el-button class="edit" size="large" type="primary" circle>缩小</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { mitBus } from "@/stores/mitt";
// import { handlerDrawClick } from "@/utils/cesium/interactDraw";
import {CesiumDrawTool} from '@/utils/cesium/cesiumTool'
let viewer: any;
let tool:CesiumDrawTool
onMounted(() => {
  mitBus.on("viewer", (res) => {
    viewer = res;
    //开启地形检测
    viewer.scene.globe.depthTestAgainstTerrain = true;
    tool=new CesiumDrawTool(viewer)
  });
});
</script>

<style scoped>
.tool {
  position: absolute;
  top: 100px;
  right: 100px;
  width: 40px;
  height: 120px;
  z-index: 2001;
}

.el-button {
  background: #0c0c66;
}
.el-button:hover {
  background: #9c9cee;
}
.el-button:focus {
  background: #9c9cee;
}
.el-button + .el-button {
  margin-left: 0px;
}
.edit {
  margin-left: 0px;
  margin-top: 12px;
}

/* 测量消息提示样式-在此处不起作用，放在app.vue里 */
.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  cursor: default;
  user-select: none;
}

.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}

.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}

.ol-tooltip-measure:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}

.ol-tooltip-static:before {
  border-top-color: #ffcc33;
}

.hidden {
  display: none;
}
</style>
