import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Direction of the camera offset from the character: [18, 22, 18] normalised
// (~40° down). Drag only rotates this offset horizontally (vertical angle is
// locked); scroll only changes the distance. The camera stays above the
// scene looking down, so the horizon never enters the frame.
const BASE = new THREE.Vector3(18, 22, 18).normalize();
const MIN_DIST = 16;
const MAX_DIST = 40;
const CLOSEUP = 22;

export default function FollowCamera({ charState, focusRef, input, closeup }) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const dist = useRef(34);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.fov = 30;
    camera.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e) => {
      if (input && input.current && input.current.disabled) return;
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      dragging.current = false;
    };
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      last.current = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * 0.005;
    };
    const onWheel = (e) => {
      if (input && input.current && input.current.disabled) return;
      e.preventDefault();
      dist.current = THREE.MathUtils.clamp(
        dist.current + e.deltaY * 0.01,
        MIN_DIST,
        MAX_DIST
      );
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  useFrame((_, dt) => {
    // Briefly pan to a focus point (e.g. a newly created memory) when set.
    const f = focusRef && focusRef.current;
    if (f && f.time > 0) {
      f.time -= dt;
      desired.current.set(
        BASE.x * 24 + f.pos[0],
        BASE.y * 24 + f.pos[1],
        BASE.z * 24 + f.pos[2]
      );
      camera.position.lerp(desired.current, 0.08);
      camera.lookAt(f.pos[0], f.pos[1] + 1.5, f.pos[2]);
      if (f.time <= 0) focusRef.current = null;
      return;
    }
    if (closeup) {
      dist.current += (CLOSEUP - dist.current) * 0.08;
    }
    const cp = charState.current.pos;
    const cos = Math.cos(yaw.current);
    const sin = Math.sin(yaw.current);
    desired.current
      .set(
        BASE.x * cos - BASE.z * sin,
        BASE.y,
        BASE.x * sin + BASE.z * cos
      )
      .multiplyScalar(dist.current)
      .add(cp);
    camera.position.lerp(desired.current, 0.06);
    lookAt.current.set(cp.x, cp.y + 1.5, cp.z);
    camera.lookAt(lookAt.current);
  });

  return null;
}