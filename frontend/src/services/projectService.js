const BASE_URL = 'http://localhost:4000/api/projects';

export const fetchFolders = async ({userId, token, depth=5}) => {
    try {
        const response = await fetch(`${BASE_URL}/${userId}?depth=${depth}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (!response.ok){
            console.error('Error fetching folders:', data);
            return {sucess: false, projects: []};
        }
        return {sucess: true, projects: data.projects};
    } catch (error) {
        console.error('Error fetching folders:', error);
        return {sucess: false, projects: []};
    }
};