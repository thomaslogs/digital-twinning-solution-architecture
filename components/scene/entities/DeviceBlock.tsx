"use client";

import { useState } from "react";
import { Edges, Html, RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import StatusMarker from "@/components/scene/entities/StatusMarker";
import { statusColor, statusLabel, statusSymbol } from "@/lib/status";
import { PETROL } from "@/lib/theme";
import type { DeviceNode } from "@/types/twin";

interface DeviceBlockProps {
  device: DeviceNode;
  selected: boolean;
  dimmed: boolean;
  showLabel: boolean;
  onSelect: (deviceId: string) => void;
}

export default function DeviceBlock({ device, selected, dimmed, showLabel, onSelect }: DeviceBlockProps) {
  const [labelOccluded, setLabelOccluded] = useState(false);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(device.id);
  };

  return (
    <group position={device.position}>
      <RoundedBox args={[1.2, 0.9, 1.1]} radius={0.06} smoothness={3} onClick={handleClick} castShadow receiveShadow>
        <meshStandardMaterial
          color={selected ? "#1f6a70" : "#3b4f60"}
          metalness={0.1}
          roughness={0.6}
          emissive={selected ? PETROL : "#121c25"}
          emissiveIntensity={selected ? 0.22 : 0.09}
          transparent
          opacity={dimmed ? 0.48 : 1}
        />
        <Edges threshold={22} color={selected ? "#87ece2" : "#5e7487"} />
      </RoundedBox>

      <group position={[0.55, 0.38, -0.5]}>
        <StatusMarker status={device.status} size={0.14} />
      </group>

      {showLabel && (
        <Html
          position={[0, 0.78, 0]}
          distanceFactor={12}
          center
          occlude
          onOcclude={setLabelOccluded}
          zIndexRange={[3, 0]}
          style={{ opacity: labelOccluded ? 0 : 1, transition: "opacity 120ms ease-out" }}
        >
          <div className={`scene-label ${device.status}`} aria-label={`${device.name} ${statusLabel(device.status)} status`}>
            <div className="row">
              <span className="title">{device.name}</span>
              <span className="dot" style={{ background: statusColor(device.status) }} />
            </div>
            <div>
              {statusSymbol(device.status)} {statusLabel(device.status)} · {device.metrics.temperature.toFixed(1)}C
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
