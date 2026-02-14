<?php
namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

// SEEDER PRINCIPAL
// Ejecuta todos los seeders en el orden correcto
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CentrosSeeder::class,
            CiclosFpSeeder::class,
        ]);
    }
}
?>