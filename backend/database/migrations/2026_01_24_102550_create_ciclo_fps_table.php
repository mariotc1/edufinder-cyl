<?php
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration {

        public function up(): void {
            // TABLA: CICLOS_FP
            // Almacena la oferta educativa de FP por centro
            Schema::create('ciclos_fp', function (Blueprint $table) {
                $table->id();            
                // FK: Borrado en cascada si se elimina el centro
                $table->foreignId('centro_id')->constrained('centros')->onDelete('cascade');
                $table->string('familia_profesional')->nullable();
                $table->string('codigo_familia')->nullable();
                $table->string('nivel_educativo')->nullable();
                $table->string('clave_ciclo')->nullable();
                $table->string('ciclo_formativo');
                $table->string('modalidad')->nullable();
                $table->string('tipo_ensenanza')->nullable();
                $table->timestamps();
            });
        }

        public function down(): void {
            Schema::dropIfExists('ciclos_fp');
        }
    };
?>