import firestore from '@react-native-firebase/firestore';

export const deletePhoto = async (id: string) => {
  try {
    await firestore()
      .collection('photos')
      .doc(id)
      .delete();
  } catch (e) {
    console.log('Delete error', e);
  }
};