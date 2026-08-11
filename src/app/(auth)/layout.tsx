import * as React from "react";
import { SpatialAuthLayout } from "@/features/auth/components/spatial-auth-layout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <SpatialAuthLayout>{children}</SpatialAuthLayout>;
}
