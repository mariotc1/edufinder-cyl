<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// REPARACIÓN DE search_logs
// La migración original se modificó después de ejecutarse en algunos entornos, que se quedaron
// sin las columnas filters/ip_address y con query NOT NULL: el log de búsquedas fallaba en silencio
return new class extends Migration {
    public function up(): void
    {
        Schema::table('search_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('search_logs', 'filters')) {
                $table->json('filters')->nullable();
            }
            if (!Schema::hasColumn('search_logs', 'ip_address')) {
                $table->string('ip_address', 45)->nullable();
            }
            $table->string('query')->nullable()->change();
        });
    }

    public function down(): void
    {
        // No se revierte: las columnas forman parte del esquema esperado por la migración original
    }
};
