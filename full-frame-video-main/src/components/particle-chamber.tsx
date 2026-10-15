import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, RoundedBox, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import alpine from '@/assets/alpine.jpg';
import { makeChamberNetwork, makeRobotGeometry, scenePalette as p, type MaterialStyle, type EnvironmentStyle } from '@/lib/particle-geometry';

export interface ChamberProps {
  material: MaterialStyle;
  environment: EnvironmentStyle;
  exploded: boolean;
  rotating: boolean;
  resetKey: number;
}

const particleVertex = `
attribute float aSeed; attribute vec3 aCloud; attribute vec3 aNormal;
uniform float uTime; uniform float uSpread; uniform float uSize;
varying vec3 vColor; varying float vSeed; varying vec3 vNormal; varying float vRelease;
void main(){
 vColor=color; vSeed=aSeed; vNormal=normalize(normalMatrix*aNormal);
 float release=smoothstep(aSeed*.22,aSeed*.22+.78,uSpread); vRelease=release;
 vec3 pos=mix(position,aCloud,release);
 float arc=sin(release*3.14159265);
 pos+=vec3(sin(aSeed*41.+uTime*.38),cos(aSeed*27.+uTime*.30)*.45,cos(aSeed*41.+uTime*.38))*arc*.22;
 pos+=aNormal*sin(uTime*.65+aSeed*30.)*.003;
 vec4 mv=modelViewMatrix*vec4(pos,1.);
 gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp(uSize*(.6+aSeed*.8)/(-mv.z),1.,6.);
}`;
const particleFragment = `
varying vec3 vColor; varying float vSeed; varying vec3 vNormal; varying float vRelease;
uniform vec4 uWeights; uniform vec3 uWhite; uniform vec3 uSilver; uniform vec3 uWarm;
void main(){
 vec2 xy=gl_PointCoord*2.-1.; float r=dot(xy,xy); if(r>.96)discard;
 float coverage=uWeights.x*.045+uWeights.y*.48+uWeights.z*.004+uWeights.w*.70;
 if(vSeed>mix(coverage,1.,vRelease))discard;
 vec3 n=normalize(vec3(xy,sqrt(1.-r)));
 float diffuse=max(dot(n,normalize(vec3(-.5,.7,1.))),0.);
 float surfaceLight=max(dot(vNormal,normalize(vec3(-.5,.7,1.))),0.);
 float spec=pow(max(dot(n,normalize(vec3(-.45,.55,1.))),0.),24.);
 vec3 frost=vColor*(.65+.22*surfaceLight+.10*diffuse)+uWhite*spec*.5;
 vec3 glass=mix(uSilver*.5,uWhite,diffuse*.75)+uWhite*spec*.9;
 vec3 wire=mix(uSilver*.65,uWhite,diffuse*.8)+uWhite*spec*.3;
 vec3 col=glass*uWeights.x+frost*uWeights.y+frost*uWeights.z+wire*uWeights.w;
 if(vSeed>.987)col=mix(col,uWarm,.42+vRelease*.4);
 float alpha=(uWeights.x*.68+uWeights.y*.94+uWeights.z*.88+uWeights.w*.90)* (1.-smoothstep(.72,.96,r));
 gl_FragColor=vec4(col,alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
const networkFragment = `
uniform vec4 uWeights; uniform vec3 uWhite; uniform vec3 uSilver;
varying float vRelease;
void main(){
 float alpha=(uWeights.y*.13+uWeights.w*.40)*(1.-vRelease);
 gl_FragColor=vec4(mix(uSilver,uWhite,.55),alpha);
 #include <colorspace_fragment>
}`;

function ParticleRobot({material,exploded,rotating,resetKey}:ChamberProps) {
  const group=useRef<THREE.Group>(null);
  const body=useRef<THREE.Mesh>(null);
  const physical=useRef<THREE.MeshPhysicalMaterial>(null);
  const particles=useRef<THREE.ShaderMaterial>(null);
  const filaments=useRef<THREE.ShaderMaterial>(null);
  const {size,gl}=useThree();
  const budget=size.width<600?32000:62000;
  const {geometry,surface,network}=useMemo(()=>makeRobotGeometry(budget),[budget]);
  const uniforms=useMemo(()=>({uTime:{value:0},uSpread:{value:0},uSize:{value:25},uWeights:{value:new THREE.Vector4(0,1,0,0)},uWhite:{value:new THREE.Color(p.white || '#ffffff')},uSilver:{value:new THREE.Color(p.silver || '#cccccc')},uWarm:{value:new THREE.Color(p.warm || '#ffeedd')}}),[]);
  const transition=useRef(0);
  const previous=useRef(material);
  const reduced=useRef(false);
  useEffect(()=>{reduced.current=window.matchMedia('(prefers-reduced-motion: reduce)').matches;},[]);
  useEffect(()=>{if(previous.current!==material){transition.current=1;previous.current=material;}},[material]);
  useEffect(()=>{if(group.current)group.current.rotation.y=0;transition.current=0;uniforms.uSpread.value=0;},[resetKey,uniforms]);
  useEffect(()=>()=>{geometry.dispose();surface.dispose();network.dispose();},[geometry,surface,network]);
  const weights=useMemo(()=>new THREE.Vector4(),[]);
  useFrame((_,rawDelta)=>{
    const dt=Math.min(rawDelta,.05);
    uniforms.uTime.value+=reduced.current?0:dt;
    transition.current=Math.max(0,transition.current-dt*.65);
    const target=exploded?1:0;
    uniforms.uSpread.value=THREE.MathUtils.damp(uniforms.uSpread.value,target,reduced.current?35:3.4,dt);
    weights.set(material==='glass'?1:0,material==='frost'?1:0,material==='ceramic'?1:0,material==='wire'?1:0);
    uniforms.uWeights.value.lerp(weights,1-Math.exp(-5*dt));
    const w=uniforms.uWeights.value;
    uniforms.uSize.value=Math.min(size.height*.032,28)*gl.getPixelRatio();
    if(physical.current&&body.current){
      const m=physical.current;
      m.opacity=(w.x*.86+w.y*.78+w.z)*(1.-uniforms.uSpread.value);
      m.roughness=w.x*.045+w.y*.38+w.z*.32+w.w*.3;
      m.metalness=w.x*.18+w.y*.08;
      m.transmission=w.x*.80+w.y*.27;
      m.thickness=.28;m.ior=1.46;m.iridescence=w.x*.34;
      body.current.visible=m.opacity>.008;
    }
    // R3F copies scalar uniform containers; write to each mounted shader, not just the source object.
    for(const shader of [particles.current,filaments.current]){
      if(!shader)continue;
      for(const name of ['uTime','uSpread','uSize'] as const){
        const live=shader.uniforms[name];if(live)live.value=uniforms[name].value;
      }
    }
    if(group.current&&rotating&&!reduced.current)group.current.rotation.y+=dt*.23;
  });
  return <group ref={group}>
    <mesh ref={body} geometry={surface} renderOrder={1}>
      <meshPhysicalMaterial ref={physical} vertexColors transparent depthWrite={false} color={p.white || '#ffffff'} clearcoat={1} clearcoatRoughness={.10} envMapIntensity={1.3}/>
    </mesh>
    <lineSegments geometry={network} frustumCulled={false} renderOrder={2}>
      <shaderMaterial ref={filaments} vertexColors uniforms={uniforms} vertexShader={particleVertex} fragmentShader={networkFragment} transparent depthWrite={false}/>
    </lineSegments>
    <points geometry={geometry} frustumCulled={false} renderOrder={3}>
      <shaderMaterial ref={particles} vertexColors uniforms={uniforms} vertexShader={particleVertex} fragmentShader={particleFragment} transparent depthWrite alphaTest={.25} toneMapped={false}/>
    </points>
  </group>;
}

function Chamber() {
  const {lineGeo,pointGeo}=useMemo(makeChamberNetwork,[]);
  useEffect(()=>()=>{lineGeo.dispose();pointGeo.dispose();},[lineGeo,pointGeo]);
  return <group>
    <mesh position={[0,2.45,0]}>
      <cylinderGeometry args={[1.8,1.8,4.3,96,1,true]}/>
      <meshPhysicalMaterial color={p.white || '#ffffff'} metalness={.15} roughness={.03} transparent opacity={.065} side={THREE.DoubleSide} depthWrite={false} clearcoat={1}/>
    </mesh>
    <lineSegments geometry={lineGeo}><lineBasicMaterial color={p.white || '#ffffff'} transparent opacity={.075}/></lineSegments>
    <points geometry={pointGeo}><pointsMaterial color={p.white || '#ffffff'} size={.014} transparent opacity={.35} sizeAttenuation depthWrite={false}/></points>
    {[-1,1].map(side=><mesh key={side} position={[side*1.785,2.45,.04]}><cylinderGeometry args={[.016,.016,4.22,8]}/><meshPhysicalMaterial color={p.white || '#ffffff'} roughness={.08} metalness={.4} transparent opacity={.6}/></mesh>)}
    {[.30,4.60].map((y,i)=><group key={y} position-y={y}>
      <mesh rotation-x={Math.PI/2}><torusGeometry args={[1.8,.047,12,100]}/><meshPhysicalMaterial color={p.white || '#ffffff'} metalness={.25} roughness={.13} clearcoat={1}/></mesh>
      <mesh rotation-x={Math.PI/2} position-y={.036}><torusGeometry args={[1.78,.018,8,100]}/><meshStandardMaterial color={p.white || '#ffffff'} emissive={p.white || '#ffffff'} emissiveIntensity={1.3}/></mesh>
      {i===1&&<>
        <mesh><cylinderGeometry args={[1.85,1.85,.12,96,1,true]}/><meshPhysicalMaterial color={p.white || '#ffffff'} metalness={.55} roughness={.13} side={THREE.DoubleSide}/></mesh>
        <mesh rotation-x={Math.PI/2} position-y={.08}><torusGeometry args={[1.85,.017,8,100]}/><meshBasicMaterial color={p.white || '#ffffff'}/></mesh>
        <mesh rotation-x={Math.PI/2} position-y={-.13}><torusGeometry args={[1.73,.022,8,100]}/><meshBasicMaterial color={p.white || '#ffffff'}/></mesh>
      </>}
    </group>)}
    <mesh position-y={.18} receiveShadow><cylinderGeometry args={[2.13,2.13,.20,100]}/><meshPhysicalMaterial color={p.white || '#ffffff'} metalness={.3} roughness={.2} clearcoat={1}/></mesh>
    <mesh position-y={.295}><cylinderGeometry args={[2.04,2.04,.035,100]}/><meshPhysicalMaterial color={p.white || '#ffffff'} metalness={.4} roughness={.16}/></mesh>
    {[1.68,1.95,2.10].map((r,i)=><mesh key={r} position-y={.323} rotation-x={Math.PI/2}><torusGeometry args={[r,i===0?.016:.008,8,100]}/><meshStandardMaterial color={p.white || '#ffffff'} emissive={p.white || '#ffffff'} emissiveIntensity={1}/></mesh>)}
    <mesh position-y={.04} rotation-x={-Math.PI/2}><circleGeometry args={[2.8,80]}/><meshBasicMaterial color={p.visor || '#555555'} transparent opacity={.05} depthWrite={false}/></mesh>
  </group>;
}

function Room({environment}:{environment:EnvironmentStyle}) {
  const noise=useMemo(()=>{
    const data=new Uint8Array(64*64*4);
    for(let i=0;i<64*64;i++){const v=220+(i*13%23);data.set([v,v,v,255],i*4);}
    const tex=new THREE.DataTexture(data,64,64);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(12,12);tex.needsUpdate=true;return tex;
  },[]);
  useEffect(()=>()=>noise.dispose(),[noise]);
  const envColor = environment === 'studio' ? (p.floor || '#e8eaed') : (p.mist || '#d0d7de');
  return <>
    <color attach="background" args={[envColor]}/>
    <fog attach="fog" args={[envColor,16,50]}/>
    <mesh rotation-x={-Math.PI/2} position-y={-.09} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color={p.floor || '#e8eaed'} roughness={.3} metalness={.25} roughnessMap={noise}/></mesh>
    {environment==='studio'?<group>
      {[-16,-12,-8,-4,4,8,12,16].map(x=><RoundedBox key={x} args={[.65,14,1.2]} radius={.2} position={[x,5,-12]} rotation-z={-.18}><meshStandardMaterial color={p.white || '#ffffff'} roughness={.6} metalness={0}/></RoundedBox>)}
      <mesh position={[0,3,-12]}><planeGeometry args={[140,35]}/><meshStandardMaterial color={p.floor || '#e8eaed'} roughness={.7}/></mesh>
      {[4,7,10,14].map(r=><mesh key={r} position-y={-.065} rotation-x={Math.PI/2}><torusGeometry args={[r,.012,5,120]}/><meshBasicMaterial color={p.white || '#ffffff'} transparent opacity={.4}/></mesh>)}
    </group>:<Suspense fallback={null}><Landscape mist={environment==='mist'}/></Suspense>}
  </>;
}
function Landscape({mist}:{mist:boolean}) {
  const texture=useTexture(alpine);
  return <mesh position={[0,6,-12]}><planeGeometry args={[70,35]}/><meshBasicMaterial map={texture} color={mist?(p.mist || '#d0d7de'):(p.white || '#ffffff')} fog={false}/></mesh>;
}
function CameraRig({resetKey}:{resetKey:number}) {
  const {camera,size}=useThree();
  useEffect(()=>{
    const narrow=size.width<900;
    camera.position.set(narrow?3.3:3.6, narrow?3.3:3.4, narrow?13:11.6);
    camera.lookAt(0,2.15,0);
    camera.updateProjectionMatrix();
  },[camera,size.width,resetKey]);
  return null;
}

export function ParticleChamber(props:ChamberProps) {
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const css=getComputedStyle(document.documentElement);
    const tokens={white:'--chamber-white',silver:'--chamber-silver',visor:'--chamber-visor',warm:'--chamber-warm',floor:'--chamber-floor',mist:'--chamber-mist'} as const;
    // Resolve CSS color spaces through the browser before handing sRGB colors to Three.
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
    const context=canvas.getContext('2d');if(!context)return;
    for(const key of Object.keys(tokens) as (keyof typeof tokens)[]){
      context.clearRect(0,0,1,1);
      const val = css.getPropertyValue(tokens[key]).trim();
      if (val) {
        context.fillStyle = val;
        context.fillRect(0,0,1,1);
        const pixel=context.getImageData(0,0,1,1).data;
        p[key]=`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
      } else {
        const fallbacks: Record<string, string> = {
          white: 'rgb(250,250,252)',
          silver: 'rgb(200,205,212)',
          visor: 'rgb(80,85,95)',
          warm: 'rgb(245,230,220)',
          floor: 'rgb(235,238,242)',
          mist: 'rgb(215,222,230)',
        };
        p[key] = fallbacks[key] || 'rgb(240,240,240)';
      }
    }
    setReady(true);
  },[]);
  if(!ready)return null;
  return <div className="scene-layer" aria-label="Interactive particle robot in a cylindrical glass chamber" data-material={props.material} data-exploded={props.exploded} data-particle-count="62000" data-eyes="none">
    <Canvas dpr={[1,1.5]} camera={{position:[5.4,3.8,10.5],fov:33}} gl={{antialias:true,alpha:false}} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <CameraRig resetKey={props.resetKey}/>
      <ambientLight intensity={1.1}/>
      <directionalLight position={[-4,8,5]} intensity={2.6} color={p.white || '#ffffff'}/>
      <directionalLight position={[4,4,-2]} intensity={1.2} color={p.silver || '#cccccc'}/>
      <Environment resolution={128}>
        <Lightformer intensity={3} position={[-5,5,0]} rotation-y={Math.PI/2} scale={[8,12,1]} color={p.white || '#ffffff'}/>
        <Lightformer intensity={2} position={[5,4,2]} rotation-y={-Math.PI/2} scale={[4,12,1]} color={p.silver || '#cccccc'}/>
        <Lightformer intensity={2} position={[0,8,0]} rotation-x={Math.PI/2} scale={[10,10,1]} color={p.white || '#ffffff'}/>
      </Environment>
      <Room environment={props.environment}/>
      <Chamber/>
      <ParticleRobot {...props}/>
      <OrbitControls key={props.resetKey} target={[0,2.15,0]} enablePan={false} minDistance={8} maxDistance={16} minPolarAngle={Math.PI*.35} maxPolarAngle={Math.PI*.52} enableDamping dampingFactor={.05}/>
    </Canvas>
  </div>;
}
