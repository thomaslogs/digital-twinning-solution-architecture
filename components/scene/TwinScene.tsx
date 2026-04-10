"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  type OrbitControlsProps
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Color, MathUtils, Vector3 } from "three";
import SitePlatform from "@/components/scene/entities/SitePlatform";
import DeviceBlock from "@/components/scene/entities/DeviceBlock";
import ComponentChip from "@/components/scene/entities/ComponentChip";
import { matchesFilter } from "@/lib/status";
import { getSelectedComponent, getSelectedDevice, getSelectedSite } from "@/lib/twinSelectors";
import { useTwinStore } from "@/store/useTwinStore";
import type { SiteNode, TwinSelection } from "@/types/twin";

interface FocusPose {
  position: Vector3;
  target: Vector3;
}

function resolveWorldPosition(
  sites: SiteNode[],
  selection: TwinSelection
): { site?: SiteNode; devicePos?: Vector3; componentPos?: Vector3 } {
  const site = getSelectedSite(sites, selection);
  const device = getSelectedDevice(sites, selection);
  const component = getSelectedComponent(sites, selection);

  if (!site) {
    return {};
  }

  const sitePos = new Vector3(...site.position);
  const devicePos = device ? sitePos.clone().add(new Vector3(...device.position)) : undefined;
  const componentPos = component && devicePos ? devicePos.clone().add(new Vector3(...component.position)) : undefined;

  return { site, devicePos, componentPos };
}

function getFocusPose(sites: SiteNode[], selection: TwinSelection): FocusPose {
  const world = resolveWorldPosition(sites, selection);

  if (selection.level === "sites" || !world.site) {
    return {
      position: new Vector3(0, 20, 30),
      target: new Vector3(0, 0, 0)
    };
  }

  const sitePos = new Vector3(...world.site.position);

  if (selection.level === "site" || !world.devicePos) {
    return {
      position: sitePos.clone().add(new Vector3(7, 5.5, 7)),
      target: sitePos.clone().add(new Vector3(0, 0.35, 0))
    };
  }

  if (selection.level === "device" || !world.componentPos) {
    return {
      position: world.devicePos.clone().add(new Vector3(3.2, 2.7, 3.1)),
      target: world.devicePos.clone().add(new Vector3(0, 0.5, 0))
    };
  }

  return {
    position: world.componentPos.clone().add(new Vector3(1.7, 1.3, 1.7)),
    target: world.componentPos.clone()
  };
}

function CameraRig({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();
  const sites = useTwinStore((state) => state.sites);
  const selection = useTwinStore((state) => state.selection);
  const focusToken = useTwinStore((state) => state.focusToken);

  const desiredPosition = useRef(new Vector3(0, 20, 30));
  const desiredTarget = useRef(new Vector3(0, 0, 0));
  const userInteracting = useRef(false);
  const autoFocusActive = useRef(true);
  const lastFocusKey = useRef("");

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    const handleStart = () => {
      userInteracting.current = true;
      autoFocusActive.current = false;
    };

    const handleEnd = () => {
      userInteracting.current = false;
    };

    controls.addEventListener("start", handleStart);
    controls.addEventListener("end", handleEnd);

    return () => {
      controls.removeEventListener("start", handleStart);
      controls.removeEventListener("end", handleEnd);
    };
  }, [controlsRef]);

  useEffect(() => {
    const focusKey = `${selection.level}:${selection.siteId ?? ""}:${selection.deviceId ?? ""}:${selection.componentId ?? ""}`;
    if (focusKey === lastFocusKey.current) {
      if (focusToken === 0) {
        return;
      }
    }

    lastFocusKey.current = focusKey;
    const pose = getFocusPose(sites, selection);
    desiredPosition.current.copy(pose.position);
    desiredTarget.current.copy(pose.target);
    autoFocusActive.current = true;
  }, [sites, selection, focusToken]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;

    if (autoFocusActive.current && !userInteracting.current) {
      camera.position.x = MathUtils.damp(camera.position.x, desiredPosition.current.x, 4.5, delta);
      camera.position.y = MathUtils.damp(camera.position.y, desiredPosition.current.y, 4.5, delta);
      camera.position.z = MathUtils.damp(camera.position.z, desiredPosition.current.z, 4.5, delta);

      if (controls) {
        controls.target.x = MathUtils.damp(controls.target.x, desiredTarget.current.x, 5.2, delta);
        controls.target.y = MathUtils.damp(controls.target.y, desiredTarget.current.y, 5.2, delta);
        controls.target.z = MathUtils.damp(controls.target.z, desiredTarget.current.z, 5.2, delta);
      } else {
        camera.lookAt(desiredTarget.current);
      }

      const positionError = camera.position.distanceTo(desiredPosition.current);
      const targetError = controls ? controls.target.distanceTo(desiredTarget.current) : 0;
      if (positionError < 0.03 && targetError < 0.03) {
        autoFocusActive.current = false;
      }
    }

    if (controls) {
      controls.update();
    }
  });

  return null;
}

function SceneContent() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const sites = useTwinStore((state) => state.sites);
  const selection = useTwinStore((state) => state.selection);
  const statusFilter = useTwinStore((state) => state.statusFilter);
  const selectSite = useTwinStore((state) => state.selectSite);
  const selectDevice = useTwinStore((state) => state.selectDevice);
  const selectComponent = useTwinStore((state) => state.selectComponent);

  const selectedSite = getSelectedSite(sites, selection);

  const controlsConfig: OrbitControlsProps = useMemo(
    () => ({
      enablePan: selection.level !== "component",
      enableRotate: true,
      enableZoom: true,
      enableDamping: true,
      dampingFactor: 0.08,
      maxPolarAngle: selection.level === "sites" ? 1.24 : 1.36,
      minDistance: selection.level === "component" ? 1.4 : 2.2,
      maxDistance: selection.level === "sites" ? 70 : 40,
      makeDefault: false
    }),
    [selection.level]
  );

  const visibleSites = useMemo(() => {
    if (statusFilter === "all") return sites;
    return sites.filter((site) => {
      if (matchesFilter(site.status, statusFilter)) return true;
      return site.devices.some((device) => {
        if (matchesFilter(device.status, statusFilter)) return true;
        return device.components.some((component) => matchesFilter(component.status, statusFilter));
      });
    });
  }, [sites, statusFilter]);

  return (
    <>
      <color attach="background" args={[new Color("#0b0f12")]} />
      <fog attach="fog" args={["#0b0f12", 24, 90]} />

      <ambientLight intensity={0.76} color="#c2ced8" />
      <hemisphereLight args={["#c4d5e2", "#0f151a", 0.22]} />
      <directionalLight
        position={[16, 24, 12]}
        intensity={1.14}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#10161b" roughness={0.95} metalness={0.02} />
      </mesh>

      <gridHelper args={[120, 36, "#1f2b33", "#1a242b"]} position={[0, -0.32, 0]} />

      {visibleSites.length === 0 ? (
        <Html center zIndexRange={[2, 0]}>
          <div className="scene-label">No entities for current filter.</div>
        </Html>
      ) : (
        visibleSites.map((site) => {
          const isSelectedSite = site.id === selection.siteId;
          const dimSite = selection.level !== "sites" && !isSelectedSite;

          return (
            <group key={site.id}>
              <SitePlatform
                site={site}
                selected={isSelectedSite}
                dimmed={dimSite}
                showLabel={selection.level === "sites" || (selection.level === "site" && isSelectedSite)}
                onSelect={selectSite}
              />

              {isSelectedSite && selection.level !== "sites" && (
                <group position={site.position}>
                  {site.devices.map((device) => {
                    const isSelectedDevice = device.id === selection.deviceId;
                    const shouldShowDevice =
                      matchesFilter(device.status, statusFilter) ||
                      device.components.some((component) => matchesFilter(component.status, statusFilter)) ||
                      isSelectedDevice;

                    if (!shouldShowDevice) {
                      return null;
                    }

                    const dimDevice = (selection.level === "device" || selection.level === "component") && !isSelectedDevice;

                    return (
                      <group key={device.id}>
                        <DeviceBlock
                          device={device}
                          selected={isSelectedDevice}
                          dimmed={dimDevice}
                          showLabel={selection.level === "device" && isSelectedDevice}
                          onSelect={(deviceId) => selectDevice(site.id, deviceId)}
                        />

                        {(selection.level === "device" || selection.level === "component") && isSelectedDevice && (
                          <group position={device.position}>
                            {device.components.map((component) => {
                              const isSelectedComponent = component.id === selection.componentId;
                              const showComponent = matchesFilter(component.status, statusFilter) || isSelectedComponent;
                              if (!showComponent) {
                                return null;
                              }

                              const dimComponent = selection.level === "component" && !isSelectedComponent;

                              return (
                                <ComponentChip
                                  key={component.id}
                                  component={component}
                                  selected={isSelectedComponent}
                                  dimmed={dimComponent}
                                  showLabel={selection.level === "component" && isSelectedComponent}
                                  onSelect={(componentId) => selectComponent(site.id, device.id, componentId)}
                                />
                              );
                            })}
                          </group>
                        )}
                      </group>
                    );
                  })}
                </group>
              )}
            </group>
          );
        })
      )}

      <CameraRig controlsRef={controlsRef} />
      <OrbitControls ref={controlsRef} {...controlsConfig} />
    </>
  );
}

export default function TwinScene() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 20, 30],
        fov: 45,
        near: 0.1,
        far: 200
      }}
      dpr={[1, 1.7]}
      onCreated={({ gl }) => {
        gl.setClearColor("#0b0f12");
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
