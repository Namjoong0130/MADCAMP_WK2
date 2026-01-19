import React, { useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function Tshirt({ textureUrl, color = "#e0e0e0", ...props }) {
  const { nodes } = useGLTF("/tshirt.glb");

  const hasTexture = typeof textureUrl === "string" && textureUrl.length > 0;

  const originalTexture = useTexture(
    hasTexture ? textureUrl : "/__empty__.png",
  );

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: hasTexture ? "#ffffff" : color,
      map: hasTexture ? originalTexture : null,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    if (hasTexture && originalTexture) {
      const tex = originalTexture.clone();
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      mat.map = tex;
    }

    return mat;
  }, [hasTexture, originalTexture, color]);

  const meshes = useMemo(
    () => Object.values(nodes).filter((n) => n.isMesh && n.geometry),
    [nodes],
  );

  return (
    <group {...props} dispose={null}>
      {meshes.map((mesh, i) => (
        <mesh
          key={i}
          geometry={mesh.geometry}
          material={material} // ❗ 기존 material 덮어씀
        />
      ))}
    </group>
  );
}

useGLTF.preload("/tshirt.glb");
