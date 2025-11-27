export interface Listing {
    id: string;
    title: string;
    price: number;
    address: string;
    photos: { url: string }[];
    status: 'AVAILABLE' | 'RENTED' | 'UNAVAILABLE';
    createdAt: string;
    lat?: number;
    lng?: number;
    city?: string;
    district?: string;
    ward?: string;
    area?: number;
    description?: string;
}
