import { supabase } from "../lib/supabaseClient"

export async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error

    return data
}

export async function register(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: "user"
            }
        }
    })

    if (error) throw error

    return data
}

export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function isAdmin() {
    const user = await getCurrentUser()
    return user?.user_metadata?.['role'] === "admin"
}

export async function checkAdmin() {
    const user: any = await getCurrentUser()

    if (!user) return

    const role = user.user_metadata.role

    if (role === "admin") {
        console.log("Panel admin visible")
    } else {
        console.log("Usuario normal")
    }
}
