import type { ReactNode } from "react";
import { Lock } from "lucide-react";

import { EmptyState } from "../blocks/empty-state";

/** Props for `PermissionGate`. */
export type PermissionGateProps = {
  /** Whether the current user may see the content (resolved by the app's RBAC). */
  allowed: boolean;
  /** Content shown when allowed. */
  children: ReactNode;
  /** Shown when not allowed. Default: a lock `EmptyState`. Pass `null` to render nothing. */
  fallback?: ReactNode;
  /** Title of the default fallback. */
  title?: ReactNode;
  /** Description of the default fallback. */
  description?: ReactNode;
  /** Action of the default fallback (e.g. "Request access" button). */
  action?: ReactNode;
};

/**
 * Renders `children` only when `allowed`; otherwise a fallback. UI convenience only:
 * the server must enforce the permission as well.
 */
export function PermissionGate({
  allowed,
  children,
  fallback,
  title = "You don't have access to this",
  description = "Your role doesn't include permission to view this area. Contact your administrator if you need access.",
  action,
}: PermissionGateProps) {
  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return <EmptyState icon={<Lock />} title={title} description={description} action={action} role="status" />;
}
