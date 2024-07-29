import * as Cesium from "cesium";

export function addPrimitive(viewer: Cesium.Viewer) {
  
  addPolyline(viewer);
  addPolygon(viewer);
  addEllipse(viewer);
  addCircle(viewer);
  addCorridor(viewer);
  addRectangle(viewer);
  addWall(viewer);
  addBox(viewer);
  addEllipsoid(viewer);
  addCylinder(viewer);
  //   mergePolygon(viewer)
}
// 加线
export function addPolyline(viewer: Cesium.Viewer) {
  // 贴地-new Cesium.GroundPolylinePrimitive
  const polyline = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      // 贴地-new Cesium.GroundPolylineGeometry
      geometry: new Cesium.PolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray([
          108.0, 31.0, 100.0, 36.0, 105.0, 39.0,
        ]),
        width: 2.0,
      }),
      id: {
        name: "polyline",
        type: "polyline",
      },
    }),
    appearance: new Cesium.PolylineMaterialAppearance({
      material: Cesium.Material.fromType("PolylineGlow"),
    }),
  });
  viewer.scene.primitives.add(polyline);
}
// 加面
export function addPolygon(viewer: Cesium.Viewer) {
  // 贴地-new Cesium.GroundPrimitive
  const polygon = new Cesium.GroundPrimitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray([
            108, 45, 109, 48, 104, 48, 103, 45,
          ])
        ),
      }),
      id: {
        name: "polygon",
        type: "polygon",
      },
    }),
    appearance: new Cesium.MaterialAppearance({
      material: Cesium.Material.fromType("Grid"),
    }),
  });
  viewer.scene.primitives.add(polygon);
}
// 加椭圆
export function addEllipse(viewer: Cesium.Viewer) {
  // 贴地-new Cesium.GroundPrimitive
  const ellipse = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.EllipseGeometry({
        center: Cesium.Cartesian3.fromDegrees(105, 40.0), //中心点坐标
        semiMajorAxis: 500000.0, //长半轴长度
        semiMinorAxis: 300000.0, //短半轴长度
      }),
      id: {
        name: "ellipse",
        type: "ellipse",
      },
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType("Stripe"),
    }),
  });
  viewer.scene.primitives.add(ellipse);
}
// 加圆
export function addCircle(viewer: Cesium.Viewer) {
  // 贴地-new Cesium.GroundPrimitive
  const circle = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.CircleGeometry({
        center: Cesium.Cartesian3.fromDegrees(100, 45.0), //圆心
        radius: 300000.0, //半径
      }),
      id: {
        name: "circle",
        type: "circle",
      },
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType("Grid"),
    }),
  });
  viewer.scene.primitives.add(circle);
}
// 加走廊
export function addCorridor(viewer: Cesium.Viewer) {
  // 贴地-new Cesium.GroundPrimitive
  const corridor = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.CorridorGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray([
          100.0, 40.0, 105.0, 35.0, 102.0, 33.0,
        ]),
        width: 100000,
      }),
      id: {
        name: "corridor",
        type: "corridor",
      },
      attributes: {
        color: new Cesium.ColorGeometryInstanceAttribute(0.2, 0.5, 0.2, 0.7),
      },
    }),
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true, //是否使用平面阴影
      translucent: true, //是否半透明显示
    }),
  });
  viewer.scene.primitives.add(corridor);
}
// 加矩形
export function addRectangle(viewer: Cesium.Viewer) {
  // 贴地-new Cesium.GroundPrimitive
  const rectangle = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(95.0, 39.0, 100.0, 42.0),
      }),
      id: {
        name: "rectangle",
        type: "rectangle",
      },
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType("Water"),
    }),
  });
  viewer.scene.primitives.add(rectangle);
}
// 加墙
export function addWall(viewer: Cesium.Viewer) {
  const wall = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.WallGeometry({
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          107.0, 43.0, 100000.0, 97.0, 43.0, 100000.0, 97.0, 40.0, 100000.0,
          107.0, 40.0, 100000.0, 107.0, 43.0, 100000.0,
        ]),
      }),
      id: {
        name: "wall",
        type: "wall",
      },
    }),
    appearance: new Cesium.MaterialAppearance({
      material: Cesium.Material.fromType("Color"),
    }),
  });
  viewer.scene.primitives.add(wall);
}
// 盒子
export function addBox(viewer: Cesium.Viewer) {
  const box = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      modelMatrix: Cesium.Matrix4.multiplyByUniformScale(
        //左侧乘的变换矩阵
        Cesium.Matrix4.multiplyByTranslation(
          //左侧乘的变换矩阵
          //从具有东北向轴的参考帧计算 4*4 变换矩阵，以提供的原点为中心点
          Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(95.0, 45.0)
          ),
          //右侧乘的变换矩阵
          new Cesium.Cartesian3(0.0, 0.0, 80000.0),
          new Cesium.Matrix4()
        ),
        //缩放比例
        1.0,
        new Cesium.Matrix4()
      ),
      geometry: Cesium.BoxGeometry.fromDimensions({
        dimensions: new Cesium.Cartesian3(200000.0, 200000.0, 200000.0),
      }),
      id: {
        name: "box",
        type: "box",
      },
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromRandom()
        ),
      },
    }),
    appearance: new Cesium.PerInstanceColorAppearance({
      //   flat: true, //是否使用平面阴影
      translucent: false,
    }),
  });
  viewer.scene.primitives.add(box);
}
// 椭球体
export function addEllipsoid(viewer: Cesium.Viewer) {
  const ellipsoid = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      modelMatrix: Cesium.Matrix4.multiplyByUniformScale(
        //左侧乘的变换矩阵
        Cesium.Matrix4.multiplyByTranslation(
          //左侧乘的变换矩阵
          //从具有东北向轴的参考帧计算 4*4 变换矩阵，以提供的原点为中心点
          Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(102.0, 30.0)
          ),
          //右侧乘的变换矩阵
          new Cesium.Cartesian3(0.0, 0.0, 30000.0),
          new Cesium.Matrix4()
        ),
        //缩放比例
        1.0,
        new Cesium.Matrix4()
      ),
      geometry: new Cesium.EllipsoidGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        radii: new Cesium.Cartesian3(80000, 80000, 160000), //定义椭球体在 X、Y、Z 方向上的半径
      }),
      id: {
        name: "ellipsoid",
        type: "ellipsoid",
      },
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromRandom()
        ),
      },
    }),
    appearance: new Cesium.PerInstanceColorAppearance({
      //   flat: true, //是否使用平面阴影
      translucent: false,
    }),
  });
  viewer.scene.primitives.add(ellipsoid);
}
// 圆柱体
export function addCylinder(viewer: Cesium.Viewer) {
  const cylinder = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      modelMatrix: Cesium.Matrix4.multiplyByUniformScale(
        //左侧乘的变换矩阵
        Cesium.Matrix4.multiplyByTranslation(
          //左侧乘的变换矩阵
          //从具有东北向轴的参考帧计算 4*4 变换矩阵，以提供的原点为中心点
          Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(87.0, 40.0)
          ),
          //右侧乘的变换矩阵
          new Cesium.Cartesian3(0.0, 0.0, 20000.0),
          new Cesium.Matrix4()
        ),
        //缩放比例
        1.0,
        new Cesium.Matrix4()
      ),
      geometry: new Cesium.CylinderGeometry({
        length: 400000.0, //圆柱体高度
        topRadius: 200000.0, //圆柱体顶面半径
        bottomRadius: 200000.0, //圆柱体底面半径
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
      }),
      id: {
        name: "cylinder",
        type: "cylinder",
      },
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromRandom()
        ),
      },
    }),
    appearance: new Cesium.PerInstanceColorAppearance({
      // flat: true, //是否使用平面阴影
      translucent: false,
    }),
  });
  viewer.scene.primitives.add(cylinder);
}
interface polygonOptions {
  // 形成底面的坐标串
  coordinates: number[][] | number[];
  // 底面离地面高度
  heightAboveGround?: number;
  // 底面的拉伸高度
  polyHeight?: number;
  // 多边形面的颜色
  color?: string;
  // 多边形轮廓的颜色
  outLineColor?: string;
}
// const collection = new Cesium.PrimitiveCollection();
// primitive-此方式并没有展示出primitive的性能优势
export const createPolygon = (
  viewer: Cesium.Viewer,
  options: polygonOptions
): Cesium.GroundPrimitive | Cesium.Primitive => {
  const {
    coordinates,
    color = "#1af35b",
    outLineColor = "#000",
    heightAboveGround = 0,
    polyHeight = 0,
  } = options;

  const geometryInstance = {
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArrayHeights(coordinates as number[])
        ),
        // 离地面高度
        height: heightAboveGround,
        // 离地面高度加上底面的拉伸高度
        extrudedHeight: heightAboveGround + polyHeight,
      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(color)
        ),
      },
    }),
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: true, //是否透明
    }),
  };
  const outLineInstance = {
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonOutlineGeometry({
        // 创建polygonHierarchy对象
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArrayHeights(coordinates as number[])
        ),
        height: heightAboveGround,
        extrudedHeight: heightAboveGround + polyHeight,
      }),
      // geometry: new Cesium.PolylineGeometry({
      //   // 创建polygonHierarchy对象
      //   positions: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
      //   width: 9.0,
      //   vertexFormat : Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
      // }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(outLineColor)
        ),
      },
    }),
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: false, //是否透明
    }),
    // appearance : new Cesium.PolylineMaterialAppearance({
    //   material : Cesium.Material.fromType('Color')
    // })
  };
  let primitive;
  let primitiveOutLine;
  if (heightAboveGround === 0 && polyHeight === 0) {
    //贴地面
    primitive = new Cesium.GroundPrimitive(geometryInstance);
    primitiveOutLine = new Cesium.Primitive(outLineInstance);
  } else {
    primitive = new Cesium.Primitive(geometryInstance);
    primitiveOutLine = new Cesium.Primitive(outLineInstance);
  }
  viewer.scene.primitives.add(primitive);
  // viewer.scene.primitives.add(primitiveOutLine);
  return primitive;
};
// 大数据量的primitive
export const createMultiPolygon = (
  viewer: Cesium.Viewer,
  options: polygonOptions
) => {
  const {
    coordinates,
    color = "grey",
    heightAboveGround = 0,
    polyHeight = 0,
  } = options;
  let instances: Cesium.GeometryInstance[] = [];
  // 将几何体集合成一个实例再加进去
  for (let i = 0; i < (coordinates as number[][]).length; i++) {
    instances.push(
      new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArrayHeights(
              coordinates[i] as number[]
            )
          ),
          height: heightAboveGround,
          extrudedHeight: heightAboveGround + polyHeight,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString(color)
          ),
        },
      })
    );
  }
  let primitiveInstance = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: false, //是否透明
    }),
  });
  let primitive;
  if (heightAboveGround === 0 && polyHeight === 0) {
    //贴地面
    primitive = new Cesium.GroundPrimitive(primitiveInstance);
  } else {
    primitive = new Cesium.Primitive(primitiveInstance);
  }
  viewer.scene.primitives.add(primitive);
};
// 合并加载
export function mergePolygon(viewer: Cesium.Viewer) {
  //合并多个矩形
  const instances = []; //存储几何实例
  for (let lon = -180.0; lon < 180.0; lon += 5.0) {
    for (let lat = -85.0; lat < 85.0; lat += 5.0) {
      instances.push(
        new Cesium.GeometryInstance({
          geometry: new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(
              lon,
              lat,
              lon + 5.0,
              lat + 5.0
            ),
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          }),
          id: lon + "-" + lat,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromRandom({
                alpha: 0.6,
              })
            ),
          },
        })
      );
    }
  }
  //创建 Primitive 对象
  const mergeInstances = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.PerInstanceColorAppearance(),
  });
  viewer.scene.primitives.add(mergeInstances);
}
interface polygonOptions1 {
  // 形成底面的坐标串
  coordinates: any;
  // 底面离地面高度
  heightAboveGround?: number;
  // 底面的拉伸高度
  polyHeight?: number;
  // 多边形面的颜色
  color?: string;
  // 多边形轮廓的颜色
  outLineColor?: string;
}
export const createPolygonTest = (
  viewer: Cesium.Viewer,
  options: polygonOptions1
): Cesium.GroundPrimitive | Cesium.Primitive => {
  const {
    coordinates,
    color = "#1af35b",
    outLineColor = "#000",
    heightAboveGround = 0,
    polyHeight = 100000000,
  } = options;

  const geometryInstance = {
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          coordinates as []
        ),
        // 离地面高度
        // height: heightAboveGround,
        // 离地面高度加上底面的拉伸高度
        extrudedHeight: heightAboveGround + polyHeight,
        perPositionHeight:true
      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(color)
        ),
      },
    }),
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: true, //是否透明
    }),
  };
  
  let primitive;
  let primitiveOutLine;
  if (heightAboveGround === 0 && polyHeight === 0) {
    //贴地面
    primitive = new Cesium.GroundPrimitive(geometryInstance);
  } else {
    primitive = new Cesium.Primitive(geometryInstance);
  }
  viewer.scene.primitives.add(primitive);
  // viewer.scene.primitives.add(primitiveOutLine);
  return primitive;
};