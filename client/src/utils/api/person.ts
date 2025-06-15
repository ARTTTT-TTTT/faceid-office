import logger from '@/lib/logger';

import { CreatePersonPayload, Person } from '@/types/person';

export const createPerson = async (
  payload: CreatePersonPayload,
): Promise<Person> => {
  const formData = new FormData();
  formData.append('profileImage', payload.profileImage);
  payload.faceImages.forEach((file) => {
    formData.append('faceImages', file);
  });
  formData.append('fullName', payload.fullName);
  formData.append('position', payload.position);

  try {
    const res = await fetch('/api/people', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Create person failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] createPerson');
    throw error;
  }
};

export const getPeople = async (): Promise<Person[]> => {
  try {
    const res = await fetch('/api/people', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Fetch people failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] getPeople');
    throw error;
  }
};
