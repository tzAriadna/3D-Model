<template>
  <div>
  </div>
 
</template>

<script>
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GPUStatsPanel } from 'three/addons/utils/GPUStatsPanel.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { InteractionManager } from 'three.interactive';

import { list_edge } from './Edge.js';

let line, renderer, scene, camera, sceneRTT, cameraRTT, controls, controls2;
let stats, gpuPanel;
let insetWidth;
let insetHeight;
let textMesh;
let size = 1;
let text = 'three.js';
let flagClick = 'false';
const materials = [];
const edgeObjects = [];
const textObjects = [ ];
const textGeos = [ ];

 

export default {
  name: 'HelloWorld',
  data() {
    return {
    };
  },
  mounted() {
    this.drawTunnel();
  },

  methods: {
    drawTunnel() {
      init();
			animate();

			function init() {

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setClearColor( 0x000000 );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );
				scene = new THREE.Scene();
        sceneRTT = new THREE.Scene();
				camera = new THREE.PerspectiveCamera( 400, window.innerWidth / window.innerHeight, 1, 1000000 );
        cameraRTT = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 100000 );
        camera.position.set(7000, 2000, 5000);
        camera.lookAt(scene.position);
        cameraRTT.position.set(1000, 2000, 5000);
        cameraRTT.lookAt(sceneRTT.position);

        const interactionManager = new InteractionManager(
          renderer,
          camera,
          renderer.domElement
        );

				controls = new OrbitControls( camera, renderer.domElement );
        controls2 = new OrbitControls( cameraRTT, renderer.domElement );
				controls.minDistance = 10;
        controls2.minDistance = 10;
				controls.maxDistance = 1000000;
        controls.panSpeed = 0.6;
        controls.rotateSpeed = 0.1;
        controls.zoomSpeed = 0.5;


				// Position and THREE.Color Data
				const positions = [];
				const colors = [];
        const color_green = [];
        const color_hover = [];
        const color = new THREE.Color();
        for ( let i = 0, l = 10; i < l; i ++ ) {
					const t = i / l;
					color.setHSL( t, 1.0, 0.5 );
          colors.push( 0, 191, 255 );
          color_green.push( 0, 128, 0 );
          color_hover.push(95, 133, 117);
				}

        //оси координат
        function lineX() {  //синяя
          const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
          const points = [];
          points.push( new THREE.Vector3( -5000, 0, 0 ) );
          points.push( new THREE.Vector3( 10000, 0, 0 ) );
          const geometry = new THREE.BufferGeometry().setFromPoints( points );
          const line = new THREE.Line( geometry, material );
          scene.add( line );
        } 
        function lineY() { //красная
          const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
          const points = [];
          points.push( new THREE.Vector3( 0, 10000, 0 ) );
          points.push( new THREE.Vector3( 0, -10000, 0 ) );
          const geometry = new THREE.BufferGeometry().setFromPoints( points );
          const line = new THREE.Line( geometry, material );
          scene.add( line );
        }
        function lineZ() { //желтая
          const material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
          const points = [];
          points.push( new THREE.Vector3( 0, 0, 10000 ) );
          points.push( new THREE.Vector3( 0, 0, -5000 ) );
          const geometry = new THREE.BufferGeometry().setFromPoints( points );
          const line = new THREE.Line( geometry, material );
          scene.add( line );
        }
        lineX();
        lineY();
        lineZ();

        console.log(list_edge);

        //освещение текста с 2х сторон и материал
				const pointLight = new THREE.PointLight( 0xffffff, 15 );
				pointLight.color.setHSL( 0, 191, 255 );
				pointLight.position.set( 70000, 20000, 50000 );
				scene.add( pointLight );
        const pointLight2 = new THREE.PointLight( 0xffffff, 15 );
				pointLight2.color.setHSL( 0, 191, 255 );
				pointLight2.position.set( -70000, -20000, -50000 );
				scene.add( pointLight2 );
        

        //функция отображения надписей
        var vectorCenter = new THREE.Vector3(0,0,0);
        function drawText3(edge) {
         
          var loader = new  FontLoader();
          loader.load( 'https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json', 
          function ( font ) {
            var valVec = createVectors(edge);

            //создание текста
            text = edge.name;
            var dist_ab = valVec.vectorA.distanceTo(valVec.vectorB);
            size = dist_ab * 0.03;
            // if (number == 72) {size = dist_ab * 0.5;}
            textGeos.push(new TextGeometry( text, {
              font: font,
              size: size,
              height: 0.1,
              curveSegments: 1,
            })); 
            
            //материал и отображение надписи в пространстве 
            const vectorQ = calcShift(valVec.vectorA, valVec.vectorB, valVec.vectorCenter, dist_ab, edge.id-1);
            var textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xff0000 });
            textMesh = new THREE.Mesh( textGeos[edge.id-1], textMaterial );
            textMesh.name = "n-"+edge.id-1;
            textObjects.push(textMesh);

            scene.add( textMesh );
            textMesh.position.set(vectorQ.x, vectorQ.y, vectorQ.z);

            //положение, поворот, наклон надписей
            var valRot = calcRotate(valVec.vectorA, valVec.vectorB, edge.id, 'false')
            textMesh.rotation.set(valRot.rot_x, valRot.rot_y, valRot.rot_z);      
          }); 
        }


        function createVectors(edge) {
          var vectorA = new THREE.Vector3(edge.pointA.x, edge.pointA.y, edge.pointA.z);
          var vectorB = new THREE.Vector3(edge.pointB.x, edge.pointB.y, edge.pointB.z);
          //направление вектора должно быть слева направо
          if (vectorA.z < vectorB.z && (edge.id !== 52)) {
            var vec1 = vectorA;
            vectorA = vectorB;
            vectorB = vec1;
          }
          vectorCenter.x = vectorA.x-(vectorA.x-vectorB.x)/2;
          vectorCenter.y = vectorA.y-(vectorA.y-vectorB.y)/2;
          vectorCenter.z = vectorA.z-(vectorA.z-vectorB.z)/2;
          const arr = {
            vectorA: vectorA,
            vectorB: vectorB,
            vectorCenter: vectorCenter,
          }
          return arr
        }

        function calcShift (vectorA, vectorB, vectorCenter, dist_ab, id) {
          //центрирование надписи. вычисление сдвига текста
          textGeos[id].computeBoundingBox();
          var textWidth = textGeos[id].boundingBox.max.x - textGeos[id].boundingBox.min.x;
          var param = dist_ab / textWidth;
          var vectorQ = new THREE.Vector3(vectorCenter.x+(vectorA.x-vectorB.x)/(2*param), vectorCenter.y+(vectorA.y-vectorB.y)/(2*param), vectorCenter.z+(vectorA.z-vectorB.z)/(2*param));
          return vectorQ
        }
        function calcRotate (vectorA, vectorB, id, angle) {
          //создание векторов для треугольника и вычисление их сторон
          var dist_ab = vectorA.distanceTo(vectorB);
          
          var vectorG = new THREE.Vector3(vectorB.x, vectorA.y, vectorB.z);
          var dist_ag = vectorA.distanceTo(vectorG);
          var vectorC = new THREE.Vector3(vectorA.x+dist_ag, vectorA.y, vectorA.z);
          var dist_ac = vectorA.distanceTo(vectorC);
          var dist_cg = vectorC.distanceTo(vectorG);
          var dist_bg = vectorB.distanceTo(vectorG);
          var vectorS = new THREE.Vector3(0,0,0);
          if ((vectorA.y - vectorB.y) > 20) {
            vectorS = new THREE.Vector3(vectorB.x, vectorG.y+12, vectorB.z);
          } else {
            vectorS = new THREE.Vector3(vectorB.x, vectorG.y+(vectorB.y-vectorG.y)*3/10-7, vectorB.z);
          }
          var dist_as = vectorA.distanceTo(vectorS);
          var dist_bs = vectorB.distanceTo(vectorS);
          // var dist_lg = vectorL.distanceTo(vectorG);
          
          // var dist_cb = vectorC.distanceTo(vectorB);

          // vectorCenter.x = vectorA.x-(vectorA.x-vectorB.x)/32;
          // vectorCenter.y = vectorA.y-(vectorA.y-vectorB.y)/1.8;
          // vectorCenter.z = vectorA.z-(vectorA.z-vectorB.z)/1.8;

          // var dist_cenk = vectorCenter.distanceTo(vectorK);
          // var dist_cenl = vectorCenter.distanceTo(vectorL);
          // var dist_lk = vectorL.distanceTo(vectorK);
          // var dist_ak = vectorA.distanceTo(vectorK);
          // var dist_al = vectorA.distanceTo(vectorL);
          
          
          //Вычисление углов, поворот и наклон надписей
          var rot_x = 0;
          var rot_y = 0;
          var rot_z = 0; 
          

          let rot_CAG = Math.acos((Math.pow(dist_ac, 2) + Math.pow(dist_ag, 2) - Math.pow(dist_cg, 2)) / (2*dist_ac*dist_ag));
          let rot_BAG = Math.acos((Math.pow(dist_ab, 2) + Math.pow(dist_ag, 2) - Math.pow(dist_bg, 2)) / (2*dist_ab*dist_ag));
          let rot_ABG = Math.acos((Math.pow(dist_ab, 2) + Math.pow(dist_bg, 2) - Math.pow(dist_ag, 2)) / (2*dist_ab*dist_bg));
          let rot_BAS = Math.acos((Math.pow(dist_ab, 2) + Math.pow(dist_as, 2) - Math.pow(dist_bs, 2)) / (2*dist_ab*dist_as));
          // let rot_CBL = Math.acos((Math.pow(dist_cb, 2) + Math.pow(dist_bl, 2) - Math.pow(dist_cl, 2)) / (2*dist_cb*dist_bl));
          // let rot_LCG = Math.acos((Math.pow(dist_lg, 2) + Math.pow(dist_cg, 2) - Math.pow(dist_cl, 2)) / (2*dist_lg*dist_cg));
          // let rot_CGB = Math.acos((Math.pow(dist_cg, 2) + Math.pow(dist_bg, 2) - Math.pow(dist_cb, 2)) / (2*dist_cg*dist_bg));
          // let rot_BCG = Math.acos((Math.pow(dist_cg, 2) + Math.pow(dist_cb, 2) - Math.pow(dist_bg, 2)) / (2*dist_cg*dist_cb));
          // let rot_BAC = Math.acos((Math.pow(dist_ab, 2) + Math.pow(dist_ac, 2) - Math.pow(dist_cb, 2)) / (2*dist_ab*dist_ac));
          // var dist_bk = vectorB.distanceTo(vectorK);
          // var dist_gk = vectorG.distanceTo(vectorK);
          // let rot_BKG = Math.acos((Math.pow(dist_bk, 2) + Math.pow(dist_gk, 2) - Math.pow(dist_bg, 2)) / (2*dist_bk*dist_gk));
          // let rot_2 = Math.acos((Math.pow(dist_cenk, 2) + Math.pow(dist_cenl, 2) - Math.pow(dist_lk, 2)) / (2*dist_cenk*dist_cenl));
          // let rot_AKL = Math.acos((Math.pow(dist_ak, 2) + Math.pow(dist_lk, 2) - Math.pow(dist_al, 2)) / (2*dist_ak*dist_lk));
          // let rot_xx = Math.PI*0.5 + rot_BCG;
          
          if ((angle > 0.7) && rot_ABG > 0.7) {
            if (vectorA.y < vectorB.y) {
              rot_x = -(Math.PI*0.5-rot_BAS);
            } else if ((vectorA.y - vectorB.y) > 50){
              rot_x = -1.61
            } else {
              rot_x = -(Math.PI*0.5+rot_BAS);
            }

            rot_z = rot_CAG 
            rot_y = -rot_BAG;

          } else {
            rot_y = rot_CAG
            if ( vectorB.y > vectorG.y ) { rot_z = rot_BAG }
            else { rot_z = -rot_BAG }
            if ( id == 52 ) { rot_y = -rot_y }
          }

          const arr = {
            rot_x: rot_x,
            rot_y: rot_y,
            rot_z: rot_z,
            vectorG: vectorG
          }
          //линии для наглядности
            // if (id == 72 ) {
            //   console.log('rot_BAG - ' + rot_BAG);
            //   console.log('rot_BAS - ' + rot_BAS);
            //   drawLineAC(vectorA, vectorC);
            //   drawLineAG(vectorA, vectorG);
            //   drawLineCG(vectorC, vectorG);
            //   drawLineBG(vectorB, vectorG);  
            //   drawLineALL(vectorA, vectorL); 
            //   drawLineAS(vectorA, vectorS);
            // }
          return arr
        }
       

        // drawText3();
        // function drawLineAC(vector1, vector2) { //синяя
        //   const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        //   const points = [];
        //   points.push( vector1);
        //   points.push( vector2);
        //   const geometry = new THREE.BufferGeometry().setFromPoints( points );
        //   const line = new THREE.Line( geometry, material );
        //   scene.add( line );
        // }
        // function drawLineCG(vector1, vector2) { //белая
        //   const material = new THREE.LineBasicMaterial( { color: 0xf0fff0 } );
        //   const points = [];
        //   points.push( vector1);
        //   points.push( vector2);
        //   const geometry = new THREE.BufferGeometry().setFromPoints( points );
        //   const line = new THREE.Line( geometry, material );
        //   scene.add( line );
        // }
        // function drawLineBG(vector1, vector2) { //пурпурная
        //   const material = new THREE.LineBasicMaterial( { color: 0x9370db } );
        //   const points = [];
        //   points.push( vector1);
        //   points.push( vector2);
        //   const geometry = new THREE.BufferGeometry().setFromPoints( points );
        //   const line = new THREE.Line( geometry, material );
        //   scene.add( line );
        // }
        // function drawLineAG(vector1, vector2) { //оранжевый
        //   const material = new THREE.LineBasicMaterial( { color: 0xffa500 } );
        //   const points = [];
        //   points.push( vector1);
        //   points.push( vector2);
        //   const geometry = new THREE.BufferGeometry().setFromPoints( points );
        //   const line = new THREE.Line( geometry, material );
        //   scene.add( line ); 
        // }
        // function drawLineALL(vector1, vector2) { //оранжевый
        //   const material = new THREE.LineBasicMaterial( { color: 0xffa500 } );
        //   const points = [];
        //   points.push( vector1);
        //   points.push( vector2);
        //   const geometry = new THREE.BufferGeometry().setFromPoints( points );
        //   const line = new THREE.Line( geometry, material );
        //   scene.add( line ); 
        // }
        // function drawLineAS(vector1, vector2) { //
        //   const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        //   const points = [];
        //   points.push( vector1);
        //   points.push( vector2);
        //   const geometry = new THREE.BufferGeometry().setFromPoints( points );
        //   const line = new THREE.Line( geometry, material );
        //   scene.add( line ); 
        // }
        console.log('e');


// УЗЛЫ **********************************************************************************
        function drawLine(edge, matLine, geometry) {
          positions.length = 0;
          positions.push(edge.pointA.x, edge.pointA.y, edge.pointA.z);
          positions.push(edge.pointB.x, edge.pointB.y, edge.pointB.z); 
          geometry.setColors( colors );
          geometry.setPositions( positions );
          line = new Line2( geometry, matLine );
          scene.add( line );
          edgeObjects.push( line );
          // mergeLabels(edge);
          drawText3(edge);
        }

        const geometries = [];
        for ( let i = 0; i < list_edge.length; i++) {
          let matLine = new LineMaterial( {
            linewidth: .8, 
            vertexColors: true,
            dashed: false,
          } );
          materials.push(matLine);
          geometries.push(new LineGeometry());
          drawLine( list_edge[i], materials[i], geometries[i]);
        }

        //объединение надписей
        // function mergeLabels(edge) {
        //   var valVec = createVectors(edge);
          
        //   for (let i=0; i < nodeName.length; i++) {

        //     if (nodeName[number] == nodeName[i]) {
        //       const elem_a2 = pointA[i];
        //       const elem_b2 = pointB[i];
        //       var valVec2 = createVectors(elem_a2, elem_b2, number);
        //       if ( (valVec.vectorB.x == valVec2.vectorA.x) && (valVec.vectorB.y == valVec2.vectorA.y) && (valVec.vectorB.z == valVec2.vectorA.z) ) {
        //       }
        //     }
        //   }
        // }
        

				window.addEventListener( 'resize', onWindowResize );
				onWindowResize();
				stats = new Stats();
				document.body.appendChild( stats.dom );
				gpuPanel = new GPUStatsPanel( renderer.getContext() );
				stats.addPanel( gpuPanel );
				stats.showPanel( 0 );

//обработка событий*************************************************************************
        var vectorCamera = new THREE.Vector3(0,0,0);
        var vectorRO = new THREE.Vector3(0,0,0);

        //событие change
        let objIsRemove = 'false';
        controls.addEventListener('change', function () {
          for (let i = 0; i < textObjects.length; i++) {
            if ((camera.position.x < 8000) && (camera.position.y < 3500) && (camera.position.z < 7000)) {
              if (objIsRemove == 'true' ) {
                var obj = textObjects[i];
                scene.add(obj);
                if (i == textObjects.length) {
                  objIsRemove = 'false';
                }
              } 
              var valVec = createVectors(list_edge[i]);
              vectorCamera.x = camera.position.x; 
              vectorCamera.y = camera.position.y; 
              vectorCamera.z = camera.position.z;

              vectorRO.x = camera.position.x;
              vectorRO.y = valVec.vectorCenter.y;
              vectorRO.z = camera.position.z;

              var dist_0Camera = valVec.vectorCenter.distanceTo(vectorCamera);
              var dist_0RO = valVec.vectorCenter.distanceTo(vectorRO);
              var dist_ROCamera = vectorRO.distanceTo(vectorCamera);
              var angle = Math.acos((Math.pow(dist_0Camera, 2) + Math.pow(dist_0RO, 2) - Math.pow(dist_ROCamera, 2)) / (2*dist_0Camera*dist_0RO));
              // angle = 1;
                var valRot = calcRotate(valVec.vectorA, valVec.vectorB, list_edge[i].id, angle)
                textObjects[i].rotation.set(valRot.rot_x, valRot.rot_y, valRot.rot_z);
            } else {
              var selectedObject = scene.getObjectByName(textObjects[i].name);
              scene.remove( selectedObject );
                objIsRemove = 'true';
            }
          }    
        });


        //событие click
        for (let i = 0; i < edgeObjects.length; i++) {
          edgeObjects[i].addEventListener('click', (event) => {
            if (flagClick == 'false' ) {
              flagClick = i;

                event.target.geometry.setColors(color_green);
                console.log('elem ' + i + ': ');
                console.log(list_edge[i].name);
                var valVec = createVectors(list_edge[i]);
                console.log('коор А: x:' + valVec.vectorA.x + ', y: ' + valVec.vectorA.y + ', z: ' + valVec.vectorA.z);
                console.log('коор B: x:' + valVec.vectorB.x + ', y: ' + valVec.vectorB.y + ', z: ' + valVec.vectorB.z);
                var valRot = calcRotate(valVec.vectorA, valVec.vectorB, list_edge[i].id, 0.8);
                console.log('коор G: x:' + valRot.vectorG.x + ', y: ' + valRot.vectorG.y + ', z: ' + valRot.vectorG.z);
            } else if (flagClick == i) {
              flagClick = 'false';
              event.target.geometry.setColors(colors);
            }
          });
          interactionManager.add(edgeObjects[i]);
        }
			} //end init
      

			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
				insetWidth = window.innerHeight / 4; // square
				insetHeight = window.innerHeight / 4;
			}

			function animate() {
				requestAnimationFrame( animate );
        
        render();
				stats.update();
			}
      function render() {
        
				renderer.setClearColor( 0x000000);
				renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
				gpuPanel.startQuery();
				renderer.render( scene, camera );
				gpuPanel.endQuery();
				renderer.setScissorTest( true );
        for (var i = 0; i < materials.length; i++) {
          materials[i].resolution.set( window.innerWidth, window.innerHeight ); 
          materials[i].resolution.set( insetWidth, insetHeight ); 
        }
				renderer.setScissorTest( false );

        // renderer.setRenderTarget( null );
        // renderer.clear();
        // renderer.render( sceneRTT, cameraRTT );
      }
      

    },

    
  }
}
</script>


<style scoped>
body {
  overflow: hidden;
  margin: 0;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
