import axios from 'axios';
import Config from 'react-native-config';

const CLOUD_NAME = Config.CLOUD_NAME;
const UPLOAD_PRESET = Config.UPLOAD_PRESET;

export const uploadImage = async (imageUri: string) => {
  try {
    const data = new FormData();

    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    data.append('upload_preset', UPLOAD_PRESET);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('Upload response : cloudinary response', res.data);
    return res.data.secure_url;
  } catch (error) {
    console.log('Upload error', error);
    return null;
  }
};