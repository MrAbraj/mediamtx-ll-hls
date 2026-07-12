import { HostProvider } from "@/context/HostContext";
import { HostView } from "@/components/host/HostView";

export default function HostPage() {
  return (
    <HostProvider>
      <HostView />
    </HostProvider>
  );
}
