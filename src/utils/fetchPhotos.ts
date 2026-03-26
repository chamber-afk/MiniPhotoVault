import firestore from '@react-native-firebase/firestore';

export const fetchPhotos = async () => {
  const snapshot = await firestore()
    .collection('photos')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,   // ✅ add id
      url: data.url as string,
      path: data.path as string,
    };
  });
};