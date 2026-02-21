import { BASE_URL } from '../api/axios';

export const formatAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) {
        if (avatar.includes('localhost:5000')) {
            return avatar.replace('http://localhost:5000', BASE_URL);
        }
        return avatar;
    }
    return `${BASE_URL}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
};
