import * as Cesium from "cesium";
/**
 * czml结构文件模拟小车移动
 * 直接调用loadCzml方法即可
 */
//定义 CZML 结构
export function loadCzml(viewer: Cesium.Viewer) {
  let czml = [
    {
      id: "document",
      version: "1.0",
      clock: {
        interval: "2022-04-14T15:18:00Z/2022-04-14T15:18:15Z",
        currentTime: "2022-04-14T15:18:00Z",
      },
    },
    {
      id: "CesiumMilkTruck",
      model: {
        gltf: "../../../src/assets/models/car.glb",
      },
      position: {
        cartesian: [
          "2022-04-14T15:18:00Z",
          -1715306.5175099864,
          4993455.496718319,
          3566986.1689425386,
          "2022-04-14T15:18:12Z",
          -1715529.0193483282,
          4993383.694752825,
          3566984.256377016,
          "2022-04-14T15:18:15Z",
          -1715541.2997855775,
          4993376.825711799,
          3566988.324779788,
        ],
      },
    },
    {
      id: "Polyline",
      polyline: {
        positions: {
          cartesian: [
            -1715306.5175099864, 4993455.496718319, 3566986.1689425386,
            -1715529.0193483282, 4993383.694752825, 3566984.256377016,
            -1715541.2997855775, 4993376.825711799, 3566988.324779788,
          ],
        },
        material: {
          polylineOutline: {
            color: {
              rgba: [125, 255, 128, 255],
            },
            outlineWidth: 0,
          },
        },
        width: 5,
        clampToGround: true,
      },
    },
  ];
  let entity; //获取小车模型
  let positionProperty; //获取小车位置信息
  let dataSourcePromise = Cesium.CzmlDataSource.load(czml); //创建 CZML 实例的Promise
  viewer.dataSources.add(dataSourcePromise).then(function (dataSource) {
    //获取小车模型
    entity = dataSource.entities.getById("CesiumMilkTruck");
    //设定小车朝向
    entity!.orientation = new Cesium.VelocityOrientationProperty(
      entity!.position
    ); //设置模型朝向
    //获取小车位置信息
    positionProperty = entity!.position;
  });
  viewer.zoomTo(dataSourcePromise)
  //渲染监听
  //开启时钟动画
  viewer.clock.shouldAnimate = true;
  //渲染监听模型实时位置、高度并贴在 3D Tiles 模型上
  viewer.scene.postRender.addEventListener(function () {
    let position = positionProperty!.getValue(viewer.clock.currentTime);
    entity!.position = viewer.scene.clampToHeight(position, [entity!]);
  });
}

export const czml = [
  {
    id: "document",
    name: "CZML Polygon - Intervals and Availability",
    version: "1.0",
    clock: {
      interval: "2012-08-04T16:00:00Z/2012-08-04T17:00:00Z",
      currentTime: "2012-08-04T16:00:00Z",
      multiplier: 1,
    },
  },
  {
    id: 1721729640884,
    name: 210,
    availability: "2012-08-04T16:00:00Z/2012-08-04T17:00:00Z",
    polygon: {
      positions: {
        cartographicDegrees: [
          113.36674763518407, 22.98319014364097, 0, 113.36675251125769,
          22.983190163124707, 0, 113.36676519746635, 22.983188407921936, 0,
          113.36676032139277, 22.983188388438595, 0, 113.36674763518407,
          22.98319014364097, 0,
        ],
      },
      height: 2,
      extrudedHeight: 400000,
      material: {
        solidColor: {
          color: {
            rgba: [255, 0, 0, 255],
          },
        },
      },
    },
  },
];
