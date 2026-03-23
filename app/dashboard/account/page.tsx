"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/common";
import { getProfile } from "@/lib/api/auth";
import {
  getDisplayNameFromEmail,
  getSessionUserFromToken,
  type SessionUser,
} from "@/lib/session";

export default function AccountPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenUser = getSessionUserFromToken();
    if (tokenUser) {
      setUser(tokenUser);
    }

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setUser((current) => ({
            ...current,
            id: profile.id ?? current?.id,
            email: profile.email ?? current?.email,
            role: profile.role ?? current?.role,
            firstName: profile.firstName ?? current?.firstName,
            lastName: profile.lastName ?? current?.lastName,
          }));
        }
      } catch {
        // Keep token-based values as fallback when profile fails.
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const fullName = useMemo(() => {
    const joined = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return joined || getDisplayNameFromEmail(user?.email) || "Not available";
  }, [user?.email, user?.firstName, user?.lastName]);

  const expiresAt = useMemo(() => {
    if (!user?.exp) {
      return "Not available";
    }

    return new Date(user.exp * 1000).toLocaleString();
  }, [user?.exp]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Account"
        description="Details of the currently logged-in user"
      />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading account details...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Full name" value={fullName} />
            <InfoItem label="Email" value={user?.email || "Not available"} />
            <InfoItem label="Role" value={user?.role || "Not available"} />
            <InfoItem label="User ID" value={user?.id || "Not available"} />
            <InfoItem label="Session expires" value={expiresAt} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-medium text-foreground">{value}</p>
    </div>
  );
}
