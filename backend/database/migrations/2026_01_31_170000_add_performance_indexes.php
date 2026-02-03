<?php
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    use Illuminate\Support\Facades\DB;

    return new class extends Migration {

        public function up(): void {
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');

            Schema::table('centros', function (Blueprint $table) {
                $table->index('provincia');
                $table->index('municipio');
                $table->index('naturaleza');
                $table->index('codigo');
            });

            Schema::table('ciclos_fp', function (Blueprint $table) {
                $table->index('familia_profesional');
                $table->index('nivel_educativo');
                $table->index('modalidad');
                $table->index('centro_id');     
            });

            DB::statement('CREATE INDEX centros_nombre_trgm_idx ON centros USING GIN (nombre gin_trgm_ops)');
            DB::statement('CREATE INDEX centros_denominacion_trgm_idx ON centros USING GIN (denominacion_generica gin_trgm_ops)');
            DB::statement('CREATE INDEX centros_provincia_trgm_idx ON centros USING GIN (provincia gin_trgm_ops)');
            DB::statement('CREATE INDEX centros_municipio_trgm_idx ON centros USING GIN (municipio gin_trgm_ops)');

            DB::statement('CREATE INDEX ciclos_fp_ciclo_formativo_trgm_idx ON ciclos_fp USING GIN (ciclo_formativo gin_trgm_ops)');
        }

        public function down(): void {
            Schema::table('centros', function (Blueprint $table) {
                $table->dropIndex(['provincia']);
                $table->dropIndex(['municipio']);
                $table->dropIndex(['naturaleza']);
                $table->dropIndex(['codigo']);
            });

            Schema::table('ciclos_fp', function (Blueprint $table) {
                $table->dropIndex(['familia_profesional']);
                $table->dropIndex(['nivel_educativo']);
                $table->dropIndex(['modalidad']);
                $table->dropIndex(['centro_id']);
            });

            DB::statement('DROP INDEX IF EXISTS centros_nombre_trgm_idx');
            DB::statement('DROP INDEX IF EXISTS centros_denominacion_trgm_idx');
            DB::statement('DROP INDEX IF EXISTS centros_provincia_trgm_idx');
            DB::statement('DROP INDEX IF EXISTS centros_municipio_trgm_idx');
            DB::statement('DROP INDEX IF EXISTS ciclos_fp_ciclo_formativo_trgm_idx');
        }
    };
?>