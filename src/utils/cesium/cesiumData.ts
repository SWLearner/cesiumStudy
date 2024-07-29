import * as Cesium from "cesium";
/*
// 谷歌地图
const ELEC_URL =
  'http://mt{s}.google.cn/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galile'

const IMG_URL =
  'http://mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali'

const TER_URL =
  'http://mt{s}.google.cn/vt/lyrs=t@131,r@227000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galile'
//osm
// imageryProvider : new Cesium.UrlTemplateImageryProvider({ 
//  url : 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
//  subdomains: ['a', 'b', 'c'] 
//  }) 
*/
/**
 * @description: 添加arcgis地形
 * @return {*}
 */
export async function addArcGISTerrain(viewer: Cesium.Viewer) {
  const terrainProvider =
    await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(
      "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
    );
  viewer.terrainProvider = terrainProvider;
}
// 添加本地地形
export async function addLocalTerrain(viewer: Cesium.Viewer) {
  const terrainProvider =
    await Cesium.CesiumTerrainProvider.fromUrl(
      "../../../src/assets/data/terrain"
    );
  viewer.terrainProvider = terrainProvider;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromArray([
        1.980945937983933,
        0.4101498913617981,
        95712.63736220135
    ]),
  })
}
// arcGIS在线影像图
export async function arcGISOnline(viewer: Cesium.Viewer) {
  viewer.imageryLayers.removeAll();
  viewer.imageryLayers.addImageryProvider(
    await Cesium.ArcGisMapServerImageryProvider.fromUrl(
      "https://elevation3d.arcgis.com/arcgis/rest/services/World_Imagery/MapServer"
    )
  );
}
// 加载geoserver发布的Wms
export function addWmsLayers(viewer: Cesium.Viewer) {
  let wmsLayers = new Cesium.WebMapServiceImageryProvider({
    url: "http://localhost:8080/geoserver/forCesiumTest/wms",
    layers: "forCesiumTest:RaiwayFence",
    parameters: {
      service: "WMS",
      transparent: true,
      format: "image/png",
      srs: "EPSG:4326",
      styles: "",
    },
  });
  viewer.imageryLayers.removeAll();
  tdtOnline(viewer, "img_w", "img", "tdtImg");
  viewer.imageryLayers.addImageryProvider(wmsLayers);
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.5979, 39.64142, 50000.0),
  });
}
// 加载geoserver发布的Wmts
export function addWmtsLayers(viewer: Cesium.Viewer) {
  const maxLevel = 20;
  const tileMatrixID = "EPSG:4326";
  const tileMatrixLabels = Object.keys(new Array(maxLevel).fill(0)).map(
    (v) => `${tileMatrixID}:${v}`
  );
  let wmtsLayers = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://localhost:8080/geoserver/gwc/service/wmts/rest/railway:RaiwayFence/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png",
    layer: "railway:RaiwayFence",
    style: "",
    format: "image/png",
    tileMatrixLabels: tileMatrixLabels, // 地址若不改为{TileMatrixSet}:{TileMatrix}则需要加，若改了则无需添加
    tileMatrixSetID: "EPSG:4326",
    tilingScheme: new Cesium.GeographicTilingScheme({
      numberOfLevelZeroTilesX: 2,
      numberOfLevelZeroTilesY: 1,
    }), // EPSG:4326时必须添加，非常重要！！！！
    // 限制加载范围
    // rectangle: Cesium.Rectangle.fromDegrees(
    //  115.8758655018913,
    //  39.34299348956347,
    //  117.10695197046333,
    //  39.89546788893104
    // ),
  });
  viewer.imageryLayers.removeAll();
  tdtOnline(viewer, "img_w", "img", "tdtImg");
  viewer.imageryLayers.addImageryProvider(wmtsLayers);
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.5979, 39.64142, 50000.0),
  });
}
// 加载geoserver的tms
export function addTmsLayers(viewer: Cesium.Viewer) {
  let wmsLayers = new Cesium.UrlTemplateImageryProvider({
    // url: "http://localhost:8080/geoserver/gwc/service/tms/1.0.0/Cesium%3Adida@EPSG%3A900913@png/{z}/{x}/{reverseY}.png",
    url: "http://localhost:8080/geoserver/gwc/service/tms/1.0.0/forCesiumTest%3ARaiwayFence@EPSG%3A4326@png/{z}/{x}/{reverseY}.png",
    tilingScheme: new Cesium.GeographicTilingScheme({
      numberOfLevelZeroTilesX: 2,
      numberOfLevelZeroTilesY: 1,
    }), // EPSG:4326时必须添加，非常重要！！！！
  });
  viewer.imageryLayers.removeAll();
  tdtOnline(viewer, "img_w", "img", "tdtImg");
  viewer.imageryLayers.addImageryProvider(wmsLayers);
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.5979, 39.64142, 50000.0),
  });
}
// 百度地图
export async function getBd() {
  const bd = await Cesium.BingMapsImageryProvider.fromUrl(
    "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
    {
      key: "IFapMVrArkLIMEILg215jvakhST5csSA",
    }
  );
  return bd;
}
// 天地图在线地图
//lyr:['img_w','vec_w','cia_w','cva_w'，'eva_w']  layer:['img','vec','cia','cva','eva']
export const tdtOnline = (
  viewer: Cesium.Viewer,
  lyr: string,
  layer: string,
  layerName: string
) => {
  // 先将底图全清空
  viewer.imageryLayers.removeAll();
  viewer.imageryLayers.addImageryProvider(
    new Cesium.WebMapTileServiceImageryProvider({
      url: `http://t{s}.tianditu.gov.cn/${lyr}/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=${layer}&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=f47da4a06995b322a237c9278a84f12c`, //url地址
      layer: layerName, //WMTS请求的层名称
      style: "default", //WMTS请求的样式名称
      format: "tiles", //MIME类型，用于从服务器检索图像
      tileMatrixSetID: "GoogleMapsCompatible", //	用于WMTS请求的TileMatrixSet的标识符。使用谷歌公司的瓦片切片方式
      subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"], //天地图8个服务器
      minimumLevel: 0, //最小层级
      maximumLevel: 18, //最大层级
    })
  );
};
// 移除全部底图
export const removeAllLayers = (viewer: Cesium.Viewer) => {
  viewer.imageryLayers.removeAll();
};
//高德地图以及注记
export const gaoDeOnline = (viewer: Cesium.Viewer) => {
  // 先将底图全清空
  viewer.imageryLayers.removeAll();
  const layer = new Cesium.UrlTemplateImageryProvider({
    // url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    url: "https://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    subdomains: ["01", "02", "03", "04"],
    // minimumLevel: 3,
    // maximumLevel: 18
  });
  const zhuji = new Cesium.UrlTemplateImageryProvider({
    // url: "https://webrd{s}.is.autonavi.com/appmaptile?lang=en&size=1&scale=1&style=8&x={x}&y={y}&z={z}",//英文注释
    url: "http://webst{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
    subdomains: ["01", "02", "03", "04"],
    // minimumLevel: 3,
    // maximumLevel: 18
  });
  viewer.imageryLayers.addImageryProvider(layer);
  viewer.imageryLayers.addImageryProvider(zhuji);
};
export function loadData(viewer: Cesium.Viewer) {
  osgbData(viewer);
}
// 单张图片
export const singlePhoto = (viewer: Cesium.Viewer) => {
  //图片左下角坐标，图片右上角坐标
  let rectangle = Cesium.Rectangle.fromDegrees(
    112.38004,
    30.51667,
    112.40471,
    30.53045
  );
  viewer.zoomTo(
    viewer.imageryLayers.addImageryProvider(
      new Cesium.SingleTileImageryProvider({
        url: "../../../src/assets/imgs/single.jpg",
        rectangle: rectangle,
        tileWidth: 1200,
        tileHeight: 1200,
      })
    )
  );
};
// 加载geojson数据
export const singleGeojson = (viewer: Cesium.Viewer) => {
  const dataSource = Cesium.GeoJsonDataSource.load(
    "../../../src/assets/data/test.geojson"
  );
  console.log("dataSource", dataSource);
  viewer.dataSources.add(dataSource);
  viewer.zoomTo(dataSource);
};
// 加载kml数据
export const kmlData = (viewer: Cesium.Viewer) => {
  const dataSource = Cesium.KmlDataSource.load(
    "../../../src/assets/data/road.kml"
  );
  viewer.dataSources.add(dataSource);
  viewer.zoomTo(dataSource);
};
// 加载gltf
export const gltfData = async (viewer: Cesium.Viewer) => {
  let origin = Cesium.Cartesian3.fromDegrees(114.39278, 30.52357, 0.0);
  let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
  try {
    const model = await Cesium.Model.fromGltfAsync({
      url: "../../../src/assets/models/bieshu.gltf",
      modelMatrix: modelMatrix, //glTF 数据的加载位置
      scale: 5, //放大倍数
    });
    viewer.scene.primitives.add(model);
  } catch (error) {
    console.log(`Failed to load model. ${error}`);
  }
  //移动相机
  viewer.camera.flyTo({
    //相机飞入点
    destination: Cesium.Cartesian3.fromDegrees(114.39278, 30.52357, 80000.0),
  });
};
// 加载tiff  ？
export const tiffData = (viewer: Cesium.Viewer) => {
  viewer.zoomTo(
    viewer.scene.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: "../../../src/assets/data/dida/{z}/{x}/{y}.png",
      })
    )
  );
};
// 加载点云数据
export const lasData = async (viewer: Cesium.Viewer) => {
  let tileSet = viewer.scene.primitives.add(
    await Cesium.Cesium3DTileset.fromUrl(
      // "../../../src/assets/data/las/tileset.json",
      "http://localhost:9003/model/tkixw5aqX/tileset.json",
      {}
    )
  );
  tileSet.style = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [
        ["${z} >= 100", 'color("#11f524", 0.5)'],
        ["${z} >= 50", 'color("#f3581b")'],
        ["${z} >= 0", 'color("blue")'],
      ],
    },
    show: true,
    meta: {
      description: '"Building id ${id} has height ${z}."',
    },
  });
  viewer.flyTo(tileSet); //定位过去
};
// 添加倾斜模型
export const osgbData = async (viewer: Cesium.Viewer) => {
  let tileSet = viewer.scene.primitives.add(
    await Cesium.Cesium3DTileset.fromUrl(
      "../../../src/assets/data/osgb/tileset.json",
      // "http://localhost:9003/model/tkixw5aqX/tileset.json",
      {}
    )
  );
  viewer.flyTo(tileSet); //定位过去
};

