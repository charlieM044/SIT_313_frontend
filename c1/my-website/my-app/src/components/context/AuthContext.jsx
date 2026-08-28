import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';


const AuthContext = createContext({ user: null, isLoggedIn: false });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(auth?.currentUser ?? null);

    useEffect(() => {
        if (!auth) return undefined;
        return onAuthStateChanged(auth, (u) => setUser(u));
    }, []);

    const value = { user, isLoggedIn: Boolean(user) };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}