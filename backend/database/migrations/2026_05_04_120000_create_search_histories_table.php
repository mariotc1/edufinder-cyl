<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN: HISTORIAL DE BÚSQUEDAS
     * Almacena el historial de búsquedas de centros por usuario
     */
    public function up(): void
    {
        Schema::create('search_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('search_term', 255);
            $table->timestamps();

            // Índice compuesto para búsquedas eficientes
            $table->index(['user_id', 'created_at']);

            // Índice único para evitar duplicados (mismo usuario, mismo término)
            $table->unique(['user_id', 'search_term']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_histories');
    }
};
