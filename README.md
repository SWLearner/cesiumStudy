# 介绍

参考教材《WebGIS之Cesium三维软件开发》，环境搭建：vue3+vite+Typescript。

# 包含内容


1.  方法文件夹所在目录：\src\utils\cesium\ 
2.  数据加载(cesiumData.ts)：影像、OGC地图服务(wms、wmts)、GeoJSON、KML、TIFF、点云、地形、倾斜摄影、glTF、CZML、单张地图
3.  Cesium 事件处理(eventClick.ts)：鼠标事件、键盘事件、相机事件、场景渲染事件
4.  Cesium 图形绘制(entity.ts以及primitive.ts) ：坐标系统、几何图形绘制（Entity和Primitive）
5.  Cesium 三维模型(model.ts、czmlTest.ts):3D Tiles 要素拾取、3D Tiles 要素风格、3D 模型着色、贴合 3D 模型、模拟小车移动
6.  Cesium 工具应用(cesiumTool.ts、analysisTool.ts)：场景截图、 卷帘对比、反选遮罩、鹰眼视图、距离测量、 面积测量、 淹没分析

# 依赖下载

npm install

# 启动项目

npm run dev
