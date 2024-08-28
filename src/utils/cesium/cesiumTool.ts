import * as Cesium from "cesium";
/**
 * 该类基于同目录下的interactDraw.ts文件进行类封装
 * 包含内容：交互绘制、测量、场景打印、绘制标签
 */
type drawingModeType="point"|"line"|"polygon"|"circle"|"rectangle"
export class CesiumDrawTool {
  public viewer: Cesium.Viewer;
  private handler: Cesium.ScreenSpaceEventHandler;
  //   private drawEntities: Cesium.Entity[] = [];
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    // this.getPosition()
  }
  /**
   * 绘制
   * @param drawingMode 绘制图形类型
   * @param callBack 回调函数,返回绘制完成的图形坐标
   */
  public draw(drawingMode: drawingModeType, callBack?: Function) {
    if (this.handler) this.removeHandler();
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    let activeShapePoints: any[] = []; //存储动态点数组
    let activeShape: any; //存储动态图形
    let floatingPoint: any; //存储第一个点并判断是否开始获取鼠标移动结束位置
    //注册鼠标左键单击事件
    const _this = this;
    this.handler.setInputAction(function (event: any) {
      //用 `viewer.scene.pickPosition` 代替 `viewer.camera.pickEllipsoid`
      //当鼠标指针在地形上移动时可以得到正确的点
      let earthPosition = _this.viewer.scene.pickPosition(event.position);
      if (drawingMode == "point") {
        _this.drawShape(earthPosition, drawingMode); //绘制点
        callBack && callBack(earthPosition);
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
            floatingPoint = _this.drawShape(earthPosition, "point");
            activeShapePoints.push(earthPosition);
            //非常重要：动态点通过 CallbackProperty 实时更新渲染
            let dynamicPositions = new Cesium.CallbackProperty(function () {
              if (drawingMode === "polygon") {
                //如果绘制模式是 polygon，则回调函数返回的值是 PolygonHierarchy 类型
                return new Cesium.PolygonHierarchy(activeShapePoints);
              }
              return activeShapePoints;
            }, false);
            activeShape = _this.drawShape(dynamicPositions, drawingMode); //绘制动态图形
          }
          //添加当前点到 activeShapePoints 中，实时渲染动态图形
          activeShapePoints.push(earthPosition);
          // addPoint(viewer, earthPosition);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //注册鼠标移动事件
    this.handler.setInputAction(function (event: any) {
      if (Cesium.defined(floatingPoint)) {
        //获取鼠标移动到的最终位置
        let newPosition = _this.viewer.scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
          //动态去除数组中的最后一个点，并添加一个新的点，保证只保留鼠标位置点
          activeShapePoints.pop();
          activeShapePoints.push(newPosition);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //注册鼠标右键单击事件
    this.handler.setInputAction(function () {
      //去除最后一个动态点
      activeShapePoints.pop();
      if (activeShapePoints.length) {
        //绘制最终图形
        _this.drawShape(activeShapePoints, drawingMode);
        callBack && callBack(activeShapePoints);
      }
      //移除第一个点
      _this.viewer.entities.remove(floatingPoint);
      //去除动态图形
      _this.viewer.entities.remove(activeShape);
      // 将本次绘画产生的数据全清除
      floatingPoint = undefined;
      activeShape = undefined;
      activeShapePoints = [];
      //  注意：每次绘画完一定要右键单击移除本次绘画的监听事件
      _this.removeHandler();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  //   测量距离
  public measureLine() {
    if (this.handler) this.removeHandler();
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    let positions: Cesium.Cartesian3[] = []; //用于存储要计算距离的点
    let activeShapePoints: any[] = []; //存储动态点数组
    let activeShape: any; //存储动态图形
    let floatingPoint: any; //存储第一个点并判断是否开始获取鼠标移动结束位置
    //注册鼠标左键单击事件
    const _this = this;
    let distance;
    let tempLabel: Cesium.Entity | null = null;
    this.handler.setInputAction(function (event: any) {
      let earthPosition = _this.viewer.scene.pickPosition(event.position);
      //计算距离
      positions.push(earthPosition);
      distance = _this.getSpaceDistance(positions);
      floatingPoint = _this.addPointLabel(earthPosition, distance);
      //如果鼠标指针不在地球上，则 earthPosition 是未定义的
      if (Cesium.defined(earthPosition)) {
        //第一次单击时，通过 CallbackProperty 绘制动态图
        if (activeShapePoints.length === 0) {
          //floatingPoint = drawPoint(earthPosition,null);
          activeShapePoints.push(earthPosition);
          //动态点通过 CallbackProperty 实时更新渲染
          let dynamicPositions = new Cesium.CallbackProperty(function () {
            return activeShapePoints;
          }, false);
          activeShape = _this.drawShape(dynamicPositions, "line"); //绘制动态图
        }
        //添加当前点到 activeShapePoints 中，实时渲染动态图
        activeShapePoints.push(earthPosition);
        floatingPoint = _this.addPointLabel(earthPosition, distance);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //注册鼠标移动事件
    this.handler.setInputAction(function (event: any) {
      if (Cesium.defined(floatingPoint)) {
        //获取鼠标移动到的最终位置
        let newPosition = _this.viewer.scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
          //动态去除数组中的最后一个点，并添加一个新的点，保证只保留鼠标位置点
          activeShapePoints.pop();
          activeShapePoints.push(newPosition);
          if (tempLabel) {
            _this.viewer.entities.remove(tempLabel);
            tempLabel = null;
          }
          tempLabel = _this.addLabel(
            newPosition,
            _this.getSpaceDistance(activeShapePoints)
          );
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //注册鼠标右键单击事件
    this.handler.setInputAction(function () {
      //去除最后一个动态点
      activeShapePoints.pop();
      if (tempLabel) {
        _this.viewer.entities.remove(tempLabel);
        tempLabel = null;
      }
      if (activeShapePoints.length) {
        //绘制最终图形
        _this.drawShape(activeShapePoints, "line");
      }
      //移除第一个点
      _this.viewer.entities.remove(floatingPoint);
      //去除动态图形
      _this.viewer.entities.remove(activeShape);
      // 将本次绘画产生的数据全清除
      floatingPoint = undefined;
      activeShape = undefined;
      activeShapePoints = [];
      positions = []; //清空计算距离的点数组
      //  注意：每次绘画完一定要右键单击移除本次绘画的监听事件
      _this.removeHandler();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  //   测量面积
  public measureArea() {
    if (this.handler) this.removeHandler();
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    // 存储要计算面积的点
    let positions: Cesium.Cartesian3[] = [];
    // 存储计算距离与添加 label 的点
    let activeShapePoints: any[] = []; //存储动态点数组
    let activeShape: any; //存储动态图形
    let floatingPoint: any; //存储第一个点并判断是否开始获取鼠标移动结束位置
    //注册鼠标左键单击事件
    const _this = this;
    let tempLabel: Cesium.Entity | null = null;
    this.handler.setInputAction(function (event: any) {
      let earthPosition = _this.viewer.scene.pickPosition(event.position);
      positions.push(earthPosition);
      //如果鼠标指针不在地球上，则 earthPosition 是未定义的
      if (Cesium.defined(earthPosition)) {
        //第一次单击时，通过 CallbackProperty 绘制动态图形
        if (activeShapePoints.length === 0) {
          floatingPoint = _this.drawShape(earthPosition, "point");
          activeShapePoints.push(earthPosition);
          //非常重要：动态点通过 CallbackProperty 实时更新渲染
          let dynamicPositions = new Cesium.CallbackProperty(function () {
            //如果绘制模式是 polygon，则回调函数返回的值是 PolygonHierarchy 类型
            return new Cesium.PolygonHierarchy(activeShapePoints);
          }, false);
          activeShape = _this.drawShape(dynamicPositions, "polygon"); //绘制动态图形
        }
        //添加当前点到 activeShapePoints 中，实时渲染动态图形
        activeShapePoints.push(earthPosition);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //注册鼠标移动事件
    this.handler.setInputAction(function (event: any) {
      //获取鼠标移动到的最终位置
      let newPosition = _this.viewer.scene.pickPosition(event.endPosition);
      if (Cesium.defined(newPosition)) {
        //动态去除数组中的最后一个点，并添加一个新的点，保证只保留鼠标位置点
        activeShapePoints.pop();
        activeShapePoints.push(newPosition);
        if (tempLabel) {
          _this.viewer.entities.remove(tempLabel);
          tempLabel = null;
        }
        tempLabel = _this.addLabel(
          newPosition,
          _this.getSpaceArea(activeShapePoints)
        );
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //注册鼠标右键单击事件
    this.handler.setInputAction(function () {
      //去除最后一个动态点
      activeShapePoints.pop();
      if (tempLabel) {
        _this.viewer.entities.remove(tempLabel);
        tempLabel = null;
      }
      //计算面积
      let text = _this.getSpaceArea(positions);
      //添加标注
      _this.addLabel(positions[0], text);
      if (activeShapePoints.length) {
        //绘制最终图形
        _this.drawShape(activeShapePoints, "polygon");
      }
      //移除第一个点
      _this.viewer.entities.remove(floatingPoint);
      //去除动态图形
      _this.viewer.entities.remove(activeShape);
      // 将本次绘画产生的数据全清除
      floatingPoint = undefined;
      activeShape = undefined;
      activeShapePoints = [];
      positions = []; //清空计算距离的点数组
      //  注意：每次绘画完一定要右键单击移除本次绘画的监听事件
      _this.removeHandler();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  //  场景打印
  public printScreenScene(name: string = "当前场景") {
    this.viewer.render(); //重新渲染界面
    let imageUrl = this.viewer.scene.canvas.toDataURL("image/png"); //获取下载链接
    let saveLink = document.createElement("a"); //创建下载链接标签<a>
    saveLink.href = imageUrl; //设置下载链接
    saveLink.download = name; //设置下载图片名称
    document.body.appendChild(saveLink); //将<a>标签添加到 body 中
    saveLink.click(); //单击<a>标签
  }
  //   绘制画几何体方法
  private drawShape(positionData: any, drawingMode: string) {
    let shape;
    if (drawingMode === "point") {
      shape = this.viewer.entities.add({
        position: positionData,
        point: {
          color: Cesium.Color.GOLD, //颜色
          pixelSize: 10, //大小
          outlineColor: Cesium.Color.YELLOW, //轮廓颜色，
          disableDepthTestDistance:Number.POSITIVE_INFINITY,
          // 设置贴地
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
    }
    if (drawingMode === "line") {
      shape = this.viewer.entities.add({
        polyline: {
          positions: positionData,
          width: 5.0,
          material: new Cesium.PolylineGlowMaterialProperty({
            color: Cesium.Color.GOLD,
          }),
          depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
            color: Cesium.Color.GOLD,
          }), //指定折线低于地形时用于绘制折线的材料
          clampToGround: true,
        },
      });
    } else if (drawingMode === "polygon") {
      shape = this.viewer.entities.add({
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
          ? positionData.getValue()
          : positionData;
      shape = this.viewer.entities.add({
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
          ? positionData.getValue()
          : positionData;
      shape = this.viewer.entities.add({
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
  public drawPolyline(positions: Cesium.Cartesian3[]) {
    if (positions.length < 1) return;
    return this.viewer.entities.add({
      name: "线几何对象",
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return positions;
        }, false),
        width: 3.0,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.GOLD,
        }),
        depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.GOLD,
        }),
        clampToGround: true,
      },
    });
  }
  public drawPolygon(positions: Cesium.Cartesian3[]) {
    return this.viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          return new Cesium.PolygonHierarchy(positions);
        }, false),
        material: Cesium.Color.fromCssColorString("#FFD700").withAlpha(0.2),
      },
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return positions;
        }, false),
        width: 3.0,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.GOLD,
        }),
        depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.GOLD,
        }),
        clampToGround: true,
      },
    });
  }
  private removeHandler() {
    (this.handler as Cesium.ScreenSpaceEventHandler).removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
    (this.handler as Cesium.ScreenSpaceEventHandler).removeInputAction(
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
    (this.handler as Cesium.ScreenSpaceEventHandler).removeInputAction(
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );
  }
  public stopDraw() {
    this.handler?.setInputAction(() => {
      this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    this.handler?.setInputAction(() => {
      this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  public getPosition() {
    const _this = this;
    this.handler.setInputAction(function (evt: any) {
      //   let pickedObject = _this.viewer.scene.pick(evt.position); //判断是否拾取到模型
      //   //如果拾取到模型
      //   if (
      //     _this.viewer.scene.pickPositionSupported &&
      //     Cesium.defined(pickedObject)
      //   ) {
      //     let cartesian = _this.viewer.scene.pickPosition(evt.position);
      //     if (Cesium.defined(cartesian)) {
      //       //根据笛卡儿坐标获取弧度
      //       let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      //       //根据弧度获取经度
      //       let lng = Cesium.Math.toDegrees(cartographic.longitude);
      //       //根据弧度获取纬度
      //       let lat = Cesium.Math.toDegrees(cartographic.latitude);
      //       let height = cartographic.height; //模型高度
      //       console.log(cartesian, lng, lat, height);
      //     }
      //   }
      //如果未拾取到模型而拾取到地形
      //   else {
      //在世界坐标系中从屏幕坐标向场景中创建射线
      let ray = _this.viewer.camera.getPickRay(evt.endPosition);
      //   let newPosition = _this.viewer.scene.pickPosition(event.endPosition);
      //找到射线与渲染的地球表面之间的交点，值为 Cartesian3 类型
      let cartesian = _this.viewer.scene.globe.pick(
        ray as Cesium.Ray,
        _this.viewer.scene
      )!;
      if (Cesium.defined(cartesian)) {
        //根据交点得到经纬度、高度信息并添加点和标注框
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        //根据弧度获取经度
        let lng = Cesium.Math.toDegrees(cartographic.longitude);
        //根据弧度获取纬度
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let height = cartographic.height; //高度
        console.log(cartesian, cartographic, lng, lat, height);
      }
      //   }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
  /**
   * 测量线的长度
   * @param firstPoint 第一点
   * @param secondPoint 第二点
   * @returns 返回两点的长度
   */
  //计算空间距离的函数-两种计算方式
  public getSpaceDistance(positions: Cesium.Cartesian3[]) {
    let distance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      //直接计算距离
      distance += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
      /**根据经纬度计算距离**/
      /*let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
      let point2cartographic = Cesium.Cartographic.fromCartesian(
        positions[i + 1]
      );
      let geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      let s = geodesic.surfaceDistance;
      //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
      //返回两点之间的空间距离
      s = Math.sqrt(
        Math.pow(s, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2)
      );
      distance = distance + s;*/
    }
    return distance.toFixed(2) + "米";
  }
  /**
   * 计算贴面的面积
   * @param points 点坐标数组
   * @returns 返回计算得到的面积值
   */
  public getSpaceArea(points: Cesium.Cartesian3[]) {
    let degreesPerRation = 180.0 / Math.PI;
    function Angle(
      p1: Cesium.Cartesian3,
      p2: Cesium.Cartesian3,
      p3: Cesium.Cartesian3
    ) {
      let bearing21 = Bearing(p2, p1);
      let bearing23 = Bearing(p2, p3);
      let angle = bearing21 - bearing23;
      if (angle < 0) {
        angle += 360;
      }
      return angle;
    }

    /**
     * 计算两点的角度
     * @param from 起点坐标
     * @param to 终点坐标
     * @returns
     */
    function Bearing(from: Cesium.Cartesian3, to: Cesium.Cartesian3) {
      let myfrom = Cesium.Cartographic.fromCartesian(from);
      let myto = Cesium.Cartographic.fromCartesian(to);
      let lat1 = myfrom.latitude;
      let lon1 = myfrom.longitude;
      let lat2 = myto.latitude;
      let lon2 = myto.longitude;
      let angle = -Math.atan2(
        Math.sin(lon1 - lon2) * Math.cos(lat2),
        Math.cos(lat1) * Math.sin(lat2) -
          Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
      );
      if (angle < 0) {
        angle += Math.PI * 2.0;
      }
      angle = angle * degreesPerRation;
      return angle;
    }
    let res = 0;
    for (let i = 0; i < points.length - 2; i++) {
      let j = (i + 1) % points.length;
      let k = (i + 1) % points.length;
      let totalAngle = Angle(points[i], points[j], points[k]);
      let dis1 = this.distance(points[j], points[0]);
      let dis2 = this.distance(points[k], points[0]);
      res += (dis1 * dis2 * Math.sin(totalAngle)) / 2;
    }
    let output: string;
    if (res < 10000) {
      output = Math.abs(res).toFixed(4) + " 平方米";
    } else {
      output = Math.abs(res / 1000000.0).toFixed(4) + " 平方公里";
    }
    return output;
  }
  //绘制点和标签
  public addPointLabel(position: Cesium.Cartesian3, textDistance: string) {
    let pointLabel = new Cesium.Entity({
      position: position,
      point: {
        color: Cesium.Color.SKYBLUE,
        pixelSize: 6,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 2,
        disableDepthTestDistance: 10000, //当距离在 1000 以下时不被高程遮挡
      },
      label: {
        text: textDistance + "米",
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20),
        heightReference: Cesium.HeightReference.NONE,
      },
    });
    this.viewer.entities.add(pointLabel);
    return pointLabel;
  }
  //   仅绘制标签
  public addLabel(position: Cesium.Cartesian3, textDistance: string) {
    let label = new Cesium.Entity({
      position: position,
      label: {
        text: textDistance,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(10, -10),
        heightReference: Cesium.HeightReference.NONE,
      },
    });
    this.viewer.entities.add(label);
    return label;
  }
  /**
   * 计算两点的距离
   * @param point1 第一点
   * @param point2 第二点
   * @returns 返回两点的距离
   */
  private distance(point1: Cesium.Cartesian3, point2: Cesium.Cartesian3) {
    let length: number = Cesium.Cartesian3.distance(point1, point2);
    return length;
  }
}
