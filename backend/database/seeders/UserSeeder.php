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
            User::create([
                'name' => 'Administrador',
                'email' => $adminEmail,
                'password' => Hash::make('Admin1234!'), // Default secure password
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
