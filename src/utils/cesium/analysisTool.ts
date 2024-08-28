import * as Cesium from "cesium";
/**
 * 分析相关方法，包含内容：淹没分析、通视分析
 *
 */
// 1.淹没分析
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
// 2.通视分析
interface lineType {
  coordinates: Cesium.Cartesian3[];
  color?: string;
}
function addLine(viewer: Cesium.Viewer, options: lineType) {
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
  let subtract = Cesium.Cartesian3.subtract(
    positions[1], //目标点
    positions[0], //观察点
    new Cesium.Cartesian3()
  );
  //标准化计算射线方向
  let direction = Cesium.Cartesian3.normalize(
    subtract,
    new Cesium.Cartesian3()
  );
  //创建射线
  let ray = new Cesium.Ray(positions[0], direction);
  //计算交点
  let result = viewer.scene.globe.pick(ray, viewer.scene); //返回第一个交点
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
    destination: Cesium.Cartesian3.fromDegrees(87.193965, 27.816681, 5000),
  });
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
// 3.缓冲分析
import { CesiumDrawTool } from "@/utils/cesium/cesiumTool";
import * as turf from "@turf/turf";
// 创建缓冲区
//添加缓冲区
function addBuffer(
  viewer: Cesium.Viewer,
  positions: number[],
  hole?: Cesium.Cartesian3[]
) {
  viewer.entities.add({
    polygon: {
      // hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(positions)),
      //获取指定属性 positions 和 holes（图形内需要挖空的区域）
      hierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArray(positions),
        [new Cesium.PolygonHierarchy(hole)]
      ),
      material: Cesium.Color.RED.withAlpha(0.7),
    },
  });
}
//格式转换，将点数据拆分、合并成一个大数组
function pointsFormatConv(points: any[][]) {
  let degreesArray: number[] = [];
  //拆分、合并
  points.map((item) => {
    degreesArray.push(item[0]);
    degreesArray.push(item[1]);
  });
  return degreesArray;
}
/**
 * 将Cesium.Cartesian3[]格式的坐标转换为turf生成feature需要的坐标格式
 * @param points 绘制的线或者面的坐标数组
 * @returns 坐标点二维数组
 */
function cartesianConv(points: Cesium.Cartesian3[]) {
  const result: number[][] = [];
  points.map((item) => {
    const cartographic = Cesium.Cartographic.fromCartesian(item);
    result.push([
      Cesium.Math.toDegrees(cartographic.longitude),
      Cesium.Math.toDegrees(cartographic.latitude),
    ]);
  });
  return result;
}
export function addPointBuffer(viewer: Cesium.Viewer) {
  let tool: CesiumDrawTool = new CesiumDrawTool(viewer);
  function pointBuffer(positions: Cesium.Cartesian3) {
    const coordinates = Cesium.Cartographic.fromCartesian(positions);
    let point = turf.point([
      Cesium.Math.toDegrees(coordinates.longitude),
      Cesium.Math.toDegrees(coordinates.latitude),
    ]);
    let buffered = turf.buffer(point, 50, { units: "kilometers" });
    buffered &&
      addBuffer(viewer, pointsFormatConv(buffered?.geometry.coordinates[0]));
  }
  tool.draw("point", pointBuffer);
}
export function addLineBuffer(viewer: Cesium.Viewer) {
  let tool: CesiumDrawTool = new CesiumDrawTool(viewer);
  function lineBuffer(positions: Cesium.Cartesian3[]) {
    const coordinates = cartesianConv(positions);
    let line = turf.lineString(coordinates);
    let buffered = turf.buffer(line, 50, { units: "kilometers" });
    buffered &&
      addBuffer(viewer, pointsFormatConv(buffered?.geometry.coordinates[0]));
  }
  tool.draw("line", lineBuffer);
}
export function addPolygonBuffer(viewer: Cesium.Viewer) {
  let tool: CesiumDrawTool = new CesiumDrawTool(viewer);
  function polygonBuffer(positions: Cesium.Cartesian3[]) {
    const coordinates = cartesianConv(positions);
    // 面还需要放入第一个点的坐标以形成闭环
    const cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
    coordinates.push([
      Cesium.Math.toDegrees(cartographic.longitude),
      Cesium.Math.toDegrees(cartographic.latitude),
    ]);
    let polygon = turf.polygon([coordinates]);
    let buffered = turf.buffer(polygon, 50, { units: "kilometers" });
    buffered &&
      addBuffer(
        viewer,
        pointsFormatConv(buffered?.geometry.coordinates[0]),
        positions
      );
  }
  tool.draw("polygon", polygonBuffer);
}
// 聚合
export function clusterTest(viewer: Cesium.Viewer) {
  let pinBuilder = new Cesium.PinBuilder();
  let pin100 = pinBuilder.fromText("100+", Cesium.Color.RED, 70).toDataURL();
  let pin70 = pinBuilder.fromText("70+", Cesium.Color.GOLD, 65).toDataURL();
  let pin50 = pinBuilder.fromText("50+", Cesium.Color.BLUE, 60).toDataURL();
  let pin40 = pinBuilder.fromText("40+", Cesium.Color.GREEN, 55).toDataURL();
  let pin30 = pinBuilder.fromText("30+", Cesium.Color.YELLOW, 50).toDataURL();
  let pin20 = pinBuilder.fromText("20+", Cesium.Color.CYAN, 45).toDataURL();
  let pin10 = pinBuilder.fromText("10+", Cesium.Color.AZURE, 40).toDataURL();
  let singleDigitPins = new Array(9);
  for (let i = 0; i < singleDigitPins.length; i++) {
    singleDigitPins[i] = pinBuilder
      .fromText("" + (i + 2), Cesium.Color.VIOLET, 40)
      .toDataURL();
  }
  let kmlDataSource = viewer.dataSources.add(
    Cesium.KmlDataSource.load("../../../src/assets/data/kml/facilities.kml")
  );
  kmlDataSource.then((dataSource) => {
    // 是否开启聚合
    dataSource.clustering.enabled = true;
    // 聚合像素范围
    dataSource.clustering.pixelRange = 36;
    // 聚合最小数
    dataSource.clustering.minimumClusterSize = 2;
    dataSource.clustering.clusterEvent.addEventListener(function (
      clusteredEntities,
      cluster
    ) {
      cluster.label.show = false;
      cluster.billboard.show = true;
      cluster.billboard.id = cluster.label.id;
      cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
      if (clusteredEntities.length >= 100) {
        cluster.billboard.image = pin100;
      } else if (clusteredEntities.length >= 70) {
        cluster.billboard.image = pin70;
      } else if (clusteredEntities.length >= 50) {
        cluster.billboard.image = pin50;
      } else if (clusteredEntities.length >= 40) {
        cluster.billboard.image = pin40;
      } else if (clusteredEntities.length >= 30) {
        cluster.billboard.image = pin30;
      } else if (clusteredEntities.length >= 20) {
        cluster.billboard.image = pin20;
      } else if (clusteredEntities.length >= 10) {
        cluster.billboard.image = pin10;
      } else {
        cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
      }
    });
  });
}
// 等高线
export function contour(viewer: Cesium.Viewer) {
  let material = Cesium.Material.fromType("ElevationContour");
  let contourUniforms = {
    spacing: 150,
    width: 2,
    color: Cesium.Color.RED,
  };
  material.uniforms = contourUniforms;
  viewer.scene.globe.material = material;
  //将相机视角定位到珠穆朗玛峰附近
  viewer.camera.setView({
    destination: new Cesium.Cartesian3(
      282157.6960889096,
      5638892.465594703,
      2978736.186473513
    ),
    orientation: {
      heading: 4.747266966349747,
      pitch: -0.2206998858596192,
      roll: 6.280340554587955,
    },
  });
}
