import * as Cesium from "cesium";
import { addPoint, addModel } from "./entity";
/**
 * 此文件包含内容：交互绘制点线面
 * 直接传入参数调用相关方法即可
 */
function drawShape(
  viewer: Cesium.Viewer,
  positionData: any,
  drawingMode: string
) {
  let shape;
  if (drawingMode === "line") {
    shape = viewer.entities.add({
      polyline: {
        positions: positionData,
        width: 5.0,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.GOLD,
        }),
        clampToGround: true,
      },
    });
  } else if (drawingMode === "polygon") {
    shape = viewer.entities.add({
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.SKYBLUE.withAlpha(0.7)
        ),
      },
    });
  } else if (drawingMode === "circle") {
    //当 positionData 为数组时绘制最终图形，如果为 function，则绘制动态图形
    let value =
      typeof positionData.getValue === "function"
        ? positionData.getValue(0)
        : positionData;
    shape = viewer.entities.add({
      position: value[0],
      ellipse: {
        //长、短半轴长度需要动态回调
        semiMinorAxis: new Cesium.CallbackProperty(function () {
          //半径，两点之间的距离
          let r = Math.sqrt(
            Math.pow(value[0].x - value[value.length - 1].x, 2) +
              Math.pow(value[0].y - value[value.length - 1].y, 2)
          );
          return r ? r : r + 1;
        }, false),
        semiMajorAxis: new Cesium.CallbackProperty(function () {
          let r = Math.sqrt(
            Math.pow(value[0].x - value[value.length - 1].x, 2) +
              Math.pow(value[0].y - value[value.length - 1].y, 2)
          );
          return r ? r : r + 1;
        }, false),
        material: Cesium.Color.BLUE.withAlpha(0.5),
        outline: true,
      },
    });
  } else if (drawingMode === "rectangle") {
    //当 positionData 为数组时绘制最终图形，如果为 function，则绘制动态图形
    let arr =
      typeof positionData.getValue === "function"
        ? positionData.getValue(0)
        : positionData;
    shape = viewer.entities.add({
      rectangle: {
        //坐标需要动态回调
        coordinates: new Cesium.CallbackProperty(function () {
          let obj = Cesium.Rectangle.fromCartesianArray(arr);
          return obj;
        }, false),
        material: Cesium.Color.RED.withAlpha(0.5),
      },
    });
  }
  return shape;
}
function removeHandler(handler:Cesium.ScreenSpaceEventHandler){
    handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}
export function handlerDrawClick(viewer: Cesium.Viewer, drawingMode: string) {
  let activeShapePoints: any[] = []; //存储动态点数组
  let activeShape: any; //存储动态图形
  let floatingPoint: any; //存储第一个点并判断是否开始获取鼠标移动结束位置
  console.log("drawingMode", drawingMode);
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  //注册鼠标左键单击事件
  handler.setInputAction(function (event: any) {
    //用 `viewer.scene.pickPosition` 代替 `viewer.camera.pickEllipsoid`
    //当鼠标指针在地形上移动时可以得到正确的点
    let earthPosition = viewer.scene.pickPosition(event.position);
    if (drawingMode == "point") {
      addPoint(viewer, earthPosition); //绘制点
    } else if (drawingMode == "model") {
      addModel(viewer, earthPosition); //添加模型
    }
    //如果鼠标指针不在地球上，则 earthPosition 未定义
    else if (
      drawingMode == "line" ||
      drawingMode == "polygon" ||
      drawingMode == "circle" ||
      drawingMode == "rectangle"
    ) {
      if (Cesium.defined(earthPosition)) {
        //第一次单击时，通过 CallbackProperty 绘制动态图形
        if (activeShapePoints.length === 0) {
          floatingPoint = addPoint(viewer, earthPosition);
          activeShapePoints.push(earthPosition);
          //动态点通过 CallbackProperty 实时更新渲染
          let dynamicPositions = new Cesium.CallbackProperty(function () {
            if (drawingMode === "polygon") {
              //如果绘制模式是 polygon，则回调函数返回的值是 PolygonHierarchy 类型
              return new Cesium.PolygonHierarchy(activeShapePoints);
            }
            return activeShapePoints;
          }, false);
          activeShape = drawShape(viewer, dynamicPositions, drawingMode); //绘制动态图形
        }
        //添加当前点到 activeShapePoints 中，实时渲染动态图形
        // debugger
        activeShapePoints.push(earthPosition);
        // addPoint(viewer, earthPosition);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  //注册鼠标移动事件
  handler.setInputAction(function (event: any) {
    if (Cesium.defined(floatingPoint)) {
      //获取鼠标移动到的最终位置
      let newPosition = viewer.scene.pickPosition(event.endPosition);
      if (Cesium.defined(newPosition)) {
        //动态去除数组中的最后一个点，并添加一个新的点，保证只保留鼠标位置点
        activeShapePoints.pop();
        activeShapePoints.push(newPosition);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  //注册鼠标右键单击事件
  handler.setInputAction(function () {
    activeShapePoints.pop(); //去除最后一个动态点
    if (activeShapePoints.length) {
      drawShape(viewer, activeShapePoints, drawingMode); //绘制最终图形
    }
    viewer.entities.remove(floatingPoint); //移除第一个点（重复了）
    viewer.entities.remove(activeShape); //去除动态图形
    floatingPoint = undefined;
    activeShape = undefined;
    activeShapePoints = [];
    removeHandler(handler)
    //terminateShape();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}
