import { useEffect, useState } from "react";

export type StudioProfile = {
  name: string;
  studio: string;
  email: string;
  bio: string;
};

const defaultProfile: StudioProfile = {
  name: "Alex Lee",
  studio: "Alex Lee Studio",
  email: "hello@alexlee.studio",
  bio: "Independent brand designer helping thoughtful businesses find their point of view.",
};

function getStoredProfile(): StudioProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const stored = window.localStorage.getItem("studioflow-profile");
    return stored
      ? { ...defaultProfile, ...JSON.parse(stored) }
      : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function profileInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AL"
  );
}

export function useStudioProfile() {
  const [profile, setProfile] = useState<StudioProfile>(getStoredProfile);

  useEffect(() => {
    const refresh = () => setProfile(getStoredProfile());
    window.addEventListener("studioflow-profile-updated", refresh);
    return () =>
      window.removeEventListener("studioflow-profile-updated", refresh);
  }, []);

  return profile;
}

export function saveStudioProfile(profile: StudioProfile) {
  window.localStorage.setItem("studioflow-profile", JSON.stringify(profile));
  window.dispatchEvent(new Event("studioflow-profile-updated"));
}

