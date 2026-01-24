<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ciclos_fp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('centro_id')->constrained('centros')->onDelete('cascade');
            $table->string('familia_profesional')->nullable();
            $table->string('codigo_familia')->nullable();
            $table->string('nivel_educativo')->nullable(); // Grado Medio, Superior
            $table->string('clave_ciclo')->nullable();
            $table->string('ciclo_formativo');
            $table->string('modalidad')->nullable();
            $table->string('tipo_ensenanza')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ciclos_fp');
    }
};
