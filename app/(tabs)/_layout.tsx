import { Tabs } from 'expo-router';
import { Home, Wheat, Bug, BarChart3 } from 'lucide-react-native';
import { useCrop } from '@/context/CropContext';
import { View, StyleSheet } from 'react-native';

const CAFE_COLOR = '#5C3D1E';
const HASS_COLOR = '#2D6A2D';

export default function TabLayout() {
  const { selectedCrop } = useCrop();
  const activeColor = selectedCrop === 'cafe' ? CAFE_COLOR : HASS_COLOR;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="harvest"
        options={{
          title: 'Cosecha',
          tabBarIcon: ({ size, color }) => <Wheat size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="pests"
        options={{
          title: 'Plagas',
          tabBarIcon: ({ size, color }) => <Bug size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
  },
});
