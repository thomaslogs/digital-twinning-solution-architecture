"use client";

import { useState } from "react";
import { Edges, Html, RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import StatusMarker from "@/components/scene/entities/StatusMarker";
import { statusColor, statusLabel, statusSymbol } from "@/lib/status";
import { PETROL } from "@/lib/theme";
import type { ComponentNode } from "@/types/twin";

interface ComponentChipProps {
  component: ComponentNode;
  selected: boolean;
  dimmed: boolean;
  showLabel: boolean;
  onSelect: (componentId: string) => void;
}

export default function ComponentChip({ component, selected, dimmed, showLabel, onSelect }: ComponentChipProps) {
  const [labelOccluded, setLabelOccluded] = useState(false);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(component.id);
  };

  return (
    <group position={component.position}>
      <RoundedBox args={[0.95, 0.25, 0.55]} radius={0.05} smoothness={3} onClick={handleClick} castShadow receiveShadow>
        <meshStandardMaterial
          color={selected ? "#22767b" : "#415868"}
          metalness={0.08}
          roughness={0.58}
          emissive={selected ? PETROL : "#141e27"}
          emissiveIntensity={selected ? 0.24 : 0.08}
          transparent
          opacity={dimmed ? 0.52 : 1}
        />
        <Edges threshold={22} color={selected ? "#95f0e8" : "#6f8393"} />
      </RoundedBox>

      <group position={[0.37, 0.12, 0.18]}>
        <StatusMarker status={component.status} size={0.1} />
      </group>

      {showLabel && (
        <Html
          position={[0, 0.3, 0]}
          distanceFactor={9}
          center
          occlude
          onOcclude={setLabelOccluded}
          zIndexRange={[4, 0]}
          style={{ opacity: labelOccluded ? 0 : 1, transition: "opacity 120ms ease-out" }}
        >
          <div className={`scene-label ${component.status}`} aria-label={`${component.name} ${statusLabel(component.status)} status`}>
            <div className="row">
              <span className="title">{component.name}</span>
              <span className="dot" style={{ background: statusColor(component.status) }} />
            </div>
            <div>
              {statusSymbol(component.status)} Failure {component.metrics.predictedFailureScore.toFixed(1)}%
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
