import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { compressImage } from '../utils/compressImage';
import { uploadImage } from '../utils/uploadImage';
import { useNavigation } from '@react-navigation/native';
import { savePhoto } from '../utils/savePhoto';
import RNFS from 'react-native-fs';
import BackButton from '../components/BackButton';
import { COLORS } from '../theme/colors';

export default function CameraScreen() {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const navigation = useNavigation<any>();

  const [hasPermission, setHasPermission] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    try {
      if (!camera.current) return;

      const result = await camera.current.takePhoto();
      const originalPath = 'file://' + result.path;

      const compressedPath = await compressImage(originalPath);

      try {
        const originalStat = await RNFS.stat(
          originalPath.replace('file://', ''),
        );

        if (compressedPath) {
          const compressedStat = await RNFS.stat(
            compressedPath.replace('file://', ''),
          );
          setCompressedSize(compressedStat.size);
        }

        setOriginalSize(originalStat.size);
      } catch (e) {
        console.log('Size error', e);
      }

      const url = await uploadImage(compressedPath);

      if (url) {
        await savePhoto(url, originalPath);
      }

      setPhoto(compressedPath);
    } catch (e) {
      console.log('TakePhoto error', e);
    }
  };

  if (!device || !hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Opening Camera...</Text>
      </SafeAreaView>
    );
  }

  if (photo) {
    return (
      <SafeAreaView style={styles.previewContainer}>
        {/* Image */}
        <Image source={{ uri: photo }} style={styles.previewImage} />

        {/* Info Card */}
        {originalSize && compressedSize && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Original: {(originalSize / 1024).toFixed(2)} KB
            </Text>
            <Text style={styles.infoText}>
              Compressed: {(compressedSize / 1024).toFixed(2)} KB
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.accent }]}
            onPress={() => setPhoto(null)}
          >
            <Text style={styles.btnText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('Gallery')}
          >
            <Text style={styles.btnText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.cameraWrapper}>
      <BackButton navigation={navigation} />

      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!photo}
        photo={true}
      />

      <TouchableOpacity style={styles.capture} onPress={takePhoto} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  capture: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },

  previewContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  previewImage: {
    width: '100%',
    height: 350,
    borderRadius: 15,
  },

  infoCard: {
    backgroundColor: COLORS.light,
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    elevation: 3,
  },

  infoText: {
    color: '#000',
    fontSize: 14,
    marginBottom: 5,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },

  actionBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});