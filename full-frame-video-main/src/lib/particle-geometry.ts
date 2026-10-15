import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Scene colors are populated from the global design tokens after hydration.
export const scenePalette = { white: '', silver: '', visor: '', warm: '', floor: '', mist: '' };
export type MaterialStyle = 'glass' | 'frost' | 'ceramic' | 'wire';
export type EnvironmentStyle = 'studio' | 'mist' | 'alpine';
type Part = { size: [number, number, number]; center: [number, number, number]; radius: number; rotation?: number; shape?: 'joint' | 'capsule'; shade?: number };

const parts: Part[] = [
  {size:[1.94,1.18,1.13],center:[0,3.38,0],radius:.36,rotation:-.10},
  {size:[1.48,.53,.07],center:[-.015,3.37,.567],radius:.20,rotation:-.10,shade:.38},
  {size:[.82,.93,.66],center:[0,2.25,0],radius:.26},
  {size:[.69,.70,.08],center:[0,2.29,.34],radius:.18},
  {size:[.66,.36,.52],center:[0,1.66,0],radius:.17},
  {size:[.21,.24,.21],center:[0,2.87,0],radius:.07,shape:'capsule'},
  {size:[.16,.20,.16],center:[0,4.04,0],radius:.08,shape:'joint'},
];
for (const side of [-1,1]) {
  parts.push(
    {size:[.35,.35,.37],center:[side*.54,2.53,0],radius:.15,shape:'joint'},
    {size:[.24,.49,.25],center:[side*.66,2.25,0],radius:.10,shape:'capsule',rotation:side*.42},
    {size:[.25,.25,.27],center:[side*.77,2.01,0],radius:.12,shape:'joint'},
    {size:[.40,.49,.43],center:[side*.88,1.80,.045],radius:.16,rotation:side*.40},
    {size:[.39,.34,.34],center:[side*1.01,1.49,.085],radius:.14,rotation:side*.22},
    {size:[.18,.27,.20],center:[side*.81,1.37,.19],radius:.085,shape:'capsule',rotation:-side*.40},
    {size:[.30,.30,.33],center:[side*.27,1.58,0],radius:.13,shape:'joint'},
    {size:[.25,.52,.27],center:[side*.29,1.26,0],radius:.11,shape:'capsule'},
    {size:[.31,.29,.33],center:[side*.30,.98,.015],radius:.13,shape:'joint'},
    {size:[.35,.38,.39],center:[side*.31,.77,.03],radius:.14},
    {size:[.56,.29,.73],center:[side*.33,.475,.16],radius:.14},
    {size:[.18,.18,.17],center:[side*.66,3.99,0],radius:.08,shape:'joint'},
    {size:[.15,.46,.55],center:[side*.96,3.42,0],radius:.075,rotation:-.10},
  );
  for (let finger=0;finger<3;finger++) parts.push({size:[.115,.25,.14],center:[side*(.95+finger*.13),1.25,.12],radius:.055,shape:'capsule',rotation:side*.17});
}

function partGeometry(part: Part) {
  let geo: THREE.BufferGeometry;
  if(part.shape==='joint') {
    geo=new THREE.SphereGeometry(1,16,12);geo.scale(part.size[0]/2,part.size[1]/2,part.size[2]/2);
  } else if(part.shape==='capsule') {
    const radius=part.size[0]/2;
    geo=new THREE.CapsuleGeometry(radius,Math.max(.01,part.size[1]-radius*2),4,12);
    geo.scale(1,1,part.size[2]/part.size[0]);
  } else geo=new RoundedBoxGeometry(...part.size,3,part.radius);
  if(part.rotation) geo.rotateZ(part.rotation);
  geo.translate(...part.center);
  return geo.index?geo.toNonIndexed():geo;
}

export function makeRobotGeometry(budget=52000) {
  let seed=51;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const positions:number[]=[],colors:number[]=[],normals:number[]=[],seeds:number[]=[],cloud:number[]=[];
  const meshes=parts.map(part=>new THREE.Mesh(partGeometry(part)));
  const areas=parts.map(({size})=>2*(size[0]*size[1]+size[1]*size[2]+size[0]*size[2]));
  const total=areas.reduce((sum,v)=>sum+v,0);
  const point=new THREE.Vector3(),normal=new THREE.Vector3();
  meshes.forEach((mesh,index)=>{
    const part=parts[index];if(!part)return;
    const sampler=new MeshSurfaceSampler(mesh);
    // Three's runtime sampler supports this, although older declaration files do not.
    if('setRandomGenerator' in sampler && typeof (sampler as any).setRandomGenerator==='function')(sampler as any).setRandomGenerator(random);
    sampler.build();
    const count=Math.round(budget*(areas[index]??0)/total);
    for(let i=0;i<count;i++) {
      sampler.sample(point,normal);
      point.addScaledVector(normal,.006+random()*.010);
      positions.push(point.x,point.y,point.z);normals.push(normal.x,normal.y,normal.z);
      const shade=(part.shade??.90)*(.85+random()*.15);
      colors.push(shade*.94,shade*.98,shade);seeds.push(random());
      // Cloud follows each particle's original height rather than replacing the silhouette with a sphere.
      const angle=random()*Math.PI*2,r=.45+random()*1.15;
      cloud.push(Math.cos(angle)*r,THREE.MathUtils.clamp(point.y+(random()-.5)*1.1,.43,4.32),Math.sin(angle)*r);
    }
    const position=mesh.geometry.getAttribute('position');
    const surfaceColors=new Float32Array(position.count*3);
    const shade=part.shade??1;
    for(let i=0;i<position.count;i++)surfaceColors.set([shade*.94,shade*.98,shade],i*3);
    mesh.geometry.setAttribute('color',new THREE.BufferAttribute(surfaceColors,3));
  });
  const surface=mergeGeometries(meshes.map(mesh=>mesh.geometry));
  if(!surface)throw new Error('Robot surface could not be assembled');
  meshes.forEach(mesh=>mesh.geometry.dispose());
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('aNormal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('aSeed',new THREE.Float32BufferAttribute(seeds,1));
  geometry.setAttribute('aCloud',new THREE.Float32BufferAttribute(cloud,3));
  // A sparse local network ties neighboring surface particles together, never across limbs.
  const buckets=new Map<string,number[]>(),links:number[]=[],cell=.095;
  const key=(x:number,y:number,z:number)=>`${x},${y},${z}`;
  for(let i=0;i<seeds.length;i+=8) {
    const x=positions[i*3]??0,y=positions[i*3+1]??0,z=positions[i*3+2]??0;
    const cx=Math.floor(x/cell),cy=Math.floor(y/cell),cz=Math.floor(z/cell);
    let connected=0;
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++) {
      for(const j of buckets.get(key(cx+dx,cy+dy,cz+dz))??[]) {
        const distance=Math.hypot(x-(positions[j*3]??0),y-(positions[j*3+1]??0),z-(positions[j*3+2]??0));
        if(distance<.105&&distance>.018&&connected<3){links.push(i,j);connected++;}
      }
    }
    const bucketKey=key(cx,cy,cz);const bucket=buckets.get(bucketKey)??[];bucket.push(i);buckets.set(bucketKey,bucket);
  }
  const network=new THREE.BufferGeometry();
  for(const name of ['position','color','aNormal','aSeed','aCloud']) {
    const attribute=geometry.getAttribute(name),array:number[]=[];
    for(const index of links)for(let c=0;c<attribute.itemSize;c++)array.push(attribute.array[index*attribute.itemSize+c]??0);
    network.setAttribute(name,new THREE.Float32BufferAttribute(array,attribute.itemSize));
  }
  geometry.computeBoundingSphere();network.computeBoundingSphere();
  return {geometry,surface,network};
}

export function makeChamberNetwork() {
  const lines:number[]=[],points:number[]=[];
  for(let row=0;row<25;row++)for(let col=0;col<48;col++) {
    const angle=col/48*Math.PI*2+(row%2)*Math.PI/48;
    const x=Math.cos(angle)*1.79,z=Math.sin(angle)*1.79,y=.36+row*.174;
    points.push(x,y,z);
    if(row<24)for(const sign of [-1,1]) {
      const nextAngle=angle+sign*Math.PI/48;
      lines.push(x,y,z,Math.cos(nextAngle)*1.79,y+.174,Math.sin(nextAngle)*1.79);
    }
  }
  const lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
  const pointGeo=new THREE.BufferGeometry();pointGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  return {lineGeo,pointGeo};
}
