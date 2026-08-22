"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

type Collider = { x: number; z: number; r: number }

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TOWN_CENTER = new THREE.Vector2(0, 0)
const WORLD_SIZE = 500

function terrainHeight(x: number, z: number): number {
  const h =
    Math.sin(x * 0.015) * Math.cos(z * 0.017) * 7 +
    Math.sin(x * 0.043 + z * 0.031) * 2.4 +
    Math.cos(x * 0.09 - z * 0.07) * 0.8
  const dist = TOWN_CENTER.length() // unused, kept for clarity
  void dist
  const d = Math.hypot(x - TOWN_CENTER.x, z - TOWN_CENTER.y)
  const flat = THREE.MathUtils.smoothstep(d, 26, 70)
  return h * flat
}

export function ForestGame() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x9fc7e8)
    scene.fog = new THREE.Fog(0xa8cfe8, 60, 260)

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      600,
    )

    // --- Lighting ---
    const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x3d5232, 0.85)
    scene.add(hemi)

    const sun = new THREE.DirectionalLight(0xfff2d4, 1.6)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 10
    sun.shadow.camera.far = 200
    sun.shadow.camera.left = -70
    sun.shadow.camera.right = 70
    sun.shadow.camera.top = 70
    sun.shadow.camera.bottom = -70
    sun.shadow.bias = -0.0005
    scene.add(sun)
    scene.add(sun.target)

    // --- Terrain ---
    const terrainGeo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 160, 160)
    terrainGeo.rotateX(-Math.PI / 2)
    const pos = terrainGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)))
    }
    terrainGeo.computeVertexNormals()
    const terrainMat = new THREE.MeshLambertMaterial({ color: 0x557f3a })
    const terrain = new THREE.Mesh(terrainGeo, terrainMat)
    terrain.receiveShadow = true
    scene.add(terrain)

    const rand = mulberry32(1337)
    const colliders: Collider[] = []

    // --- Town clearing helper ---
    const inTown = (x: number, z: number) =>
      Math.hypot(x - TOWN_CENTER.x, z - TOWN_CENTER.y) < 34

    // --- Forest (instanced trees) ---
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 4, 6)
    trunkGeo.translate(0, 2, 0)
    const foliageGeo = new THREE.ConeGeometry(2.4, 7, 7)
    foliageGeo.translate(0, 6.5, 0)

    const TREE_COUNT = 900
    const treePositions: { x: number; z: number; s: number }[] = []
    let attempts = 0
    while (treePositions.length < TREE_COUNT && attempts < TREE_COUNT * 12) {
      attempts++
      const x = (rand() - 0.5) * (WORLD_SIZE - 30)
      const z = (rand() - 0.5) * (WORLD_SIZE - 30)
      if (inTown(x, z)) continue
      if (
        treePositions.some(
          (t) => (t.x - x) ** 2 + (t.z - z) ** 2 < 36,
        )
      )
        continue
      treePositions.push({ x, z, s: 0.7 + rand() * 0.9 })
    }

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b4a2e })
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2f6b2f })
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treePositions.length)
    const foliages = new THREE.InstancedMesh(foliageGeo, foliageMat, treePositions.length)
    trunks.castShadow = true
    foliages.castShadow = true
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const color = new THREE.Color()
    treePositions.forEach((t, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2)
      m.compose(
        new THREE.Vector3(t.x, terrainHeight(t.x, t.z), t.z),
        q,
        new THREE.Vector3(t.s, t.s, t.s),
      )
      trunks.setMatrixAt(i, m)
      foliages.setMatrixAt(i, m)
      color.setHSL(0.29 + rand() * 0.06, 0.45 + rand() * 0.15, 0.28 + rand() * 0.12)
      foliages.setColorAt(i, color)
      colliders.push({ x: t.x, z: t.z, r: 0.9 * t.s })
    })
    foliages.instanceMatrix.needsUpdate = true
    scene.add(trunks, foliages)

    // --- Bushes & rocks ---
    const bushGeo = new THREE.IcosahedronGeometry(1, 0)
    const rockGeo = new THREE.DodecahedronGeometry(0.8, 0)
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x3a7d33 })
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x8b8b83 })
    const bushes = new THREE.InstancedMesh(bushGeo, bushMat, 250)
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, 120)
    bushes.castShadow = true
    rocks.castShadow = true
    for (let i = 0; i < 250; i++) {
      const x = (rand() - 0.5) * (WORLD_SIZE - 20)
      const z = (rand() - 0.5) * (WORLD_SIZE - 20)
      const s = 0.6 + rand() * 1.2
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI)
      m.compose(
        new THREE.Vector3(x, terrainHeight(x, z) + 0.4 * s, z),
        q,
        new THREE.Vector3(s, s * 0.7, s),
      )
      bushes.setMatrixAt(i, m)
    }
    for (let i = 0; i < 120; i++) {
      const x = (rand() - 0.5) * (WORLD_SIZE - 20)
      const z = (rand() - 0.5) * (WORLD_SIZE - 20)
      const s = 0.4 + rand() * 1.1
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI)
      m.compose(
        new THREE.Vector3(x, terrainHeight(x, z) + 0.2 * s, z),
        q,
        new THREE.Vector3(s, s * 0.8, s),
      )
      rocks.setMatrixAt(i, m)
    }
    bushes.instanceMatrix.needsUpdate = true
    rocks.instanceMatrix.needsUpdate = true
    scene.add(bushes, rocks)

    // --- Town ---
    const townGroup = new THREE.Group()

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xd9c9a8 })
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x8c3b2e })
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x5a3a22 })

    const houseSpecs = [
      { x: -14, z: -10, rot: 0.4 },
      { x: 12, z: -14, rot: -0.7 },
      { x: -18, z: 10, rot: 1.2 },
      { x: 16, z: 12, rot: -2.2 },
      { x: 2, z: -20, rot: 0 },
      { x: 24, z: 0, rot: -Math.PI / 2 },
      { x: -26, z: -2, rot: Math.PI / 2 },
    ]

    for (const h of houseSpecs) {
      const house = new THREE.Group()
      const w = 6 + rand() * 2
      const d = 5 + rand() * 2
      const hh = 3.2
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), wallMat)
      body.position.y = hh / 2
      body.castShadow = true
      body.receiveShadow = true
      house.add(body)

      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 3, 4), roofMat)
      roof.position.y = hh + 1.5
      roof.rotation.y = Math.PI / 4
      roof.scale.set(w > d ? 1 : d / w, 1, d > w ? 1 : w / d)
      roof.castShadow = true
      house.add(roof)

      const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.15), doorMat)
      door.position.set(0, 1, d / 2 + 0.08)
      house.add(door)

      house.position.set(h.x, terrainHeight(h.x, h.z), h.z)
      house.rotation.y = h.rot
      townGroup.add(house)

      colliders.push({ x: h.x, z: h.z, r: Math.max(w, d) * 0.62 })
    }

    // Well at center
    const well = new THREE.Group()
    const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2, 1.2, 12), rockMat)
    wellBase.position.y = 0.6
    wellBase.castShadow = true
    const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.4, 8), roofMat)
    wellRoof.position.y = 3.4
    wellRoof.castShadow = true
    const postA = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 0.2), doorMat)
    postA.position.set(-1.5, 1.9, 0)
    const postB = postA.clone()
    postB.position.x = 1.5
    well.add(wellBase, wellRoof, postA, postB)
    well.position.set(0, terrainHeight(0, 0), 0)
    townGroup.add(well)
    colliders.push({ x: 0, z: 0, r: 2.4 })

    // Lamp posts
    const lampPostMat = new THREE.MeshLambertMaterial({ color: 0x333333 })
    const lampGlassMat = new THREE.MeshBasicMaterial({ color: 0xffd98a })
    for (const [lx, lz] of [
      [-6, -6],
      [6, -6],
      [-6, 6],
      [6, 6],
    ]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.4, 6), lampPostMat)
      post.position.set(lx, terrainHeight(lx, lz) + 2.2, lz)
      post.castShadow = true
      const glass = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), lampGlassMat)
      glass.position.set(lx, terrainHeight(lx, lz) + 4.4, lz)
      townGroup.add(post, glass)
      colliders.push({ x: lx, z: lz, r: 0.35 })
    }

    // Dirt road ring + paths
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x9a8560 })
    const roadRing = new THREE.Mesh(new THREE.RingGeometry(5.5, 8.5, 48), roadMat)
    roadRing.rotateX(-Math.PI / 2)
    roadRing.position.set(0, terrainHeight(0, 0) + 0.06, 0)
    townGroup.add(roadRing)
    for (let i = 0; i < 4; i++) {
      const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 22), roadMat)
      path.rotateX(-Math.PI / 2)
      const angle = (i * Math.PI) / 2
      path.position.set(
        Math.sin(angle) * 17,
        terrainHeight(Math.sin(angle) * 17, Math.cos(angle) * 17) + 0.06,
        Math.cos(angle) * 17,
      )
      path.rotation.y = angle
      townGroup.add(path)
    }

    // Fence posts around town edge
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x7a5c3a })
    const fenceGeo = new THREE.BoxGeometry(0.18, 1.2, 0.18)
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2
      if (angle % (Math.PI / 2) < 0.12 || angle % (Math.PI / 2) > Math.PI / 2 - 0.12) continue
      const fx = Math.sin(angle) * 31
      const fz = Math.cos(angle) * 31
      const post = new THREE.Mesh(fenceGeo, fenceMat)
      post.position.set(fx, terrainHeight(fx, fz) + 0.6, fz)
      post.rotation.y = angle
      post.castShadow = true
      townGroup.add(post)
    }

    scene.add(townGroup)

    // --- Player ---
    const playerGroup = new THREE.Group()
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x3a6ea5 })
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xe8b88a })
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.9, 4, 8), bodyMat)
    torso.position.y = 1.25
    torso.castShadow = true
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), skinMat)
    head.position.y = 2.15
    head.castShadow = true
    playerGroup.add(torso, head)
    scene.add(playerGroup)

    const SPAWN = new THREE.Vector3(0, 0, 26)
    playerGroup.position.set(SPAWN.x, terrainHeight(SPAWN.x, SPAWN.z), SPAWN.z)

    // --- Input ---
    const keys = new Set<string>()
    const onKeyDown = (e: KeyboardEvent) => keys.add(e.code)
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    let camYaw = Math.PI
    let camPitch = 0.35
    let camDist = 8
    let dragging = false
    let lastX = 0
    let lastY = 0

    const el = renderer.domElement
    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      el.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      camYaw -= (e.clientX - lastX) * 0.005
      camPitch = THREE.MathUtils.clamp(camPitch + (e.clientY - lastY) * 0.004, 0.05, 1.2)
      lastX = e.clientX
      lastY = e.clientY
    }
    const onPointerUp = () => (dragging = false)
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 4, 18)
    }
    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", onPointerUp)
    el.addEventListener("wheel", onWheel, { passive: false })

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener("resize", onResize)

    // --- Game loop ---
    const velocityY = { value: 0 }
    const GRAVITY = 22
    const clock = new THREE.Clock()
    let frame: number
    let running = true

    const tmpV = new THREE.Vector3()

    function tick() {
      if (!running) return
      frame = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)

      // Movement relative to camera yaw
      let mx = 0
      let mz = 0
      if (keys.has("KeyW") || keys.has("ArrowUp")) mz -= 1
      if (keys.has("KeyS") || keys.has("ArrowDown")) mz += 1
      if (keys.has("KeyA") || keys.has("ArrowLeft")) mx -= 1
      if (keys.has("KeyD") || keys.has("ArrowRight")) mx += 1
      const sprinting = keys.has("ShiftLeft") || keys.has("ShiftRight")
      const speed = sprinting ? 14 : 7

      const moving = mx !== 0 || mz !== 0
      if (moving) {
        const len = Math.hypot(mx, mz)
        const sin = Math.sin(camYaw)
        const cos = Math.cos(camYaw)
        const dx = ((mx / len) * cos - (mz / len) * sin) * speed * dt
        const dz = ((mx / len) * sin + (mz / len) * cos) * speed * dt
        let nx = playerGroup.position.x + dx
        let nz = playerGroup.position.z + dz

        // World bounds
        nx = THREE.MathUtils.clamp(nx, -WORLD_SIZE / 2 + 5, WORLD_SIZE / 2 - 5)
        nz = THREE.MathUtils.clamp(nz, -WORLD_SIZE / 2 + 5, WORLD_SIZE / 2 - 5)

        // Circle collision resolution
        for (const c of colliders) {
          const ox = nx - c.x
          const oz = nz - c.z
          const d2 = ox * ox + oz * oz
          const minD = c.r + 0.5
          if (d2 < minD * minD && d2 > 1e-6) {
            const d = Math.sqrt(d2)
            nx = c.x + (ox / d) * minD
            nz = c.z + (oz / d) * minD
          }
        }

        playerGroup.position.x = nx
        playerGroup.position.z = nz

        // Face movement direction
        const targetRot = Math.atan2(dx, dz)
        let diff = targetRot - playerGroup.rotation.y
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        playerGroup.rotation.y += diff * Math.min(dt * 12, 1)

        // Bob animation
        torso.position.y = 1.25 + Math.abs(Math.sin(clock.elapsedTime * (sprinting ? 14 : 9))) * 0.08
        head.position.y = 2.15 + Math.abs(Math.sin(clock.elapsedTime * (sprinting ? 14 : 9))) * 0.06
      }

      // Jump & gravity
      const groundY = terrainHeight(playerGroup.position.x, playerGroup.position.z)
      if (keys.has("Space") && velocityY.value === 0 && playerGroup.position.y <= groundY + 0.01) {
        velocityY.value = 8.5
      }
      velocityY.value -= GRAVITY * dt
      playerGroup.position.y += velocityY.value * dt
      if (playerGroup.position.y <= groundY) {
        playerGroup.position.y = groundY
        velocityY.value = 0
      }

      // Camera follow
      tmpV.set(
        playerGroup.position.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist,
        playerGroup.position.y + Math.sin(camPitch) * camDist + 2,
        playerGroup.position.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist,
      )
      camera.position.lerp(tmpV, Math.min(dt * 8, 1))
      camera.lookAt(
        playerGroup.position.x,
        playerGroup.position.y + 1.8,
        playerGroup.position.z,
      )

      // Sun follows player so shadows stay crisp
      sun.position.set(playerGroup.position.x + 50, 90, playerGroup.position.z + 30)
      sun.target.position.copy(playerGroup.position)

      renderer.render(scene, camera)
    }
    tick()
    setLoading(false)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("resize", onResize)
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", onPointerUp)
      el.removeEventListener("wheel", onWheel)
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mat = obj.material
          if (Array.isArray(mat)) mat.forEach((mt) => mt.dispose())
          else mat.dispose()
        }
      })
      if (el.parentElement) el.parentElement.removeChild(el)
    }
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-sky-300">
      <div ref={containerRef} className="h-full w-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900 text-stone-100">
          <p className="text-lg tracking-wide">Growing the forest…</p>
        </div>
      )}
      <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-black/50 px-4 py-3 text-sm text-white backdrop-blur">
        <p className="mb-1 font-semibold">🌲 Elderwood</p>
        <p>WASD — move · Shift — sprint · Space — jump</p>
        <p>Drag mouse — orbit · Scroll — zoom</p>
      </div>
    </div>
  )
}
