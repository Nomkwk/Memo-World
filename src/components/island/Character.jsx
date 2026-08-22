import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { OBSTACLES } from "./obstacles";
import { getHeightAt } from "./terrain";
import Hat from "./Hat";
import { footstep } from "@/lib/audio";

const ISLAND_RADIUS = 38;
const WALK_SPEED = 6;
const RUN_SPEED = 10;
const TURN_LERP = 10;
const CHAR_RADIUS = 0.4;
const LIMB_COLOR = "#3a2a22";

// A toy character built from primitives: rounded box body, cube head, cylinder
// arms and legs. Camera-relative WASD/arrow movement, smooth facing, simple
// circle collision against obstacles + island radius, idle + walk animation.
export default function Character({
  color = "#E24B4B",
  hat = "none",
  input,
  charState,
  memoryObstacles,
}) {
  const root = useRef();
  const bob = useRef();
  const la = useRef();
  const ra = useRef();
  const ll = useRef();
  const rl = useRef();
  const stepAccum = useRef(0);
  const { camera } = useThree();

  const s = useRef({
    pos: new THREE.Vector3(0, 0, 0),
    facing: 0,
    walkPhase: 0,
  });
  const fwd = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const move = useRef(new THREE.Vector3());
  const obstaclesRef = useRef([...OBSTACLES]);
  obstaclesRef.current = [...OBSTACLES, ...(memoryObstacles || [])];

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const k = (input.current && input.current.keys) || {};
    const joy = (input.current && input.current.joy) || { x: 0, y: 0 };
    const dis = !!(input.current && input.current.disabled);

    let ix =
      (k.KeyA || k.ArrowLeft ? 1 : 0) - (k.KeyD || k.ArrowRight ? 1 : 0) + joy.x;
    let iz =
      (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) + joy.y;
    const mag = Math.hypot(ix, iz);
    if (mag > 1) {
      ix /= mag;
      iz /= mag;
    }
    if (dis) {
      ix = 0;
      iz = 0;
    }
    const run = !!(k.ShiftLeft || k.ShiftRight);

    // forward = away from camera (on XZ)
    const cp = camera.position;
    fwd.current
      .set(s.current.pos.x - cp.x, 0, s.current.pos.z - cp.z)
      .normalize();
    right.current.set(fwd.current.z, 0, -fwd.current.x);

    const speed = run ? RUN_SPEED : WALK_SPEED;
    move.current
      .set(0, 0, 0)
      .addScaledVector(fwd.current, iz)
      .addScaledVector(right.current, ix);
    const moving = move.current.lengthSq() > 0.0001;
    if (moving) move.current.normalize();

    let cx = s.current.pos.x + move.current.x * speed * dt;
    let cz = s.current.pos.z + move.current.z * speed * dt;

    // push out of obstacles (static + memories)
    for (const o of obstaclesRef.current) {
      const dx = cx - o.x;
      const dz = cz - o.z;
      const d = Math.hypot(dx, dz);
      const minD = o.radius + CHAR_RADIUS;
      if (d < minD && d > 0.0001) {
        const push = minD - d;
        cx += (dx / d) * push;
        cz += (dz / d) * push;
      }
    }
    // clamp to island radius
    const distC = Math.hypot(cx, cz);
    if (distC > ISLAND_RADIUS) {
      cx = (cx / distC) * ISLAND_RADIUS;
      cz = (cz / distC) * ISLAND_RADIUS;
    }
    s.current.pos.set(cx, s.current.pos.y, cz);
    const targetY = getHeightAt(cx, cz);
    s.current.pos.y += (targetY - s.current.pos.y) * 0.2;

    // smooth facing toward travel direction
    if (moving) {
      const target = Math.atan2(move.current.x, move.current.z);
      let diff = target - s.current.facing;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      s.current.facing += diff * Math.min(1, TURN_LERP * dt);
    }

    root.current.position.set(s.current.pos.x, s.current.pos.y, s.current.pos.z);
    root.current.rotation.y = s.current.facing;

    // animation
    const t = state.clock.elapsedTime;
    if (moving) {
      stepAccum.current += dt * speed;
      if (stepAccum.current > 1.3) {
        stepAccum.current = 0;
        footstep();
      }
      s.current.walkPhase += dt * 10;
      const sw = Math.sin(s.current.walkPhase) * 0.6;
      la.current.rotation.x = sw;
      ra.current.rotation.x = -sw;
      ll.current.rotation.x = -sw;
      rl.current.rotation.x = sw;
      bob.current.position.y = Math.abs(Math.sin(s.current.walkPhase)) * 0.08;
    } else {
      stepAccum.current = 0;
      la.current.rotation.x *= 0.9;
      ra.current.rotation.x *= 0.9;
      ll.current.rotation.x *= 0.9;
      rl.current.rotation.x *= 0.9;
      bob.current.position.y = Math.sin(t * 2) * 0.04;
    }

    // expose to camera + particles
    charState.current.pos.copy(s.current.pos);
    charState.current.moving = moving;
    charState.current.dir.copy(move.current);
  });

  return (
    <group ref={root}>
      <group ref={bob}>
        <RoundedBox
          args={[0.6, 0.7, 0.4]}
          radius={0.12}
          smoothness={2}
          position={[0, 0.85, 0]}
          castShadow
        >
          <meshLambertMaterial color={color} flatShading />
        </RoundedBox>
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshLambertMaterial color={color} flatShading />
        </mesh>
        <Hat hat={hat} color={color} />
        <group ref={la} position={[-0.32, 1.1, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 6]} />
            <meshLambertMaterial color={LIMB_COLOR} flatShading />
          </mesh>
        </group>
        <group ref={ra} position={[0.32, 1.1, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 6]} />
            <meshLambertMaterial color={LIMB_COLOR} flatShading />
          </mesh>
        </group>
      </group>
      <group ref={ll} position={[-0.15, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 6]} />
          <meshLambertMaterial color={LIMB_COLOR} flatShading />
        </mesh>
      </group>
      <group ref={rl} position={[0.15, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 6]} />
          <meshLambertMaterial color={LIMB_COLOR} flatShading />
        </mesh>
      </group>
    </group>
  );
}