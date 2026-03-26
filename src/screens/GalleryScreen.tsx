import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { fetchPhotos } from '../utils/fetchPhotos';
import { NativeModules } from 'react-native';
import BackButton from '../components/BackButton';
import { COLORS } from '../theme/colors';
import { deletePhoto } from '../utils/deletePhoto';

const { ExifModule } = NativeModules;

export default function GalleryScreen({ navigation }: any) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchPhotos();

        setPhotos(data);

        data.forEach(item => {
          if (typeof item.path === 'string') {
            loadExif(item.path);
          }
        });
      } catch (e) {
        console.log(e);
        setError('Failed to load photos');
      } finally {
        setLoading(false);
      }
    };
    loadPhotos();
  }, []);

  const loadExif = async (path: string) => {
    try {
      const cleanPath = path.replace('file://', '');

      const data = await ExifModule.getExif(cleanPath);

      console.log('EXIF data:', cleanPath, data);

      setMetadata((prev: any) => ({
        ...prev,
        [path]: data,
      }));
    } catch (e) {
      console.log('EXIF error', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      const data = await fetchPhotos();

      setPhotos(data);
      setMetadata({});

      data.forEach(item => {
        if (typeof item.path === 'string') {
          loadExif(item.path);
        }
      });
    } catch (e) {
      console.log(e);
      setError('Failed to refresh');
    }
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deletePhoto(id);

    const updated = photos.filter(p => p.id !== id);

    setPhotos(updated);
  };
  const renderItem = ({ item }: any) => {
    if (!item.url) return null;

    const exif = metadata[item.path];

    return (
      <View style={styles.card}>
        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteText}>X</Text>
        </TouchableOpacity>

        <Image source={{ uri: String(item.url) }} style={styles.image} />

        {exif && (
          <View style={styles.meta}>
            <Text>Model: {exif.model}</Text>
            <Text>Date: {exif.date}</Text>
            <Text>Lat: {exif?.lat || 'N/A'}</Text>
            <Text>Lon: {exif?.lon || 'N/A'}</Text>
          </View>
        )}
      </View>
    );
  };
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No photos found</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <BackButton navigation={navigation} />

      <FlatList
        data={photos}
        keyExtractor={(item, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },

  card: {
    margin: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
  },

  image: {
    height: 200,
    width: '100%',
  },

  meta: {
    padding: 10,
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
