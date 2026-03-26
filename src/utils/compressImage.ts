import ImageResizer from 'react-native-image-resizer';

export const compressImage = async (path: string) => {
  try {
    const result = await ImageResizer.createResizedImage(
      path,
      800, // width
      800, // height
      'JPEG',
      70 // quality (70%)
    );

    return result.uri;
  } catch (error) {
    console.log('Compression error', error);
    return path;
  }
};