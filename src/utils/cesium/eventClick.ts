import * as Cesium from "cesium";
export function leftClickGetAttributes(viewer: Cesium.Viewer) {
  leftClick(viewer, handleAttributes);
}
function leftClick(viewer: Cesium.Viewer, callBack: Function) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (e: any) {
    const pick = viewer.scene.pick(e.position);
    if (Cesium.defined(pick)) {
      // Entity类型点击事件
      if (pick.id) {
        //当前实体的属性
        callBack(pick.id);
        //禁止默认点击事件
      }
      if (e && e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
function handleAttributes(info: any) {
  if (info instanceof Cesium.Entity) {
    console.log("单击Entity属性为", info);
  } else {
    console.log("单击实体属性为", info);
  }
}
