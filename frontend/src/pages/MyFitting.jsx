import React, { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls } from "@react-three/drei";
import Tshirt from "../Tshirt";

const closetItems = [
  {
    id: "sky-knit",
    name: "Sky Knit Pullover",
    textureUrl: null,
    color: "#5B9BD5",
  },
  {
    id: "rose-jacket",
    name: "Rose Short Jacket",
    textureUrl: "/image2.jpeg",
    color: "#E69C9C",
  },
  {
    id: "oat-sweater",
    name: "Oat Knit Sweater",
    textureUrl: "/image3.jpeg",
    color: "#C5A880",
  },
];

export default function MyFitting() {
  const [layers, setLayers] = useState([]);

  const handleAddToLayer = (item) => {
    setLayers((prev) => [
      ...prev,
      { ...item, uniqueId: `${item.id}-${Date.now()}` },
    ]);
  };

  const handleRemoveLayer = (id) => {
    setLayers((prev) => prev.filter((l) => l.uniqueId !== id));
  };

  const renderedLayers = useMemo(
    () =>
      layers.map((layer, index) => {
        const scale = 1 + index * 0.025;
        return (
          <Tshirt
            key={layer.uniqueId}
            textureUrl={layer.textureUrl}
            color={layer.color}
            scale={[scale, scale, scale]}
          />
        );
      }),
    [layers],
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          flex: "0 0 65%",
          position: "relative",
          border: "1px solid #e5e5e5",
          borderRadius: 20,
          background: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 8,
            zIndex: 5,
          }}
        >
          <button
            type="button"
            style={{
              border: "1px solid #e5e5e5",
              background: "#ffffff",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
            }}
          >
            마네킹
          </button>
          <button
            type="button"
            style={{
              border: "1px solid #e5e5e5",
              background: "#ffffff",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
            }}
          >
            실제
          </button>
        </div>
        <Canvas camera={{ position: [0, 0, 1.5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 2]} intensity={0.8} />
          <OrbitControls enablePan={false} />
          <Suspense fallback={null}>
            <Environment preset="city" />
            <Center>
              {renderedLayers.length > 0 ? (
                renderedLayers
              ) : (
                // ❗ 기본 상태에서도 무조건 보이게 색 지정
                <Tshirt color="#d0d0d0" />
              )}
            </Center>
          </Suspense>
        </Canvas>
      </div>

      <div style={{ flex: "0 0 35%", padding: 20 }}>
        {closetItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleAddToLayer(item)}
            style={{ display: "block", marginBottom: 8 }}
          >
            {item.name}
          </button>
        ))}

        {layers.map((l) => (
          <button
            key={l.uniqueId}
            onClick={() => handleRemoveLayer(l.uniqueId)}
          >
            remove {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}
