<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sync_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sync_log_id')->constrained()->cascadeOnDelete();
            $table->string('dataset'); // centros | ciclos_fp
            $table->string('entity_label'); // nombre del centro / ciclo, para mostrar sin joins
            $table->string('change_type'); // created | updated
            $table->json('changes')->nullable(); // {campo: [antes, despues]}
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_changes');
    }
};
