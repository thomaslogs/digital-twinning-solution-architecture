"use client";

import { statusColor } from "@/lib/status";
import type { Status } from "@/types/twin";

interface StatusMarkerProps {
  status: Status;
  size?: number;
}

export default function StatusMarker({ status, size = 0.12 }: StatusMarkerProps) {
  const color = statusColor(status);

  if (status === "warning") {
    return (
      <mesh rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[size * 0.9, size * 1.45, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.24} />
      </mesh>
    );
  }

  if (status === "critical") {
    return (
      <mesh>
        <octahedronGeometry args={[size * 0.9, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    );
  }

  if (status === "offline") {
    return (
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    );
  }

  return (
    <mesh>
      <sphereGeometry args={[size * 0.55, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.22} />
    </mesh>
  );
}
