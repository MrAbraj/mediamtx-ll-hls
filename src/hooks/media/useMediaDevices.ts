import { useEffect, useState } from "react";

export interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

export function useMediaDevices() {
  const [microphones, setMicrophones] = useState<MediaDeviceOption[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceOption[]>([]);

  useEffect(() => {
    async function loadDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();

      setMicrophones(
        devices
          .filter(d => d.kind === "audioinput")
          .map(d => ({
            deviceId: d.deviceId,
            label: d.label || "Microphone",
          })),
      );

      setCameras(
        devices
          .filter(d => d.kind === "videoinput")
          .map(d => ({
            deviceId: d.deviceId,
            label: d.label || "Camera",
          })),
      );
    }

    loadDevices();

    navigator.mediaDevices.addEventListener(
      "devicechange",
      loadDevices,
    );

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        loadDevices,
      );
    };
  }, []);

  return {
    microphones,
    cameras,
  };
}