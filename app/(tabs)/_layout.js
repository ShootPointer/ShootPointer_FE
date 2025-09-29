import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          if (route.name === 'index') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'capture') iconName = focused ? 'camera' : 'camera-outline';
          else if (route.name === 'community') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'mypage') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff6a33',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111' },
      })}
    >
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="capture" options={{ title: '촬영' }} />
      <Tabs.Screen name="community" options={{ title: '커뮤니티' }} />
      <Tabs.Screen name="mypage" options={{ title: '마이페이지' }} />
    </Tabs>
  );
}
