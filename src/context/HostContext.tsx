"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

interface HostContextValue {
  broadcastName: string;
  setBroadcastName: (name: string) => void;

  micEnabled: boolean;
  setMicEnabled: (enabled: boolean) => void;

  cameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;

  selectedMicDeviceId: string | null;
  setSelectedMicDeviceId: (id: string | null) => void;

  selectedCameraDeviceId: string | null;
  setSelectedCameraDeviceId: (id: string | null) => void;
}

const HostContext = createContext<HostContextValue | null>(null);

export function HostProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [broadcastName, setBroadcastName] =
    useState("Broadcast Studio");

  const [micEnabled, setMicEnabled] =
    useState(false);

  const [cameraEnabled, setCameraEnabled] =
    useState(false);

  const [
    selectedMicDeviceId,
    setSelectedMicDeviceId,
  ] = useState<string | null>(null);

  const [
    selectedCameraDeviceId,
    setSelectedCameraDeviceId,
  ] = useState<string | null>(null);

  return (
    <HostContext.Provider
      value={{
        broadcastName,
        setBroadcastName,

        micEnabled,
        setMicEnabled,

        cameraEnabled,
        setCameraEnabled,

        selectedMicDeviceId,
        setSelectedMicDeviceId,

        selectedCameraDeviceId,
        setSelectedCameraDeviceId,
      }}
    >
      {children}
    </HostContext.Provider>
  );
}

export function useHost() {
  const context = useContext(HostContext);

  if (!context) {
    throw new Error(
      "useHost must be used inside HostProvider",
    );
  }

  return context;
}