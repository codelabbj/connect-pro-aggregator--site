'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            const user = authService.getUser();
            const token = authService.getAccessToken();

            if (!token && !pathname?.startsWith('/login')) {
                router.push('/login');
            } else if (user) {
                setUser(user);
            }
            setLoading(false);
        };
        checkAuth();
    }, [pathname, router]);

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        setUser(data.user);
        router.push('/');
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
