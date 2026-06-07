<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        // TABLA: RESULTADOS DEL TEST DE ORIENTACIÓN FP
        // Almacena el último análisis completado por cada usuario
        Schema::create('fp_quiz_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('result');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique('user_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('fp_quiz_results');
    }
};
