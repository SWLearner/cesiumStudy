import * as Cesium from "cesium";
export function modelChange(viewer: Cesium.Viewer) {
  // osgbData(viewer);
  tileData(viewer);
}
// 添加倾斜模型
export const osgbData = async (viewer: Cesium.Viewer) => {
  let tileSet = viewer.scene.primitives.add(
    await Cesium.Cesium3DTileset.fromUrl(
      "../../../src/assets/data/osgb/tileset.json",
      // "http://localhost:9003/model/tkixw5aqX/tileset.json",
      {}
    )
  );
  heightChange(tileSet, -45);
  viewer.flyTo(tileSet); //定位过去
};
// 调整高度
export const heightChange = (
  tileset: Cesium.Cesium3DTileset,
  height: number
) => {
  // 将 3D Tiles 模型的外包围球中心点从笛卡儿空间直角坐标转换为弧度表示
  const cartographic = Cesium.Cartographic.fromCartesian(
    tileset.boundingSphere.center
  );
  //3D Tiles 模型的外包围球中心点原始坐标在表面的坐标
  const surface = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude
  );
  //3D Tiles 模型的外包围球中心点坐标偏移
  const offset = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    height
  );
  //计算两个笛卡儿分量的差异
  const translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3()
  );
  console.log("tileset", tileset, surface, offset, "translation", translation);
  //创建一个表示转换的 Matrix4
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
};
// 平移和旋转
//旋转平移函数
interface translateRotateType {
  tx: number;
  ty: number;
  tz: number;
  rx: number;
  ry: number;
  rz: number;
}
export function update3dtilesMaxtrix(
  // tileset: Cesium.Cesium3DTileset,
  translateRotate: translateRotateType
) {
  // let cartographic=Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center)
  //旋转
  let mx = Cesium.Matrix3.fromRotationX(
    Cesium.Math.toRadians(translateRotate.rx)
  );
  let my = Cesium.Matrix3.fromRotationY(
    Cesium.Math.toRadians(translateRotate.ry)
  );
  let mz = Cesium.Matrix3.fromRotationZ(
    Cesium.Math.toRadians(translateRotate.rz)
  );
  let rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
  let rotationY = Cesium.Matrix4.fromRotationTranslation(my);
  let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
  //平移
  let position = Cesium.Cartesian3.fromDegrees(
    translateRotate.tx,
    translateRotate.ty,
    translateRotate.tz
  );
  let m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  //将旋转矩阵和平移矩阵相乘
  Cesium.Matrix4.multiply(m, rotationX, m);
  Cesium.Matrix4.multiply(m, rotationY, m);
  Cesium.Matrix4.multiply(m, rotationZ, m);
  //返回旋转平移结果矩阵
  return m;
}
//

export async function tileData(viewer: Cesium.Viewer) {
  let tileSet = viewer.scene.primitives.add(
    await Cesium.Cesium3DTileset.fromUrl(
      "../../../src/assets/data/tileset/tileset.json",
      // "http://localhost:9003/model/tkixw5aqX/tileset.json",
      {}
    )
  );
  viewer.flyTo(tileSet); //定位过去
  handlePickedFeature(viewer)
}
function createPopup(viewer: Cesium.Viewer) {
  const popup = document.createElement("div");
  viewer.container.appendChild(popup);
  popup.style.display = "none";
  popup.style.position = "absolute";
  popup.style.bottom = "0";
  popup.style.left = "0";
  popup.style.padding = "4px";
  popup.style.background = "white";
  return popup
}
function handlePickedFeature(viewer: Cesium.Viewer) {
  const promptPopup=createPopup(viewer)
  let highlighted:{
    feature: Cesium.Cesium3DTileFeature|undefined,
    originalColor: Cesium.Color,
  } = {
    feature: undefined,
    originalColor: new Cesium.Color(),
  };
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (event:Cesium.ScreenSpaceEventHandler.MotionEvent) {
    //捕捉要素
    const pickedFeature = viewer.scene.pick(event.endPosition);
    //当未捕捉到要素时，隐藏 Div并将要素颜色置为初始值
    if (!Cesium.defined(pickedFeature)) {
      (highlighted.feature as Cesium.Cesium3DTileFeature).color = highlighted.originalColor;
      highlighted.feature = undefined;
      promptPopup.style.display = "none";
      return;
    }
    //若捕捉到要素
    else if(pickedFeature instanceof Cesium.Cesium3DTileFeature){
      console.log('getPropertyIds',pickedFeature.getPropertyIds())
      //高亮显示
      if (Cesium.defined(highlighted.feature)) {
        (highlighted.feature as Cesium.Cesium3DTileFeature).color = highlighted.originalColor;
        highlighted.feature = undefined;
      }
      // 保存被捕捉要素的原始数据以及原始颜色值
      highlighted.feature = pickedFeature;
      Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
      // 捕捉要素高亮
      pickedFeature.color = Cesium.Color.LIME.withAlpha(0.5);
      //提示高度
      promptPopup.style.display = "block";
      //加 5 是为了不让 Div 影响鼠标左键单击
      promptPopup.style.bottom = `${
        viewer.canvas.clientHeight - event.endPosition.y + 5
      }px`;
      promptPopup.style.left = `${event.endPosition.x}px`;
      const name =
        "Height:" + pickedFeature.getProperty("Height").toFixed(2) + "m";
      promptPopup.textContent = name;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
