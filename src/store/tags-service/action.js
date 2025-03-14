const API_URL = process.env.REACT_APP_API_URL;

export const fetchSuggestions = async (query) => {
    if (!query.trim() || /^[-+*/]?\d+$/.test(query)) return [];
    const response = await fetch(`${API_URL}/autocomplete`);
    const result = await response.json();
    return Array.isArray(result) ? result.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    ) : [];
};
