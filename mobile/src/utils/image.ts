import { API_URL } from '../services/api';

export const getImageUrl = (url?: string | null, name: string = 'User') => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

    // If it's a local file URI, return as is
    if (url.startsWith('file://')) {
        return url;
    }

    // If it's already a full URL
    if (url.startsWith('http')) {
        // If it's localhost, replace with our API_URL host
        // This handles both Android Emulator (10.0.2.2) and Physical Device (LAN IP)
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            const apiHost = API_URL.split('://')[1].split(':')[0];
            return url.replace('localhost', apiHost).replace('127.0.0.1', apiHost);
        }
        return url;
    }

    // If it's a relative path, prepend API_URL
    if (url.startsWith('/')) {
        return `${API_URL}${url}`;
    }

    return `${API_URL}/${url}`;
};
