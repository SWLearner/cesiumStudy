import * as Cesium from "cesium";
export function addEntity(viewer: Cesium.Viewer) {
  addPoint(viewer, [118, 32, 40.0]);
  // const line = addLine(viewer, [118, 30, 119, 32, 116, 35]);
  // // 画虚线
  // line.polyline!.material = new Cesium.PolylineDashMaterialProperty({
  //   color: Cesium.Color.BLUE,
  // });
  // 画箭头
  // line.polyline!.material = new Cesium.PolylineArrowMaterialProperty(
  //   Cesium.Color.CYAN
  // );
  addPolygon(
    viewer,
    [117, 30, 12, 117, 32, 12, 116, 32, 12, 116, 30, 12, 117, 30, 12]
  );
  addRectangle(viewer, [114.0, 30.0, 115.0, 35.0]);
  addEllipse(viewer, { coordinates: [117, 27] });
  addCylinder(viewer, {
    coordinates: [116.1, 40.0, 200000.0],
    color: "#75f320",
  });
  addCorridor(viewer, { coordinates: [103.0, 38.0, 110.0, 38.0, 110.0, 30.0] });
  addWall(viewer, {
    coordinates: [
      107.0, 43.0, 100000.0, 97.0, 43.0, 100000.0, 97.0, 40.0, 100000.0, 107.0,
      40.0, 100000.0, 107.0, 43.0, 100000.0,
    ],
  });
  addBox(viewer, { coordinates: [105, 35, 200000.0] });
  addEllipsoid(viewer);
  const model = addModel(viewer, [118, 30, 5000]);
  const degree = 90;
  const heading = Cesium.Math.toRadians(degree); //模型航向
  const pitch = 0; //俯仰角
  const roll = 0; //翻滚角
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  model.orientation = new Cesium.ConstantProperty(
    Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(118, 30, 5000),
      hpr
    )
  );
  model.show = true;
  addBillboard(viewer);
}
// 加点
export function addPoint(
  viewer: Cesium.Viewer,
  coordinates: [number, number, number] | Cesium.Cartesian3
) {
  const point = new Cesium.Entity({
    // id: "point", //唯一标识符
    name: "点",
    show: true, //控制是否显示
    position:
      (coordinates as Cesium.Cartesian3) ||
      Cesium.Cartesian3.fromDegrees(
        ...(coordinates as [number, number, number])
      ), //位置，需要将坐标转为笛卡尔直角坐标
    point: {
      color: Cesium.Color.GOLD, //颜色
      pixelSize: 10, //大小
      outlineColor: Cesium.Color.YELLOW, //轮廓颜色，
      // 设置贴地
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
  viewer.entities.add(point);
  return point;
}
// 加线
export function addLine(viewer: Cesium.Viewer, coordinates: number[]) {
  const line = new Cesium.Entity({
    id: "line",
    name: "线",
    show: true, //显示
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(coordinates),
      width: 4, //线条宽度
      material: Cesium.Color.RED, //线条材质
      // 设置贴地
      // clampToGround: true,
    },
  });
  viewer.entities.add(line);
  return line;
}
// 加面
export function addPolygon(viewer: Cesium.Viewer, coordinates: number[]) {
  const polygon = new Cesium.Entity({
    id: "polygon",
    name: "面",
    show: true,
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
      height: 12,
      extrudedHeight: 12000,
      material: Cesium.Color.RED,
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      // classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  });
  viewer.entities.add(polygon);
  return polygon;
}
// 加矩形
export function addRectangle(viewer: Cesium.Viewer, coordinates: number[]) {
  const rectangle = {
    id: "rectangle",
    name: "矩形",
    show: true,
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(...coordinates),
      material: Cesium.Color.BLUE,
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      // classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  };
  viewer.entities.add(rectangle);
  return rectangle;
}
// 加椭圆
interface ellipseType {
  coordinates: [number, number];
  semiMinorAxis?: number;
  semiMajorAxis?: number;
  color?: string;
}
export function addEllipse(viewer: Cesium.Viewer, options: ellipseType) {
  const ellipse = {
    id: "ellipse",
    name: "椭圆",
    show: true,
    position: Cesium.Cartesian3.fromDegrees(...options.coordinates),
    ellipse: {
      semiMinorAxis: options.semiMinorAxis ? options.semiMinorAxis : 250000.0, //短半轴
      semiMajorAxis: options.semiMajorAxis ? options.semiMajorAxis : 400000.0, //长半轴
      material: options.color
        ? Cesium.Color.fromCssColorString(options.color)
        : Cesium.Color.GREY,
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      // classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  };
  viewer.entities.add(ellipse);
  return ellipse;
}
// 加圆柱体
interface cylinderType {
  coordinates: [number, number, number];
  length?: number;
  topRadius?: number;
  bottomRadius?: number;
  color?: string;
  outlineColor?: string;
}
export function addCylinder(viewer: Cesium.Viewer, options: cylinderType) {
  const cylinder = {
    id: "cylinder",
    name: "圆柱体",
    show: true,
    position: Cesium.Cartesian3.fromDegrees(...options.coordinates),
    cylinder: {
      length: options.length ? options.length : 400000.0, //圆柱体高度
      topRadius: options.topRadius ? options.topRadius : 200000.0, //圆柱体顶面半径
      bottomRadius: options.bottomRadius ? options.bottomRadius : 200000.0, //圆柱体底面半径
      material: options.color
        ? Cesium.Color.fromCssColorString(options.color)
        : Cesium.Color.GREEN.withAlpha(0.6),
      outline: true,
      outlineColor: options.outlineColor
        ? Cesium.Color.fromCssColorString(options.outlineColor)
        : Cesium.Color.fromCssColorString("#644d00 "),
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      // classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  };
  viewer.entities.add(cylinder);
  return cylinder;
}
// 加走廊
interface corridorType {
  coordinates: number[];
  width?: number;
  color?: string;
}
export function addCorridor(viewer: Cesium.Viewer, options: corridorType) {
  const corridor = {
    id: "corridor",
    name: "走廊",
    show: true,
    corridor: {
      positions: Cesium.Cartesian3.fromDegreesArray(options.coordinates),
      width: options.width ? options.width : 200000.0,
      material: options.color
        ? Cesium.Color.fromCssColorString(options.color)
        : Cesium.Color.YELLOW.withAlpha(0.5),
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  };
  viewer.entities.add(corridor);
  return corridor;
}
// 加墙
interface wallType {
  coordinates: number[];
  color?: string;
}
export function addWall(viewer: Cesium.Viewer, options: wallType) {
  const wall = {
    id: "wall",
    name: "墙",
    show: true,
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(options.coordinates),
      material: options.color
        ? Cesium.Color.fromCssColorString(options.color)
        : Cesium.Color.GREEN.withAlpha(0.5),
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  };
  viewer.entities.add(wall);
  return wall;
}
// 加方盒
interface boxType {
  coordinates: [number, number, number];
  //指定方盒的长度、宽度和高度
  dimensions?: [number, number, number];
  color?: string;
}
export function addBox(viewer: Cesium.Viewer, options: boxType) {
  const box = {
    id: "box",
    name: "方盒",
    show: true,
    position: Cesium.Cartesian3.fromDegrees(...options.coordinates),
    box: {
      //指定方盒的长度、宽度和高度
      dimensions: options.dimensions
        ? new Cesium.Cartesian3(...options.dimensions)
        : new Cesium.Cartesian3(400000.0, 300000.0, 400000.0),
      material: options.color
        ? Cesium.Color.fromCssColorString(options.color)
        : Cesium.Color.fromCssColorString("#c8ff00"),
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      // classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  };
  viewer.entities.add(box);
  return box;
}
//加椭球体
export function addEllipsoid(viewer: Cesium.Viewer) {
  const ellipsoid = {
    id: "ellipsoid",
    name: "椭球体",
    show: true,
    position: Cesium.Cartesian3.fromDegrees(107.0, 26, 300000.0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(200000.0, 200000.0, 300000.0), //椭球体半径
      material: Cesium.Color.BLUE.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      // classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  };
  viewer.entities.add(ellipsoid);
  return ellipsoid;
}
// 加小车模型glb
export function addModel(
  viewer: Cesium.Viewer,
  coordinates: [number, number, number] | Cesium.Cartesian3
) {
  const model = new Cesium.Entity({
    // id: "model", //id 唯一
    name: "小车模型", //名称
    show: true, //显示
    position:
      (coordinates as Cesium.Cartesian3) ||
      Cesium.Cartesian3.fromDegrees(
        ...(coordinates as [number, number, number])
      ), //小车位置
    model: {
      uri: "../../../src/assets/models/car.glb",
      minimumPixelSize: 600, //模型最小
      maximumScale: 1000, //模型最大
      //color: Cesium.Color.ORANGE, //模型颜色
      scale: 10, //当前比例，
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
    },
  });
  viewer.entities.add(model);
  return model;
}
// 加广告牌
export function addBillboard(viewer: Cesium.Viewer) {
  const billboard = {
    id: "billboard",
    name: "广告牌",
    properties: {
      name: "人",
      type: "billboard",
    },
    show: true,
    position: Cesium.Cartesian3.fromDegrees(108, 30, 50),
    billboard: {
      image: "../../../src/assets/imgs/people.png",
      scale: 1, //尺寸比例,
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
    },
  };
  viewer.entities.add(billboard);
  return billboard;
}
//反选遮罩
//先绘制一个多边形区域，然后将需要突出的目标区域挖空，并对其余部分设置一定的透明度进行掩盖
export function drawMask(viewer: Cesium.Viewer) {
  //大区域的坐标点数组，够用即可，不必太大，要形成闭环
  var pointArr1 = [
    114.3944, 30.5237, 114.3943, 30.5192, 114.4029, 30.5192, 114.4029, 30.5237,
    114.3944, 30.5237,
  ];
  var positions = Cesium.Cartesian3.fromDegreesArray(pointArr1);
  //洞的坐标点数组，要形成闭环
  var pointArr2 = [
    114.3972, 30.5224, 114.3972, 30.5218, 114.3988, 30.5218, 114.3988, 30.5224,
    114.3972, 30.5224,
  ];
  var hole = Cesium.Cartesian3.fromDegreesArray(pointArr2);
  //绘制反选遮罩层
  //带洞区域
  viewer.entities.add({
    name: "pol",
    polygon: {
      //获取指定属性 positions 和 holes（图形内需要挖空的区域）
      hierarchy: new Cesium.PolygonHierarchy(positions, [
        new Cesium.PolygonHierarchy(hole),
      ]),
      //填充的颜色，withAlpha 透明度
      material: Cesium.Color.BLACK.withAlpha(0.7),
      //是否被提供的材质填充
      fill: true,
    },
  });
  viewer.entities.add({
    polyline: {
      positions: hole,
      width: 3,
      material: Cesium.Color.AQUA.withAlpha(1),
      clampToGround: true,
    },
  });
  //设置相机视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(114.3981, 30.5221, 300),
  });
}
