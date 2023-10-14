import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import space from '../img/space2.jpg'

const monkeyUrl = new URL('../assets/monkey.glb', import.meta.url)

const renderer = new THREE.WebGL1Renderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true

document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)

const orbit = new OrbitControls(camera, renderer.domElement)

const axesHelper = new THREE.AxesHelper(5)
const gridHelper = new THREE.GridHelper(30)
scene.add(axesHelper, gridHelper)

camera.position.set(-10, 30, 30)
orbit.update()

const boxGeometry = new THREE.BoxGeometry()
const boxMaterial = new THREE.MeshBasicMaterial({ color: '#00F090' })
const box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box)

const planeGeometry = new THREE.PlaneGeometry(30, 30)
const planeMaterial = new THREE.MeshStandardMaterial({
	color: '#ffffff',
	side: THREE.DoubleSide,
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)

plane.rotation.x = -0.5 * Math.PI
plane.receiveShadow = true

const sphereGeometry = new THREE.SphereGeometry(3, 50)
const sphereMaterial = new THREE.MeshStandardMaterial({
	color: '#8000FF',
	wireframe: false,
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphere)
sphere.castShadow = true

sphere.position.set(-10, 10, 0)

const gui = new dat.GUI()
const options = {
	sphereColor: '#8000FF',
	wireframe: false,
	speed: 0.01,
	angle: 0.1,
	penumbra: 0,
	intensity: 1000,
}
gui.addColor(options, 'sphereColor').onChange(e => sphere.material.color.set(e))
gui.add(options, 'wireframe').onChange(e => (sphere.material.wireframe = e))
gui.add(options, 'speed', 0, 0.1)

const ambientLight = new THREE.AmbientLight('#536353')
scene.add(ambientLight)
// const directionalLight = new THREE.DirectionalLight('#fff')
// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
// directionalLight.shadow.camera.bottom = -10
// directionalLight.shadow.camera.top = 10
// const dLightShadowHelper = new THREE.CameraHelper(
// 	directionalLight.shadow.camera
// )
// directionalLight.position.set(-30, 20, -5)
// directionalLight.castShadow = true

// scene.add(ambientLight, directionalLight, dLightHelper, dLightShadowHelper)
const spotLight = new THREE.SpotLight('#FFF', 1000)
spotLight.position.set(-60, 50, 0)
spotLight.castShadow = true
spotLight.angle = 0.1
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLight, spotLightHelper)

gui.add(options, 'angle', 0, 1)
gui.add(options, 'penumbra', 0, 1)
gui.add(options, 'intensity', 1, 10000)

// scene.fog = new THREE.Fog('#fff', 0, 250)
scene.fog = new THREE.FogExp2('#fff', 0.01)
renderer.setClearColor('#1f1f1f')

const textureLoader = new THREE.TextureLoader()
// scene.background = textureLoader.load(space)
const cubeTextureLoader = new THREE.CubeTextureLoader()
scene.background = cubeTextureLoader.load([
	space,
	space,
	space,
	space,
	space,
	space,
])

const box2Geometry = new THREE.BoxGeometry(5, 5, 5)
const box2Material = new THREE.MeshBasicMaterial({
	// map: new THREE.TextureLoader().load(space),
})
// const box2MaterialArr = [
// 	new THREE.MeshBasicMaterial({ map: textureLoader.load(space) }),
// 	new THREE.MeshBasicMaterial({ map: textureLoader.load(space) }),
// 	new THREE.MeshBasicMaterial({ color: '#ff0000' }),
// 	new THREE.MeshBasicMaterial({ map: textureLoader.load(space) }),
// 	new THREE.MeshBasicMaterial({ map: textureLoader.load(space) }),
// 	new THREE.MeshBasicMaterial({ map: textureLoader.load(space) }),
// ]

const box2 = new THREE.Mesh(box2Geometry, box2Material)
scene.add(box2)
box2.position.set(10, 10, 10)
box2.material.map = new THREE.TextureLoader().load(space)

const mousePosition = new THREE.Vector2()

window.addEventListener('mousemove', e => {
	mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
	mousePosition.x = -(e.clientY / window.innerHeight) * 2 + 1
})

const rayCaster = new THREE.Raycaster()
const sphereId = sphere.id
box2.name = 'box2'

const plane2Geometry = new THREE.PlaneGeometry(10, 10, 10, 10)
const plan22Material = new THREE.MeshBasicMaterial({
	color: '#fff',
	wireframe: true,
})
const plane2 = new THREE.Mesh(plane2Geometry, plan22Material)
scene.add(plane2)
plane2.position.set(10, 10, 15)
const lastVertexZ = plane2.geometry.attributes.position.array.length - 1

const sphere2Geometry = new THREE.SphereGeometry(4)

// const vShader = `
// 	void main(){
// 		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// 	}
// `
// const fShader = `
// 	void main(){
// 		gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
// 	}
// `

const sphere2Material = new THREE.ShaderMaterial({
	vertexShader: document.querySelector('#vertexShader').textContent,
	fragmentShader: document.querySelector('#fragmentShader').textContent,
})
const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material)
scene.add(sphere2)
sphere2.position.set(-5, 10, 10)

const assetLoader = new GLTFLoader()
assetLoader.load(
	monkeyUrl.href,
	gltf => {
		const model = gltf.scene
		scene.add(model)
		model.position.set(-4, 5, 10)
	},
	undefined,
	error => console.error(error)
)

let step = 0

function rotate(time) {
	box.rotation.x = time / 1000
	box.rotation.y = time / 1000

	step += options.speed
	sphere.position.y = 10 * Math.abs(Math.sin(step))
	spotLight.angle = options.angle
	spotLight.intensity = options.intensity
	spotLight.penumbra = options.penumbra
	spotLightHelper.update()

	rayCaster.setFromCamera(mousePosition, camera)
	const intersects = rayCaster.intersectObjects(scene.children)
	for (let i = 0; i < intersects.length; i++) {
		if (intersects[i].object.id === sphereId) {
			intersects[i].object.material.color.set('#00ff00')
		}
		if (intersects[i].object.name === box2.name) {
			intersects[i].object.rotation.x = time / 100
			intersects[i].object.rotation.y = time / 100
		}
	}

	plane2.geometry.attributes.position.array[0] = 10 * Math.random()
	plane2.geometry.attributes.position.array[1] = 10 * Math.random()
	plane2.geometry.attributes.position.array[2] = 10 * Math.random()

	plane2.geometry.attributes.position.array[lastVertexZ] = 10 * Math.random()
	plane2.geometry.attributes.position.needsUpdate = true

	renderer.render(scene, camera)
}

renderer.setAnimationLoop(rotate)

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})
