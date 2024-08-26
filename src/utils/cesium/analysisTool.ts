import * as Cesium from "cesium";
/**
 * 分析相关方法，包含内容：淹没分析、通视分析
 *
 */
// 淹没分析
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
    if (height >= maxHeight) {
      height = 10;
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
        classificationType: Cesium.ClassificationType.BOTH,
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
    handler.setInputAction(function (
      event: Cesium.ScreenSpaceEventHandler.PositionedEvent
    ) {
      //用 viewer.scene.pickPosition 代替 viewer.camera.pickEllipsoid
      //当鼠标指针在地形上移动时可以得到正确的点
      let earthPosition = viewer.scene.pickPosition(event.position);
      addPoint(viewer, earthPosition);
      positions.push(earthPosition);
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //鼠标右键单击事件
    handler.setInputAction(function () {
      addPolygon(positions);
      positions = [];
      handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.destroy();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  draw();
}
function addPoint(viewer: Cesium.Viewer, coordinates: Cesium.Cartesian3) {
  const point = new Cesium.Entity({
    // id: "point", //唯一标识符
    name: "点",
    show: true, //控制是否显示
    position: coordinates, //位置，需要将坐标转为笛卡尔直角坐标
    point: {
      color: Cesium.Color.GOLD, //颜色
      pixelSize: 10, //大小
      outlineColor: Cesium.Color.YELLOW, //轮廓颜色，
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
  viewer.entities.add(point);
  return point;
}
// 通视分析
interface lineType {
  coordinates: Cesium.Cartesian3[];
  color?: string;
}
function addLine(viewer: Cesium.Viewer, options: lineType) {
  console.log("options.coordinates", options.coordinates);
  const line = new Cesium.Entity({
    // id: "line",
    name: "线",
    show: true, //显示
    polyline: {
      positions: options.coordinates,
      width: 4, //线条宽度
      material: options.color
        ? Cesium.Color.fromCssColorString(options.color)
        : Cesium.Color.BLACK, //线条材质
      depthFailMaterial: options.color
        ? Cesium.Color.fromCssColorString(options.color)
        : Cesium.Color.BLACK, //指定折线低于地形时用于绘制折线的材料
      // 设置贴地
      // clampToGround: true,
    },
  });
  viewer.entities.add(line);
  return line;
}
function startAnalyze(viewer: Cesium.Viewer, positions: Cesium.Cartesian3[]) {
  //计算两点分量差异
  var subtract = Cesium.Cartesian3.subtract(
    positions[1], //目标点
    positions[0], //观察点
    new Cesium.Cartesian3()
  );
  //标准化计算射线方向
  var direction = Cesium.Cartesian3.normalize(
    subtract,
    new Cesium.Cartesian3()
  );
  //创建射线
  var ray = new Cesium.Ray(positions[0], direction);
  //计算交点
  var result = viewer.scene.globe.pick(ray, viewer.scene); //返回第一个交点
  console.log("result", ray, result);
  //有交点
  if (result !== undefined && result !== null) {
    addLine(viewer, { coordinates: [result, positions[0]], color: "#008000" }); //可视
    addLine(viewer, { coordinates: [result, positions[1]], color: "#ff0000" }); //不可视
  }
  //没有交点
  else {
    addLine(viewer, {
      coordinates: [positions[0], positions[1]],
      color: "#008000",
    });
  }
}
export function visibilityAnalysis(viewer: Cesium.Viewer) {
  viewer.camera.setView({
    destination:Cesium.Cartesian3.fromDegrees(87.193965,27.816681,5000)
  })
  //存储观察点和目标点
  let positions: Cesium.Cartesian3[] = [];
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  //鼠标左键单击事件
  handler.setInputAction(function (
    evt: Cesium.ScreenSpaceEventHandler.PositionedEvent
  ) {
    let pickedObject: Cesium.Cartesian2 = viewer.scene.pickPosition(
      evt.position
    ); //判断是否拾取到模型
    if (viewer.scene.pickPositionSupported && Cesium.defined(pickedObject)) {
      let cartesian = viewer.scene.pickPosition(evt.position);
      if (Cesium.defined(cartesian)) {
        //保证每次只有一个观察点和一个目标点
        if (positions.length < 2) {
          addPoint(viewer, cartesian);
          positions.push(cartesian);
        } else {
          alert("观察点和目标点是唯一的！");
        }
      }
    }
  },
  Cesium.ScreenSpaceEventType.LEFT_CLICK);
  //鼠标右键单击事件
  handler.setInputAction(function () {
    startAnalyze(viewer, positions);
    positions = []; //每次绘制完线后，清空坐标点数组
    // 关闭点击监听事件
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.destroy();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}
