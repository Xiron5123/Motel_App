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
            const response = await api.get('/listings', { params: filters });
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
