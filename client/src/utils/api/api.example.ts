import logger from '@/lib/logger';

const BASE_URL = '/api/your-endpoint';

interface YourResource {
  id: number;
  name: string;
}

// * CREATE - POST
export const createResource = async (
  payload: Partial<YourResource>,
): Promise<YourResource> => {
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Create failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] createResource');
    throw error;
  }
};

// * READ - GET (list)
export const getResources = async (): Promise<YourResource[]> => {
  try {
    const res = await fetch(BASE_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Fetch list failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] getResources');
    throw error;
  }
};

// * READ - GET (single item by id)
export const getResourceById = async (id: number): Promise<YourResource> => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Fetch resource ${id} failed`);
    }

    return data;
  } catch (error) {
    logger(error, '[API] getResourceById');
    throw error;
  }
};

// * UPDATE - PUT/PATCH (update full or partial)
export const updateResource = async (
  id: number,
  payload: Partial<YourResource>,
): Promise<YourResource> => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Update resource ${id} failed`);
    }

    return data;
  } catch (error) {
    logger(error, '[API] updateResource');
    throw error;
  }
};

// * DELETE - DELETE
export const deleteResource = async (
  id: number,
): Promise<{ message: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Delete resource ${id} failed`);
    }

    return data;
  } catch (error) {
    logger(error, '[API] deleteResource');
    throw error;
  }
};
