import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tqiodegojsfginhiflfk.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("ERROR: Necesitas definir la variable de entorno SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = "info@telvia.io";
    const password = "docutelvia2025!!!";

    console.log(`Intentando crear el usuario administrador: ${email}...`);

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (authError) {
        if (authError.message.includes("already has been registered")) {
            console.log("El usuario ya existe en Auth. Procediendo a asegurar que sea admin...");
            // If user exists, find them
            const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
            const existingUser = usersData?.users.find(u => u.email === email);
            if (existingUser) {
                await setAdminRole(existingUser.id);
            }
        } else {
            console.error("Error al crear usuario en Auth:", authError.message);
        }
        return;
    }

    if (authData.user) {
        console.log("Usuario creado correctamente en Auth.");
        await setAdminRole(authData.user.id);
    }
}

async function setAdminRole(userId) {
    console.log(`Asignando rol 'admin' al usuario con ID: ${userId}...`);

    const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
            user_id: userId,
            role: 'admin'
        }, { onConflict: 'user_id,role' });

    if (roleError) {
        console.error("Error al asignar rol en la tabla user_roles:", roleError.message);
    } else {
        console.log("¡ÉXITO! Usuario info@telvia.io ahora es Administrador.");
    }
}

createAdmin();
