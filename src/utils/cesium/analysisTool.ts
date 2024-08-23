import * as Cesium from "cesium";
/**
 * 分析相关方法，包含内容：淹没分析
 * 
 */
export function inundationAnalysis(viewer: Cesium.Viewer) {
  //开启深度检测
  viewer.scene.globe.depthTestAgainstTerrain = true;
  let height: number; //当前水位高度
  let maxHeight: number; //最高水位高度
  let speed: number; //水位增长速度
  let positions: Cesium.Cartesian3[] = []; //绘制多边形的顶点
  let handler: Cesium.ScreenSpaceEventHandler;
  let addRegion: Cesium.Entity; //添加多边形
  //调整相机视角
  viewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(114.38564, 30.52914, 2000),
  });
  //水位高度更新函数
  function updateHeight() {
    if (height < maxHeight) height += speed;
    if(height>=maxHeight){
        height=10
    }
    return height;
  }
  //绘制分析区域
  function addPolygon(hierarchy: Cesium.Cartesian3[]) {
    addRegion = new Cesium.Entity({
      id: "polygon",
      name: "矩形",
      show: true,
      polygon: {
        hierarchy: hierarchy,
        material: new Cesium.ImageMaterialProperty({
          image: "../../../src/assets/imgs/河流纹理.png",
          repeat: new Cesium.Cartesian2(1.0, 1.0),
          transparent: true,
          color: Cesium.Color.WHITE.withAlpha(0.2),
        }),
        extrudedHeight: new Cesium.CallbackProperty(updateHeight, false),
        classificationType: Cesium.ClassificationType.BOTH
      },
    });
    viewer.entities.add(addRegion);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK); //移除事件
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK); //移除事件
  }
  function draw() {
    height = 10;
    maxHeight = 30;
    speed = 0.2;
    viewer.entities.remove(addRegion);
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    //鼠标左键单击事件
    handler.setInputAction(function (event:Cesium.ScreenSpaceEventHandler.PositionedEvent) {
      //用 viewer.scene.pickPosition 代替 viewer.camera.pickEllipsoid
      //当鼠标指针在地形上移动时可以得到正确的点
      let earthPosition = viewer.scene.pickPosition(event.position);
      positions.push(earthPosition);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //鼠标右键单击事件
    handler.setInputAction(function () {
      addPolygon(positions);
      positions = [];
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  draw()
}
