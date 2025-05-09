import logger from '@/lib/logger';

import { aiUrl } from '@/constant/env';

export const sendImageForDetection = async (imageBlob: Blob) => {
  try {
    const formData = new FormData();
    formData.append('file', imageBlob);

    const response = await fetch(`${aiUrl}/track_faces`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    logger(error, '[API] sendImageForDetection');
  }
};
