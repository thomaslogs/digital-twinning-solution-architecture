"use client";

import { useState } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import StatusMarker from "@/components/scene/entities/StatusMarker";
import { statusColor, statusLabel, statusSymbol } from "@/lib/status";
import { PETROL } from "@/lib/theme";
import type { SiteNode } from "@/types/twin";

interface SitePlatformProps {
  site: SiteNode;
  selected: boolean;
  dimmed: boolean;
  showLabel: boolean;
  onSelect: (siteId: string) => void;
}

export default function SitePlatform({ site, selected, dimmed, showLabel, onSelect }: SitePlatformProps) {
  const activeColor = selected ? PETROL : "#24303a";
  const labelClass = `scene-label ${site.status}`;
  const [labelOccluded, setLabelOccluded] = useState(false);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(site.id);
  };

  return (
    <group position={site.position}>
      <RoundedBox args={[8.5, 0.6, 6.2]} radius={0.08} smoothness={4} onClick={handleClick} castShadow receiveShadow>
        <meshStandardMaterial
          color={activeColor}
          metalness={0.12}
          roughness={0.72}
          emissive={selected ? PETROL : "#000000"}
          emissiveIntensity={selected ? 0.2 : 0}
          transparent
          opacity={dimmed ? 0.22 : 1}
        />
      </RoundedBox>

      <group position={[3.8, 0.35, -2.7]}>
        <StatusMarker status={site.status} size={0.18} />
      </group>

      {showLabel && (
        <Html
          position={[0, 0.62, 0]}
          distanceFactor={18}
          center
          occlude
          onOcclude={setLabelOccluded}
          zIndexRange={[2, 0]}
          style={{ opacity: labelOccluded ? 0 : 1, transition: "opacity 120ms ease-out" }}
        >
          <div className={labelClass} aria-label={`${site.name} ${statusLabel(site.status)} status`}>
            <div className="row">
              <span className="title">{site.name}</span>
              <span className="dot" style={{ background: statusColor(site.status) }} />
            </div>
            <div>
              {statusSymbol(site.status)} {statusLabel(site.status)} · {site.metrics.utilization.toFixed(1)}%
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
