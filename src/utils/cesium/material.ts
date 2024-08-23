import * as Cesium from "cesium";
/**
 * 该文件包含内容：雪、雾、云、雨、水、镭射
 *  直接传入参数调用相关方法即可
 */
export function materialFunction(viewer: Cesium.Viewer) {
  //   addCloud(viewer);
  //   addFog(viewer);
  addSnow(viewer);
}
export function addCloud(viewer: Cesium.Viewer) {
  let clouds = viewer.scene.primitives.add(
    new Cesium.CloudCollection({
      noiseDetail: 16.0,
    })
  );
  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(114.39264, 30.52252, 1000),
    scale: new Cesium.Cartesian2(25, 12),
    slice: 0.36,
    brightness: 1,
  });
  viewer.camera.lookAt(
    Cesium.Cartesian3.fromDegrees(114.39264, 30.52252, 1000),
    new Cesium.Cartesian3(30, 30, -10)
  );
}
export function addFog(viewer: Cesium.Viewer) {
  let fragmentShaderSource = `float getDistance(sampler2D depthTexture, vec2 texCoords)
  {
      float depth = czm_unpackDepth(texture(depthTexture, texCoords));
      if (depth == 0.0) {
          return czm_infinity;
      }
      vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);
      return -eyeCoordinate.z / eyeCoordinate.w;
  }
  //根据距离，在中间进行插值
  float interpolateByDistance(vec4 nearFarScalar, float distance)
  {
      //根据常识，雾应该是距离远，越看不清，近距离内的物体可以看清
      //因此近距离alpha=0，远距离的alpha=1.0
      //本例中设置可见度为200米
      //雾特效的起始距离
      float startDistance = nearFarScalar.x;
      //雾特效的起始alpha值
      float startValue = nearFarScalar.y;
      //雾特效的结束距离
      float endDistance = nearFarScalar.z;
      //雾特效的结束alpha值
      float endValue = nearFarScalar.w;
      //根据每段距离占总长度的占比，插值alpha，距离越远，alpha值越大。插值范围0,1。
      float t = clamp((distance - startDistance) / (endDistance - startDistance), 0.0, 1.0);
      return mix(startValue, endValue, t);
  }
  vec4 alphaBlend(vec4 sourceColor, vec4 destinationColor)
  {
      return sourceColor * vec4(sourceColor.aaa, 1.0) + destinationColor * (1.0 - sourceColor.a);
  }
  uniform sampler2D colorTexture;
  uniform sampler2D depthTexture;
  uniform vec4 fogByDistance;
  uniform vec4 fogColor;
  in vec2 v_textureCoordinates;
  void main(void)
  {
      //获取地物距相机的距离
      float distance = getDistance(depthTexture, v_textureCoordinates);
      //获取场景原本的纹理颜色
      vec4 sceneColor = texture(colorTexture, v_textureCoordinates);
      //根据距离，对alpha进行插值
      float blendAmount = interpolateByDistance(fogByDistance, distance);
      //将alpha变化值代入雾的原始颜色中，并将雾与场景原始纹理进行融合
      vec4 finalFogColor = vec4(fogColor.rgb, fogColor.a * blendAmount);
      out_FragColor = alphaBlend(finalFogColor, sceneColor);
  }`;
  let postProcessStage = new Cesium.PostProcessStage({
    //片源着色器
    fragmentShader: fragmentShaderSource,
    uniforms: {
      fogByDistance: new Cesium.Cartesian4(500, 0.0, 4000, 0.8), //
      fogColor: Cesium.Color.WHITE,
    },
  });
  viewer.scene.postProcessStages.add(postProcessStage);
}
export function addRain(viewer: Cesium.Viewer) {
  let fragmentShaderSource = `
    uniform sampler2D colorTexture;
	in vec2 v_textureCoordinates;
    uniform float tiltAngle;
    uniform float rainSize;
    uniform float rainWidth;
    uniform float rainSpeed;
	float hash(float x){
	  return fract(sin(x*233.3)*13.13);
	}
    out vec4 vFragColor;
	void main(void){
		float time = czm_frameNumber / rainSpeed;
		vec2 resolution = czm_viewport.zw;
		vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
		vec3 c=vec3(1.0,1.0,1.0);
		float a= tiltAngle;
		float si=sin(a),co=cos(a);
		uv*=mat2(co,-si,si,co);
		uv*=length(uv+vec2(0,4.9))*rainSize + 1.;
		float v = 1.0 - abs(sin(hash(floor(uv.x * rainWidth)) * 2.0));
		float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;
		c*=v*b;
        vFragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c,.3), .3);
	}`;
  let postProcessStage = new Cesium.PostProcessStage({
    //片源着色器
    fragmentShader: fragmentShaderSource,
    uniforms: {
      tiltAngle: 0.1, // 倾斜角度
      rainSize: 0.6, // 雨大小
      rainWidth: 300, //雨长度
      rainSpeed: 70, //雨速
    },
  });
  viewer.scene.postProcessStages.add(postProcessStage);
}
export function addSnow(viewer: Cesium.Viewer) {
  let fragmentShaderSource = `uniform sampler2D colorTexture;
    in vec2 v_textureCoordinates;
    uniform float rainSpeed;
    float snow(vec2 uv,float scale){
      float time = czm_frameNumber / rainSpeed;
      float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;
      uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;
      uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;
      p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);
      k=smoothstep(0.,k,sin(f.x+f.y)*0.01);
      return k*w;
    }
    out vec4 vFragColor;
    void main(void){
      vec2 resolution = czm_viewport.zw;
      vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
      vec3 finalColor=vec3(0);
      float c = 0.0;
      c+=snow(uv,50.)*.0;
      c+=snow(uv,30.)*.0;
      c+=snow(uv,10.)*.0;
      c+=snow(uv,5.);
      c+=snow(uv,4.);
      c+=snow(uv,3.);
      c+=snow(uv,2.);
      finalColor=(vec3(c));
      vFragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3);
    }`;
  let postProcessStage = new Cesium.PostProcessStage({
    //片源着色器
    fragmentShader: fragmentShaderSource,
    uniforms: {
      rainSpeed: 70, //雪速度
    },
  });
  viewer.scene.postProcessStages.add(postProcessStage);
}
export function addWater(viewer: Cesium.Viewer) {
  const rectangle = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(95.0, 39.0, 100.0, 42.0),
        height: 3500.0,
      }),
      id: {
        name: "rectangle",
        type: "rectangle",
      },
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      material: new Cesium.Material({
        fabric: {
          type: "Water", //材质类型
          uniforms: {
            baseWaterColor: new Cesium.Color(0.2, 0.3, 0.5, 0.5), //基础颜色
            normalMap: "../../../src/assets/imgs/water.jpg", //法线纹理贴图
            frequency: 100.0, //水波纹的数量
            animationSpeed: 0.01, //水波纹的振动速度
            amplitude: 10.0, //水波纹的振幅大小
          },
        },
      }),
    }),
  });
  viewer.scene.primitives.add(rectangle);
  //相机视角
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(97.0, 40.0, 6000),
  });
}
export function addRadar(viewer: Cesium.Viewer) {
  // viewer.scene.globe.depthTestAgainstTerrain = true;
  let rotation = 0; //纹理旋转角度
  let amount = 8; //旋转变化量
  let radar = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(114.40372, 30.52252),
    ellipse: {
      semiMajorAxis: 300.0,
      semiMinorAxis: 300.0,
      classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles,此处设置贴地扫描
      //指定材质
      material: new Cesium.ImageMaterialProperty({
        image: "../../../src/assets/imgs/radar.png",
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      }),
      //外边框
      // height: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
      //纹理旋转角度通过 CallbackProperty 回调
      stRotation: new Cesium.CallbackProperty(function () {
        rotation += amount;
        if (rotation >= 360 || rotation <= -360) {
          rotation = 0;
        }
        //将角度转换为弧度
        return Cesium.Math.toRadians(rotation);
      }, false),
    },
  });
  viewer.entities.add(radar);
  //添加点
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(114.40372, 30.52252),
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(114.40372, 30.52252, 2000),
  });
}
// 自定义材质
export default class DynamicWallMaterialProperty {
  name: string
  img: string
 
  definitionChanged = new Cesium.Event()
  isConstant = false
 
  constructor(name: string = 'DynamicWall') {
    this.name = name
    this.img = '../../../src/assets/imgs/wall.jpg'
    ;(Cesium.Material as any)._materialCache.addMaterial(
      'DynamicWallMaterialProperty',
      {
        fabric: {
          type: 'DynamicWallMaterialProperty',
          uniforms: {
            img: this.img
          },
          source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          // 生成默认的基础材质
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;
          // 定义动画持续时间,从0到1
          float durationTime = 2.0;
          // 获取当前帧数,fract(x) 返回x的小数部分
          float time = fract(czm_frameNumber / (60.0 * durationTime));
          // 根据uv采样颜色
          vec4 color = texture2D(img,vec2(fract(st.s - time),st.t));
          material.alpha = color.a;
          material.diffuse = color.rgb;
          return material;
        }
        `
        }
      }
    )
  }
  getType() {
    return 'DynamicWallMaterialProperty'
  }
  getValue(result: { [key: string]: number }) {
    return result
  }
  equals(other: Cesium.Property): boolean {
    // 判断两个材质是否相等
    return (
      other instanceof DynamicWallMaterialProperty && this.name === other.name
    )
  }
}
// 加墙
interface wallType {
  coordinates: number[];
  color?: string;
}
export function addWall(options: wallType) {
  const wall = {
    id: "wall",
    name: "墙",
    show: true,
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(options.coordinates),
      material: new DynamicWallMaterialProperty(),
      // 设置贴地，另外Cesium.ClassificationType.TERRAIN表示仅贴合地形
      classificationType: Cesium.ClassificationType.BOTH, //既可以贴合地形也可以贴合 3D Tiles
    },
  };
  return wall;
}