import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import Ground from "./Ground";
import Water from "./Water";
import Grass from "./Grass";
import Path from "./Path";
import Trees from "./Trees";
import Lamps from "./Lamps";
import Rocks from "./Rocks";
import Character from "./Character";
import FollowCamera from "./FollowCamera";
import Particles from "./Particles";
import MemoriesLayer from "./MemoriesLayer";
import EmptyState from "./EmptyState";
import useKeyboard from "./useKeyboard";

// Composes the full island scene with a controllable character, follow camera,
// and the player's memories rendered from their cached object_json.
export default function IslandScene({
  input,
  memories,
  nearestId,
  onOpenMemory,
  cameraFocus,
  newMemoryId,
  characterColor,
  characterHat,
  activeMemoryId,
  onCloseMemory,
}) {
  const charState = useRef({
    pos: new THREE.Vector3(0, 0, 0),
    moving: false,
    dir: new THREE.Vector3(0, 0, 1),
  });
  useKeyboard(input);

  const memoryObstacles = useMemo(
    () =>
      memories.map((m) => ({
        x: m.position_x,
        z: m.position_z,
        radius: 0.9,
      })),
    [memories]
  );

  return (
    <>
      {/* Fog matched to the background colour */}
      <fog attach="fog" args={["#E8A87C", 60, 160]} />

      {/* One directional light with soft shadows, sized to fit the island */}
      <directionalLight
        position={[20, 30, 10]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
      />
      {/* One hemisphere light for fill */}
      <hemisphereLight args={["#ffffff", "#3D1F4D", 0.6]} />

      <Ground />
      <Water />
      <Grass />
      <Path />
      <Trees />
      <Lamps />
      <Rocks />
      {memories.length === 0 && <EmptyState />}

      <Character
        input={input}
        charState={charState}
        memoryObstacles={memoryObstacles}
        color={characterColor}
        hat={characterHat}
      />
      <FollowCamera charState={charState} focusRef={cameraFocus} input={input} closeup={!!activeMemoryId} />
      <Particles charState={charState} />
      <MemoriesLayer
        memories={memories}
        charState={charState}
        nearestId={nearestId}
        onOpenMemory={onOpenMemory}
        newMemoryId={newMemoryId}
        activeMemoryId={activeMemoryId}
        onCloseMemory={onCloseMemory}
      />
    </>
  );
}