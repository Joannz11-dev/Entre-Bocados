import React from 'react';
import { Redirect } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { JuicyTabList, TAB_STOPS, TabButton } from '../../components/kit/tab-bar';
import { useAuth } from '../../state/auth';

export default function TabsLayout() {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <JuicyTabList>
          {TAB_STOPS.map(stop => (
            <TabTrigger key={stop.name} name={stop.name} href={stop.href} asChild>
              <TabButton stop={stop} />
            </TabTrigger>
          ))}
        </JuicyTabList>
      </TabList>
    </Tabs>
  );
}
