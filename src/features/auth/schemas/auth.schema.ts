import { z } from 'zod';

const passwordSchema = z.string().min(8,'Password must be atleast 8 characters')
.max(100);

export const loginSchema = z.object({
    email:z.string().email('Please enter a valid email address'),
    password:passwordSchema,
})

export const signUpSchema = z.object({
    username:z.string().min(4, 'Username must be atleast 4 characters'),
    email:z.string().email('Please enter a valid email address'),
    password:passwordSchema,
    confirmPassword:z.string(),
}).refine((data) => data.password == data.confirmPassword, {
    message:"Passwords don't match",
    path:["confirmPassword"],
})

export type loginInput = z.infer<typeof loginSchema>
export type signUpInput = z.infer<typeof signUpSchema>