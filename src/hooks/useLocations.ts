import { useEffect, useMemo, useState, useCallback } from 'react';
import * as locationsApi from '@/api/locations';
import type { District, Province, Sector } from '@/api/types';

// Module-level cache — provinces/districts rarely change within a session,
// so every component using this hook shares one fetch instead of re-requesting.
let provincesCache: Province[] | null = null;
let districtsCache: District[] | null = null;
const sectorsCache = new Map<number, Sector[]>();

export function useLocations() {
  const [provinces, setProvinces] = useState<Province[]>(provincesCache ?? []);
  const [districts, setDistricts] = useState<District[]>(districtsCache ?? []);
  const [loading, setLoading] = useState(!provincesCache || !districtsCache);

  useEffect(() => {
    if (provincesCache && districtsCache) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([locationsApi.getProvinces(), locationsApi.getDistricts()])
      .then(([p, d]) => {
        if (cancelled) return;
        provincesCache = p.provinces;
        districtsCache = d.districts;
        setProvinces(p.provinces);
        setDistricts(d.districts);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const districtsByProvince = useMemo(() => {
    const map = new Map<string, District[]>();
    for (const d of districts) {
      const key = d.province || '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return map;
  }, [districts]);

  const getSectors = useCallback(async (districtId: number): Promise<Sector[]> => {
    if (sectorsCache.has(districtId)) return sectorsCache.get(districtId)!;
    try {
      const { sectors } = await locationsApi.getSectors(districtId);
      sectorsCache.set(districtId, sectors);
      return sectors;
    } catch {
      return [];
    }
  }, []);

  return { provinces, districts, districtsByProvince, getSectors, loading };
}

/** Cascading province -> district -> sector selection state, ready to wire into 3 <select>s. */
export function useLocationPicker() {
  const { provinces, districts, getSectors, loading } = useLocations();
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [sectorId, setSectorId] = useState<number | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(false);

  const filteredDistricts = useMemo(() => {
    if (!provinceId) return districts;
    const province = provinces.find((p) => p.id === provinceId);
    if (!province) return districts;
    return districts.filter((d) => d.province === province.name);
  }, [districts, provinces, provinceId]);

  useEffect(() => {
    if (!districtId) {
      setSectors([]);
      setSectorId(null);
      return;
    }
    let cancelled = false;
    setSectorsLoading(true);
    getSectors(districtId)
      .then((s) => !cancelled && setSectors(s))
      .finally(() => !cancelled && setSectorsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [districtId, getSectors]);

  const selectProvince = useCallback((id: number | null) => {
    setProvinceId(id);
    setDistrictId(null);
    setSectorId(null);
  }, []);

  const selectDistrict = useCallback((id: number | null) => {
    setDistrictId(id);
    setSectorId(null);
  }, []);

  return {
    provinces,
    districts: filteredDistricts,
    sectors,
    provinceId,
    districtId,
    sectorId,
    selectProvince,
    selectDistrict,
    selectSector: setSectorId,
    loading,
    sectorsLoading,
  };
}
