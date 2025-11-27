import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface ListingsFilters {
    q?: string;
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    amenities?: string[];
    lat?: number;
    lng?: number;
    radius?: number;
    status?: 'AVAILABLE' | 'RENTED';
    sortBy?: 'price_asc' | 'price_desc' | 'created_asc' | 'created_desc' | 'distance';
    page?: number;
    limit?: number;
    city?: string;
    district?: string;
}

export const useListings = (filters: ListingsFilters = {}) => {
    return useQuery({
        queryKey: ['listings', filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filters.q) params.append('q', filters.q);
            if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
            if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
            if (filters.areaMin !== undefined) params.append('areaMin', filters.areaMin.toString());
            if (filters.areaMax !== undefined) params.append('areaMax', filters.areaMax.toString());
            if (filters.lat !== undefined) params.append('lat', filters.lat.toString());
            if (filters.lng !== undefined) params.append('lng', filters.lng.toString());
            if (filters.radius !== undefined) params.append('radius', filters.radius.toString());
            if (filters.status) params.append('status', filters.status);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.city) params.append('city', filters.city);
            if (filters.district) params.append('district', filters.district);

            if (filters.amenities && filters.amenities.length > 0) {
                filters.amenities.forEach(amenity => params.append('amenities[]', amenity));
            }

            const response = await api.get(`/listings?${params.toString()}`);
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
