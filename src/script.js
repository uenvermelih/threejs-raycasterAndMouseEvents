import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Model Load
 */
const gltfLoader = new GLTFLoader()

let model = null

gltfLoader.load(
    "./models/Duck/glTF-Binary/Duck.glb",
    (gltf) => {
        model = gltf.scene
        gltf.scene.position.y = 2
        gltf.scene.rotation.y = - Math.PI / 2
        scene.add(model)
    }
)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight()

scene.add(ambientLight)

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

object1.updateMatrixWorld()
object2.updateMatrixWorld()
object3.updateMatrixWorld() //for correct distance info of raycasting point

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster()




/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Mouse
 */

const mouse = new THREE.Vector2()

window.addEventListener("mousemove", (e) =>{
    mouse.x = e.clientX / sizes.width * 2 - 1 //x: -1, +1
    mouse.y = - e.clientY / sizes.height * 2 + 1 //y: -1, +1

})

window.addEventListener("click", (e) => {
    if(currentIntersect) { // variable checks if null or not, to click on sphere
       

        if(currentIntersect.object === object1) {
            console.log("object 1 clicked")
        } else if(currentIntersect.object === object2) {
            console.log("object 2 clicked")
        } else if(currentIntersect.object === object3) {
            console.log("object 3 clicked")
        }
    }
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
camera.position.y = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()


let currentIntersect = null //witness variable

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Animate objects
    object1.position.y = Math.sin(elapsedTime)
    object2.position.y = Math.sin(elapsedTime + 1)
    object3.position.y = Math.sin(elapsedTime + 2)  

    //mouse event raycast
    raycaster.setFromCamera(mouse,camera)

    const objectsToTest = [object1, object2, object3]
    const intersects = raycaster.intersectObjects(objectsToTest)

    for(const object of objectsToTest) {
        object.material.color.set("#ff0000")
    } //object outside of mouse

    for(const intersect of intersects) {
        intersect.object.material.color.set("#0000ff")
    } // object on mouse

    if(intersects.length) {

        if(currentIntersect === null) {
            console.log("mouse enter")
        }

        currentIntersect = intersects[0]
    } else {

        if(currentIntersect){
            console.log("mouse leave")
        }

        currentIntersect = null
    }

    //Model intersections
    if (model) {
        
        const modelIntersects = raycaster.intersectObject(model) //hovering over duck model
        
        if(modelIntersects.length) {
            model.scale.set(1.2, 1.2, 1.2)
        } else {
            model.scale.set(1, 1, 1)
        }
    }


   /*  // fixed position - Cast a ray
    const rayOrigin = new THREE.Vector3(-3, 0, 0)
    const rayDirection = new THREE.Vector3(1, 0, 0)
    rayDirection.normalize()

    raycaster.set(rayOrigin, rayDirection)

    const objectsToTest = [object1, object2, object3]
    const intersects = raycaster.intersectObjects(objectsToTest)
    //console.log(intersects.length)

    for(const object of objectsToTest) {
        object.material.color.set("#ff0000")
    } //object outside of ray

    for(const intersect of intersects) {
        intersect.object.material.color.set("#0000ff")
    } // object on ray
 */


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()