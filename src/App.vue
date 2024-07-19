<script setup lang="ts">
// import myMap from './components/myMap.vue'
import cesium from './views/cesium/cesium.vue'; 
</script>

<template>
  <cesium/>
</template>

<style>
html,body{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}
#app{
  width: 100%;
  height:100%;
  min-width: 1024px;
  margin: 0;
  padding: 0;
}

/* 测量消息提示样式 */
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
</style>
