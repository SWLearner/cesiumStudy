import * as Cesium from "cesium";
export class eagleEye {
  public eyeViewer: Cesium.Viewer | null;
  public viewer: Cesium.Viewer;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.eyeViewer = null;
  }
  public async initViewer() {
    try {
      this.eyeViewer = new Cesium.Viewer("eagleEye", {
        fullscreenButton: true, //全屏显示
        geocoder: false, //是否显示位置查找工具
        homeButton: false, //是否显示首页位置工具
        sceneModePicker: false, //是否显示视角模式切换工具
        baseLayerPicker: false, //是否显示默认图层选择工具
        navigationHelpButton: false, //是否显示导航帮助工具
        animation: false, //是否显示动画工具
        timeline: false, //是否显示时间轴工具
        // terrainProvider: await Cesium.createWorldTerrainAsync(),
      });
    }finally{
      if (!this.eyeViewer) return;
      console.log('this.eyeViewer',this.eyeViewer)
      //去除 Cesium 版权信息
      this.eyeViewer.cesiumWidget.creditContainer.style.display = "none";
      //禁用鹰眼视图的相机操作
      //旋转
      this.eyeViewer.scene.screenSpaceCameraController.enableRotate = false;
      //平移
      this.eyeViewer.scene.screenSpaceCameraController.enableTranslate = false;
      //放大
      this.eyeViewer.scene.screenSpaceCameraController.enableZoom = false;
      //倾斜
      this.eyeViewer.scene.screenSpaceCameraController.enableTilt = false;
      //相机观看的方向
      this.eyeViewer.scene.screenSpaceCameraController.enableLook = false;
      //设置主视图引起监听事件而触发的相机变化幅度，越小越灵敏
      // viewer.camera.percentageChanged = 0.01;
      this.viewer.camera.changed.addEventListener(this.reViewer,this);
      this.viewer.scene.preRender.addEventListener(this.reViewer,this);
    }
  }
  //控制鹰眼视图相机视角
  private reViewer() {
    if (!this.eyeViewer) return;
    this.eyeViewer.camera.flyTo({
      destination: this.viewer.camera.position,
      orientation: {
        heading: this.viewer.camera.heading,
        pitch: this.viewer.camera.pitch,
        roll: this.viewer.camera.roll,
      },
      duration: 0.0,
    });
  }
}
