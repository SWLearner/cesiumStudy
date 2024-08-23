import * as Cesium from "cesium";
/**
 * 鼠标左键点击获取实体属性方法
 * 直接调用leftClickGetAttributes即可获取的实体属性
 */
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
    console.log("单击Entity属性为", info.properties?.getValue(Cesium.JulianDate.now()));
  } else {
    console.log("单击实体属性为", info);
  }
}
