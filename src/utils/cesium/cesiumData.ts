import * as Cesium from "cesium";
/**
 * @description: 添加arcgis地形
 * @return {*}
 */
export async function addArcGISTerrain(viewer: Cesium.Viewer) {
  const terrainProvider =
    await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(
      "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
      {
        token: "",
      }
    );
  viewer.terrainProvider = terrainProvider;
}
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
  viewer.imageryLayers.addImageryProvider(wmsLayers);
}
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
    tileMatrixLabels: tileMatrixLabels,// 地址若不改为{TileMatrixSet}:{TileMatrix}则需要加，若改了则无需添加
    tileMatrixSetID: "EPSG:4326",
    tilingScheme: new Cesium.WebMercatorTilingScheme({ 
      numberOfLevelZeroTilesX: 2,
      numberOfLevelZeroTilesY: 1,
    }),// EPSG:4326时必须添加，非常重要！！！！
    // 限制加载范围
    // rectangle: Cesium.Rectangle.fromDegrees(
    //  115.8758655018913,
    //  39.34299348956347,
    //  117.10695197046333,
    //  39.89546788893104
    // ),
  });
  viewer.imageryLayers.addImageryProvider(wmtsLayers);
}
export async function getBd() {
  const bd = await Cesium.BingMapsImageryProvider.fromUrl(
    "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
    {
      key: "IFapMVrArkLIMEILg215jvakhST5csSA",
    }
  );
  return bd;
}