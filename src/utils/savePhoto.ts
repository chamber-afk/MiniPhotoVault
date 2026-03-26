import firestore from '@react-native-firebase/firestore';

export const savePhoto = async (
  url: string,
  path: string
) => {
  try {
    await firestore().collection('photos').add({
      url,
      path,
      createdAt: Date.now(),
    });
  } catch (e) {
    console.log(e);
  }
};