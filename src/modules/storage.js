const Storage = (() => {
    // Using a unique key for localStorage to prevent conflicts
    const STORAGE_KEY = "lsk_3x9vT7qZ2mNpC1LgYh4FWEbRoAuK8WDJ";

    // Save projects to localStorage
    const saveProjects = (projects) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true;
        } catch (error) {
            console.error("Error saving to localStorage:" + error);
            return false;
        }
    };

    // Load projects from localStorage
    const loadProjects = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error loading from localStorage:" + error);
            return [];
        }
    };

    // Check if localStorage is available in the browser
    const isAvailable = () => {
        try {
            const test = "test";
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    };

    return {
        saveProjects,
        loadProjects,
        isAvailable
    };
})();

export default Storage;