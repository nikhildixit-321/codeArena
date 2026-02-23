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

export const getRank = (rating) => {
    if (rating < 800) return 'Bronze';
    if (rating < 1100) return 'Silver';
    if (rating < 1400) return 'Gold';
    if (rating < 1700) return 'Platinum';
    if (rating < 2000) return 'Diamond';
    if (rating < 2400) return 'Master';
    return 'Grandmaster';
};
