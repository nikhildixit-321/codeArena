import { BASE_URL } from '../api/axios';

export const formatAvatarUrl = (avatar) => {
    if (!avatar) return null;

    // Handle full URLs
    if (avatar.startsWith('http')) {
        // If we are on production but the URL is localhost, try fixing it
        if (!window.location.hostname.includes('localhost') && avatar.includes('localhost')) {
            return avatar.replace(/^http:\/\/localhost:\d+/, BASE_URL.replace(/\/$/, ''));
        }
        return avatar;
    }

    // Handle relative paths
    const cleanBase = BASE_URL.replace(/\/$/, '');
    const cleanAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${cleanBase}${cleanAvatar}`;
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
