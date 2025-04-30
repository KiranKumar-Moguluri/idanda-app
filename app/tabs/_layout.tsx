import React from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const router = useRouter();
  const path = usePathname();

  return (
    <>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/tabs/home' })} style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color={path === '/tabs/home' ? '#4C8BF5' : '#555'} />
          <Text style={[styles.navText, path === '/tabs/home' && styles.activeText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push({ pathname: '/tabs/createPost' })} style={styles.navItem}>
          <Ionicons name="add-circle-outline" size={24} color={path === '/createPost' ? '#4C8BF5' : '#555'} />
          <Text style={[styles.navText, path === '/createPost' && styles.activeText]}>Create Post</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push({ pathname: '/tabs/profile' })} style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color={path === '/tabs/profile' ? '#4C8BF5' : '#555'} />
          <Text style={[styles.navText, path === '/tabs/profile' && styles.activeText]}>Profile</Text>
        </TouchableOpacity>
      </View>

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
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#555', marginTop: 4 },
  activeText: { color: '#4C8BF5', fontWeight: 'bold' },
});
