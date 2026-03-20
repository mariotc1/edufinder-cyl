<?php
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration {

        public function up(): void {
            // TABLA: BÚSQUEDAS GUARDADAS
            // Permite a los usuarios guardar combinaciones de filtros
            Schema::create('saved_searches', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('name', 100);
                $table->json('filters');
                $table->timestamps();
            });
        }

        public function down(): void {
            Schema::dropIfExists('saved_searches');
        }
    };
?>
