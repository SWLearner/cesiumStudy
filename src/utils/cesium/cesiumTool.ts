import * as Cesium from 'cesium';

export class CesiumDrawTool{
    public viewer:Cesium.Viewer;
    private handler:Cesium.ScreenSpaceEventHandler|null=null;
    private drawEntities: Cesium.Entity[]=[];
    constructor(viewer:Cesium.Viewer){
        this.viewer=viewer;
    }
    public draw(type:string){
        if(this.handler) this.removeHandler();
        let myPosition: Cesium.Cartesian3|undefined;
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        this.handler=new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        if(type=='Point'){
            this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent)=>{
                let ray= this.viewer.camera.getPickRay(event.position);
                myPosition = this.viewer.scene.globe.pick(ray!, this.viewer.scene)!;
                let entity=this.drawPoint(myPosition);
                this.drawEntities.push(entity);
            },Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.setInputAction(()=>{
                this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		        this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            this.handler.setInputAction(()=>{
                this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		        this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            this.stopDraw();
        }else if(type=='LineString'){
            let lines:Cesium.Cartesian3[]=[];
            let line:Cesium.Entity|undefined=undefined;
            this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent)=>{
                let ray:Cesium.Ray= this.viewer.camera.getPickRay(event.position)!;
                myPosition = this.viewer.scene.globe.pick(ray, this.viewer.scene)!;
                lines.push(myPosition);
                if(line==undefined){
                    line=this.drawPolyline(lines);
                    this.drawEntities.push(line!);
                }
            },Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler?.setInputAction((event:Cesium.ScreenSpaceEventHandler.MotionEvent)=>{
                let ray:Cesium.Ray= this.viewer.camera.getPickRay(event.endPosition)!;
                myPosition = this.viewer.scene.globe.pick(ray, this.viewer.scene)!;
                if(lines.length>=1){
                    lines.pop();
                }
                lines.push(myPosition);
            },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.stopDraw();
        }else if(type=='Polygon'){
            let  polygons:Cesium.Cartesian3[]=[];
            let polygon:Cesium.Entity|undefined=undefined;
            this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent)=>{
                let ray = this.viewer.camera.getPickRay(event.position);
                myPosition = this.viewer.scene.globe.pick(ray!, this.viewer.scene)!;
                polygons.push(myPosition);
                if(polygon==undefined){
                    polygon=this.drawPolygon(polygons);
                    this.drawEntities.push(polygon);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler?.setInputAction((event:Cesium.ScreenSpaceEventHandler.MotionEvent)=>{
                let ray:Cesium.Ray= this.viewer.camera.getPickRay(event.endPosition)!;
                myPosition = this.viewer.scene.globe.pick(ray, this.viewer.scene)!;
                if(polygons.length>=1){
                    polygons.pop();
                }
                polygons.push(myPosition);
            },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.setInputAction
            this.handler?.setInputAction(()=>{
                polygons.push(polygons[0]);
                this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            this.handler?.setInputAction(()=>{
                polygons.push(polygons[0]);
                this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            },Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        }
    }
    public measureLine(){
        if (this.handler) this.removeHandler();
        let myPosition: Cesium.Cartesian3 | undefined;
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        let lines: Cesium.Cartesian3[] = [];
        let line: Cesium.Entity | undefined = undefined;
        this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            let ray: Cesium.Ray = this.viewer.camera.getPickRay(event.position)!;
            myPosition = this.viewer.scene.globe.pick(ray, this.viewer.scene)!;
            lines.push(myPosition);
            if (line == undefined) {
                line = this.drawPolyline(lines);
                this.drawEntities.push(line!);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler?.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
            let ray: Cesium.Ray = this.viewer.camera.getPickRay(event.endPosition)!;
            myPosition = this.viewer.scene.globe.pick(ray, this.viewer.scene)!;
            if (lines.length >= 1) {
                lines.pop();
            }
            lines.push(myPosition);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.stopDraw();
    }
    private drawPoint(position: Cesium.Cartesian3){
        return this.viewer.entities.add({
            name: "点几何对象",
            show:true,
            position: position,
            point: {
                show: true,
                color: Cesium.Color.GOLD,
                pixelSize: 10,
                outlineColor: Cesium.Color.YELLOW,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                // heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
            }
        });
    }
    private drawPolyline(positions: Cesium.Cartesian3[]){
        if(positions.length<1) return;
        return this.viewer.entities.add({
            name:"线几何对象",
            polyline:{
                positions:new Cesium.CallbackProperty(()=>{
                    return positions
                },false),
                width:3.0,
                material:new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.GOLD,
                }),
                depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.GOLD,
                }),
                clampToGround: true
            }
        })
    }
    private drawPolygon(positions: Cesium.Cartesian3[]){
        return this.viewer.entities.add({
            polygon:{
                hierarchy: new Cesium.CallbackProperty(()=>{
                    return new Cesium.PolygonHierarchy(positions);
                },false),
                material: Cesium.Color.fromCssColorString("#FFD700").withAlpha(.2),
            },
            polyline: {
                positions:new Cesium.CallbackProperty(()=>{
                    return positions
                },false),
                width:3.0,
                material:new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.GOLD,
                }),
                depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.GOLD,
                }),
                clampToGround: true
            }
        })
    }
    private removeHandler(){
        this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    private stopDraw(){
        this.handler?.setInputAction(()=>{
            this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.handler?.setInputAction(()=>{
            this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        },Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }
    /**
    * 测量线的长度
    * @param firstPoint 第一点
    * @param secondPoint 第二点
    * @returns 返回两点的长度
    */
    public getSpaceDistance(firstPoint: Cesium.Cartesian3, secondPoint: Cesium.Cartesian3) {
       let point1cartographic = Cesium.Cartographic.fromCartesian(firstPoint);
       let point2cartographic = Cesium.Cartographic.fromCartesian(secondPoint);
       //返回两点之间的距离
       let distance: number = Math.sqrt(
           Math.pow(point2cartographic.longitude - point1cartographic.longitude, 2) +
           Math.pow(point2cartographic.latitude - point1cartographic.latitude, 2) +
           Math.pow(point2cartographic.height - point1cartographic.height, 2));
       let output: string;
       if (distance > 100) {
           output = Math.round((distance / 1000) * 100) / 100 + ' ' + 'km';
       } else {
           output = Math.round(distance * 100) / 100 + ' ' + 'm';
       }
       return output;
   }
   /**
   * 创建显示弹窗
   * @param viewer Cesium三维地球查看器
   * @param centerPoint 面的中心点
   * @param text 要展示的信息
   * @returns 返回创建的标签
   */
   public addLable(viewer: Cesium.Viewer, centerPoint: Cesium.Cartesian3, text: string) {
      return viewer.entities.add(new Cesium.Entity({
          position: centerPoint,
          label: {
              text: text,
              font: "14px,sans-serif",
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.YELLOW,
              //指定标签后面背景的可见性
              showBackground: true,
              //背景颜色
              backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8),
              //指定以像素为单位的水平和垂直背景填充padding
              backgroundPadding: new Cesium.Cartesian2(6, 6),
              pixelOffset: new Cesium.Cartesian2(0, -25),
              disableDepthTestDistance: Number.POSITIVE_INFINITY
  
          }
      }));
  }
}