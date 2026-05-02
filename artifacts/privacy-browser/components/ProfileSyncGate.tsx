import React, { useEffect, useRef } from 'react';
import { useBrowser } from '@/context/BrowserContext';
import { useProfiles } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';

export function ProfileSyncGate({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useProfiles();
  const { loadProfile, currentProfileId } = useBrowser();
  const { setCurrentProfileId } = useSettings();
  const initialized = useRef(false);

  useEffect(() => {
    if (activeProfile && (!initialized.current || currentProfileId !== activeProfile.id)) {
      initialized.current = true;
      loadProfile(activeProfile.id);
      setCurrentProfileId(activeProfile.id);
    }
  }, [activeProfile?.id]);

  return <>{children}</>;
}
