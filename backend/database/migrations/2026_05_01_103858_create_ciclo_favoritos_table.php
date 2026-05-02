<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * TABLA: CICLO_FAVORITOS
     *
     * Permite a los usuarios marcar ciclos específicos como favoritos.
     * Esto mejora las recomendaciones al saber exactamente qué ciclos
     * le interesan al usuario, no solo qué centros.
     */
    public function up(): void
    {
        Schema::create('ciclo_favoritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('ciclo_id')->constrained('ciclos_fp')->onDelete('cascade');
            $table->timestamps();

            // Un usuario solo puede dar like una vez a cada ciclo
            $table->unique(['user_id', 'ciclo_id']);

            // Índice para búsquedas rápidas por usuario
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ciclo_favoritos');
    }
};
