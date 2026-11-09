import {
    useCallback,
    useContext,
    useMemo,
    createContext,
    type ReactNode,
} from "react";

import { useQuery,useQueryClient } from "@tanstack/react-query";
import type { loginInput } from "../schemas/auth.schema";

import { getCurrentUser,loginUser,logoutUser,type User } from "../services/auth.service";


const userQueryKey = ["auth","user"] as const;

type AuthContextValue = {
    user:User | null;
    isLoading:boolean;
    error:Error | null;
    login: (credentials:loginInput) => Promise<void>;
    logout:() => Promise<void>;
}


const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({children}:{children:ReactNode}){
    const queryClient = useQueryClient();

    const userQuery = useQuery<User | null, Error>({
        queryKey:userQueryKey,
        queryFn:getCurrentUser,
        retry:false,
    })

    const login = useCallback(async (credentials:loginInput) => {
        await loginUser(credentials)
        const result = await userQuery.refetch();

        if (result.isError){
            throw result.error;
        }

        if (!result.data){
            throw new Error("Login succeeded, but the server returned no user.")
        }

        await queryClient.invalidateQueries({queryKey:["todos"]})
    }, [queryClient, userQuery.refetch])

    const logout = useCallback(async () => {
        await logoutUser()

        queryClient.setQueryData(userQueryKey, null)

        queryClient.removeQueries({queryKey:["todos"]})
    }, [queryClient])

    const value = useMemo(() => ({
        user:userQuery.data ?? null,
        isLoading:userQuery.isPending,
        error:userQuery.error ?? null,
        login,
        logout,
    }),[userQuery.data,userQuery.isPending,userQuery.error,login,logout])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context){
        throw new Error("useAuth must be used inside an AuthProvider.")
    }

    return context
}