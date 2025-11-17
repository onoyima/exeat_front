
// Helper function to get cookie value
export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

// Helper function to safely extract role name from role objects
export const extractRoleName = (role: any): string => {
    if (!role) return 'Unknown Role';

    // Handle different role object structures
    if (typeof role === 'string') return role;
    if (typeof role === 'object') {
        // Handle staff role assignment objects like { role: { name: 'admin' } }
        if (role.role && typeof role.role === 'object' && role.role.name) {
            return role.role.name;
        }
        // Handle direct role objects like { name: 'admin' }
        if (role.name) {
            return role.name;
        }
        // Handle role objects with display_name like { display_name: 'Admin' }
        if (role.display_name) {
            return role.display_name;
        }
    }

    return 'Unknown Role';
};



