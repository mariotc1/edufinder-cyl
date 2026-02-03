<?php
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration {

        public function up(): void {
            Schema::table('users', function (Blueprint $table) {
                $table->string('google_id')->nullable()->after('password');
                $table->string('foto_perfil')->nullable()->after('google_id');
                $table->decimal('ubicacion_lat', 10, 8)->nullable()->after('foto_perfil');
                $table->decimal('ubicacion_lon', 11, 8)->nullable()->after('ubicacion_lat');
            });
        }

        public function down(): void {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['google_id', 'foto_perfil', 'ubicacion_lat', 'ubicacion_lon']);
            });
        }
    };
?>