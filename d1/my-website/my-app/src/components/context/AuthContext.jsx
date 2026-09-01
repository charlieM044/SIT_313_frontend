import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
    loading: true,
    login: () => { },
    logout: () => { },
    refresh: () => { },
    planType: 'free',
    loginModalOpen: false,
    openLoginModal: () => { },
    closeLoginModal: () => { },
    upgradePlan: async () => { },
});

const API_BASE = 'http://localhost:3000/api/auth';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
    const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Session invalid or expired');
            const data = await res.json();
            setUser(data);
        } catch (err) {

            localStorage.removeItem('authToken');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);


    const login = useCallback((token, userData) => {
        localStorage.setItem('authToken', token);
        setUser(userData);
        setLoginModalOpen(false);
    }, []);

    const logout = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
        } catch {
            // even if the network call fails, still log out locally
        } finally {
            localStorage.removeItem('authToken');
            setUser(null);
        }
    }, []);

    // Upgrades the current user to a Paid plan. Sends (mock) payment details
    // to the backend, which is responsible for validating the charge and
    // persisting the new planType to Firestore. On success we optimistically
    // update local state so the UI reflects "Paid" immediately.
    const upgradePlan = useCallback(async (paymentDetails) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('You must be logged in to upgrade.');
        }

        const response = await fetch(`${API_BASE}/upgrade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ planType: 'paid', payment: paymentDetails }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.error || 'Payment could not be processed.');
        }

        // Prefer whatever the server sends back (source of truth), but fall
        // back to a local merge so the UI still updates if the backend only
        // returns { success: true }.
        setUser((prev) => (result.user ? result.user : { ...prev, planType: 'paid' }));

        return result;
    }, []);

    const value = {
        user,
        isLoggedIn: Boolean(user),
        loading,
        planType: user?.planType,
        login,
        logout,
        refresh: loadUser,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        upgradePlan,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
    return useContext(AuthContext);
}