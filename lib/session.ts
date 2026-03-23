export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER" | string;

export interface SessionUser {
  id?: string;
  email?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  exp?: number;
}

const TOKEN_KEY = "token";
const TOKEN_COOKIE_KEY = "crm_token";
const TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(`${normalized}${padding}`);
};

export const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_COOKIE_MAX_AGE}; samesite=lax`;
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
  }
};

export const getSessionUserFromToken = (): SessionUser | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1]));
    return {
      id: payload?.id,
      email: payload?.email,
      role: payload?.role,
      firstName: payload?.firstName,
      lastName: payload?.lastName,
      exp: payload?.exp,
    };
  } catch {
    return null;
  }
};

export const hasRole = (allowedRoles: UserRole[]) => {
  const user = getSessionUserFromToken();
  return Boolean(user?.role && allowedRoles.includes(user.role));
};

export const getInitials = (name?: string, email?: string) => {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }

  if (email?.trim()) {
    return email.charAt(0).toUpperCase();
  }

  return "U";
};

export const getDisplayNameFromEmail = (email?: string) => {
  if (!email?.trim()) {
    return "";
  }

  const localPart = email.split("@")[0] || "";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
