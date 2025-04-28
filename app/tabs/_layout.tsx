import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* ✅ Custom Top Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push('/tabs/home')} style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color={pathname.includes('home') ? '#4C8BF5' : '#555'} />
          <Text style={[styles.navText, pathname.includes('home') && styles.activeText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/createPost')} style={styles.navItem}>
          <Ionicons name="add-circle-outline" size={24} color={pathname.includes('createPost') ? '#4C8BF5' : '#555'} />
          <Text style={[styles.navText, pathname.includes('createPost') && styles.activeText]}>Create Post</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/tabs/profile')} style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color={pathname.includes('profile') ? '#4C8BF5' : '#555'} />
          <Text style={[styles.navText, pathname.includes('profile') && styles.activeText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Screen Stack (Page Content) */}
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#555', marginTop: 4 },
  activeText: { color: '#4C8BF5', fontWeight: 'bold' },
});
