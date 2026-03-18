import type { ReactNode } from "react";

import ProtectedLayoutEffects from "./_components/ProtectedLayoutEffects";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <ProtectedLayoutEffects>{children}</ProtectedLayoutEffects>;
}
