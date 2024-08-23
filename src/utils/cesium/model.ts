import * as Cesium from "cesium";
/**
 * 此文件包含内容：模型相关内容具体看注释
 * 直接传入参数调用相关方法即可
 */
export function modelChange(viewer: Cesium.Viewer) {
  // osgbData(viewer);
  // tileData(viewer);
  osmBuildingsData(viewer);
}
// 1.倾斜模型操作
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
// 倾斜模型高度调整方法
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
// 倾斜模型平移和旋转
interface translateRotateType {
  tx: number;
  ty: number;
  tz: number;
  rx: number;
  ry: number;
  rz: number;
}
//旋转平移方法
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
//2.3dtile属性操作
// 加载3dtile切片数据
export async function tileData(viewer: Cesium.Viewer) {
  let tileSet = viewer.scene.primitives.add(
    await Cesium.Cesium3DTileset.fromUrl(
      "../../../src/assets/data/tileset/tileset.json",
      // "http://localhost:9003/model/tkixw5aqX/tileset.json",
      {}
    )
  );
  viewer.flyTo(tileSet); //定位过去
  // 要素拾取
  handlePickedFeature(viewer, "Height");
}
// 创建信息提示框
function createPopup(viewer: Cesium.Viewer) {
  const popup = document.createElement("div");
  viewer.container.appendChild(popup);
  // const popup=document.getElementById('para')
  popup.style.display = "none";
  popup.style.position = "absolute";
  popup.style.bottom = "0";
  popup.style.left = "0";
  popup.style.padding = "4px";
  popup.style.background = "white";
  return popup;
}
/**
 * 3dtile要素拾取方法
 * @param viewer
 * @param propertyName 拾取要素的某属性名
 */
function handlePickedFeature(viewer: Cesium.Viewer, propertyName: string) {
  const promptPopup = createPopup(viewer);
  let highlighted: {
    feature: Cesium.Cesium3DTileFeature | undefined;
    originalColor: Cesium.Color;
  } = {
    feature: undefined,
    originalColor: new Cesium.Color(),
  };
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (
    event: Cesium.ScreenSpaceEventHandler.MotionEvent
  ) {
    // 将高亮的还原并隐藏信息面板
    if (highlighted.feature instanceof Cesium.Cesium3DTileFeature) {
      highlighted.feature.color = highlighted.originalColor;
      highlighted.feature = undefined;
    }
    promptPopup.style.display = "none";
    //捕捉要素
    const pickedFeature = viewer.scene.pick(event.endPosition);
    //当未捕捉到要素时直接返回
    if (!Cesium.defined(pickedFeature)) {
      return;
    }
    //若捕捉到要素
    else if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
      // console.log("getPropertyIds", pickedFeature.getPropertyIds());
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
      const name = `${propertyName}:` + pickedFeature.getProperty(propertyName);
      promptPopup.textContent = name;
    }
  },
  Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

// 3.cesium白膜建筑数据的渲染操作
export async function osmBuildingsData(viewer: Cesium.Viewer) {
  //添加 OSM 建筑白膜数据
  let osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
  viewer.scene.primitives.add(osmBuildingsTileset);
  // 获取每个tile包含要素属性
  // osmBuildingsTileset.tileLoad.addEventListener(function(tile){
  //   console.log('tile',tile,tile.content)
  //   if(tile.content.featuresLength===2){
  //     console.log('要素',tile.content.getFeature(0).getPropertyIds(),tile.content.getFeature(1).getPropertyIds())
  //   }
  // })
  //调整相机视角
  viewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(114.39564, 30.52214, 2000),
  });

  // 按建筑类型渲染颜色
  // colorByBuildingType(osmBuildingsTileset);
  // 要素拾取
  // handlePickedFeature(viewer, "building");
  // 只显示"apartments"类型的建筑
  // showByBuildingType(osmBuildingsTileset, "apartments");
  // 获取鼠标移动拾取到要素的经纬度 然后根据与该要素的距离远近进行按距离渲染
  // colorByDistanceToCoordinate(viewer,osmBuildingsTileset)
  colorByInteractive(viewer, osmBuildingsTileset);
}
/**
 * 白膜建筑数据按建筑类型渲染
 * @param tileset 3dtile数据
 */
export function colorByBuildingType(tileset: Cesium.Cesium3DTileset) {
  let tilesetStyle = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [
        ["${building}==='university'", "color('skyblue',0.8)"],
        ["${building}==='dormitory'", "color('cyan',0.9)"],
        ["${building}==='yes'", "color('purple',0.7)"],
      ],
    },
  });
  tileset.style = tilesetStyle;
}
/**
 * 按建筑类型显隐
 * @param tileset 3dtile数据
 * @param buildingType
 */
export function showByBuildingType(
  tileset: Cesium.Cesium3DTileset,
  buildingType: string
) {
  switch (buildingType) {
    case "dormitory":
      tileset.style = new Cesium.Cesium3DTileStyle({
        show: "${building} === 'dormitory'",
      });
      break;
    case "apartments":
      tileset.style = new Cesium.Cesium3DTileStyle({
        show: "${building} === 'apartments'",
      });
      break;
    default:
      break;
  }
}
/**
 * 要素缓冲区颜色渲染
 * @param viewer
 * @param tileset
 */
export function colorByDistanceToCoordinate(
  viewer: Cesium.Viewer,
  tileset: Cesium.Cesium3DTileset
) {
  //获取单击位置坐标
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (
    click: Cesium.ScreenSpaceEventHandler.MotionEvent
  ) {
    let pickedFeature = viewer.scene.pick(click.endPosition);
    if (!Cesium.defined(pickedFeature)) {
      let tilesetStyle = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [["true", "color('white')"]],
        },
      });
      tileset.style = tilesetStyle;
      return;
    }
    //若捕捉到要素
    else if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
      console.log(
        "pickedFeature",
        pickedFeature,
        pickedFeature.getProperty("cesium#longitude")
      );
      let pickedLongitude = parseFloat(
        pickedFeature.getProperty("cesium#longitude")
      );
      let pickedLatitude = parseFloat(
        pickedFeature.getProperty("cesium#latitude")
      );
      let tilesetStyle = new Cesium.Cesium3DTileStyle({
        defines: {
          //自定义distance字段
          distance:
            "distance(vec2(${feature['cesium#longitude']}, ${feature['cesium#latitude']}),vec2(" +
            pickedLongitude +
            "," +
            pickedLatitude +
            "))",
        },
        color: {
          conditions: [
            ["${distance}>0.014", "color('blue')"],
            ["${distance}>0.010", "color('green')"],
            ["${distance}>0.006", "color('yellow')"],
            ["${distance}>0.0001", "color('red')"],
            ["true", "color('white')"],
          ],
        },
      });
      tileset.style = tilesetStyle;
    }
  },
  Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
/**
 * 点击获取要素根据要素属性进行渲染
 * @param viewer
 * @param tileset
 */
export function colorByInteractive(
  viewer: Cesium.Viewer,
  tileset: Cesium.Cesium3DTileset
) {
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let selectedFeature: {
    feature: Cesium.Cesium3DTileFeature | undefined;
    originalColor: Cesium.Color;
  } = {
    feature: undefined,
    originalColor: new Cesium.Color(),
  };
  handler.setInputAction(function (
    click: Cesium.ScreenSpaceEventHandler.PositionedEvent
  ) {
    if (selectedFeature.feature) {
      selectedFeature.feature.color = selectedFeature.originalColor;
      selectedFeature.feature = undefined;
      selectedFeature.originalColor = new Cesium.Color();
    }
    let pickedFeature = viewer.scene.pick(click.position);
    if (!Cesium.defined(pickedFeature)) {
      return;
    } else if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
      selectedFeature.feature = pickedFeature;
      Cesium.Color.clone(pickedFeature.color, selectedFeature.originalColor);
      // 同：pickedFeature.color= Cesium.Color.GREEN
      let featureId = pickedFeature.getProperty("elementId");
      tileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [["${elementId}===" + featureId, "color('green')"]],
        },
      });
    }
  },
  Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
/**
 * 位置更新
 * @param viewer
 */
export function modelPosition(
  viewer: Cesium.Viewer
) {
  //开启深度检测
  viewer.scene.globe.depthTestAgainstTerrain = true;
  //定义变量[118, 30, 5000]
  let longitude = 118.40074;
  let latitude = 30.51978;
  let range = 0.0001;
  let duration = 8.0;
  let cartographic = new Cesium.Cartographic(); //记录偏移后的坐标值
  //添加模型
  let entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    model: {
      uri: "../../../src/assets/models/car.glb",
    },
  });
  //定位过去
  viewer.zoomTo(entity);
  //添加点和标签
  let point = viewer.entities.add({
    position:Cesium.Cartesian3.fromDegrees(longitude,latitude),
    point: {
      pixelSize: 10,
      color: Cesium.Color.YELLOW,
      disableDepthTestDistance: Number.POSITIVE_INFINITY, //正无穷大,设置距地面多少米后禁用深度测试
    },
    label: {
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(5, 5),
    },
  });
  setInterval(()=>{
    point.position=new Cesium.ConstantPositionProperty(updatePosition())
  },1000)
  function updatePosition() {
    let time=viewer.clock.currentTime
    //计算偏移量
    const offset = (time.secondsOfDay % duration) / duration;
    //计算新的坐标点经度
    cartographic.longitude = Cesium.Math.toRadians(
      longitude - range + offset * range * 2000.0
    );
    cartographic.latitude = Cesium.Math.toRadians(latitude);
    let height;
    if (viewer.scene.sampleHeightSupported) {
      //获取新的坐标点高度
      height = viewer.scene.sampleHeight(cartographic);
    }
    if (Cesium.defined(height)&&height) {
      cartographic.height = height;
      //更新标签的 text 属性值
    } else {
      cartographic.height = 0.0;
    }
    //返回坐标位置，用于更新点和标签的位置
    return Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      cartographic.height
    );
  }
}
