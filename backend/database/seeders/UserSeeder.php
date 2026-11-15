<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists to avoid duplicates
        $adminEmail = 'admin@edufinder.com';

        if (!User::where('email', $adminEmail)->exists()) {
            // La contraseña se toma de ADMIN_PASSWORD; si no existe se genera una aleatoria
            // (nunca usar una contraseña por defecto conocida en producción)
            // forceCreate porque 'role' no es asignable en masa
            User::forceCreate([
                'name' => 'Administrador',
                'email' => $adminEmail,
                'password' => Hash::make(env('ADMIN_PASSWORD') ?: \Illuminate\Support\Str::random(32)),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
            $this->command->info('Admin user created: ' . $adminEmail);
        } else {
            $this->command->info('Admin user already exists.');
        }

        // Optional: Create some dummy users for testing if in local env
        if (app()->environment('local')) {
            User::factory(10)->create();
        }
    }
}
