import { apiRequest } from './client';
import type { District, Province, Sector } from './types';

export function getProvinces() {
  return apiRequest<{ provinces: Province[] }>('/locations/provinces');
}

export function getDistricts(province_id?: number) {
  return apiRequest<{ districts: District[] }>('/locations/districts', {
    query: { province_id },
  });
}

export function getSectors(district_id: number) {
  return apiRequest<{ sectors: Sector[] }>(`/locations/sectors/${district_id}`);
}
