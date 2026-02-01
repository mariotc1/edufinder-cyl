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
        Schema::create('data_sync_states', function (Blueprint $table) {
            $table->id();
            $table->string('dataset')->unique(); // 'centros', 'ciclos_fp'
            $table->timestamp('last_sync_at')->nullable();
            $table->string('status')->default('pending'); // pending, running, completed, failed
            $table->integer('records_processed')->default(0);
            $table->integer('records_created')->default(0);
            $table->integer('records_updated')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        Schema::table('centros', function (Blueprint $table) {
            $table->string('data_hash')->nullable()->index()->after('longitud');
        });

        Schema::table('ciclos_fp', function (Blueprint $table) {
            $table->string('data_hash')->nullable()->index()->after('tipo_ensenanza');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ciclos_fp', function (Blueprint $table) {
            $table->dropColumn('data_hash');
        });

        Schema::table('centros', function (Blueprint $table) {
            $table->dropColumn('data_hash');
        });

        Schema::dropIfExists('data_sync_states');
    }
};
