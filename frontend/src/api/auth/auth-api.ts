import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthService } from "./auth-service";

export const useMe = () => {
    return useQuery({
        queryFn: AuthService.me,
        queryKey: ["me"],
        refetchOnMount: true,
        refetchInterval: 6000 * 10,
    });
};

export const useLogin = () => {
    return useMutation({
        mutationFn: AuthService.login,
        mutationKey: ["login"],
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: AuthService.register,
        mutationKey: ["register"],
    })
};

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: AuthService.updateUser,
        mutationKey: ["user"],
    });
};