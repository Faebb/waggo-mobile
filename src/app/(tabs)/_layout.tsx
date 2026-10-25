import { Tabs } from 'expo-router';
import { type ColorValue } from 'react-native';

import { HomeIcon } from '@/shared/ui/icons/HomeIcon';
import { MapRouteIcon } from '@/shared/ui/icons/MapRouteIcon';
import { PawIcon } from '@/shared/ui/icons/PawIcon';
import { UserIcon } from '@/shared/ui/icons/UserIcon';
import { typography, useColors } from '@/shared/ui/theme';

/** react-navigation types the tab icon's color as the wider `ColorValue`; this app's palette is always a string. */
function asColor(color: ColorValue): string {
  return color as string;
}

/** Owner's main sections, always one tap away (ADR-019): detail screens still push on top, hiding this bar. */
export default function TabsLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: typography.micro.fontFamily, fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <HomeIcon color={asColor(color)} size={size} /> }}
      />
      <Tabs.Screen
        name="paseos/index"
        options={{
          title: 'Paseos',
          tabBarIcon: ({ color, size }) => <MapRouteIcon color={asColor(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="mascotas/index"
        options={{ title: 'Mascotas', tabBarIcon: ({ color, size }) => <PawIcon color={asColor(color)} size={size} /> }}
      />
      <Tabs.Screen
        name="configuracion/index"
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color, size }) => <UserIcon color={asColor(color)} size={size} />,
        }}
      />
    </Tabs>
  );
}
