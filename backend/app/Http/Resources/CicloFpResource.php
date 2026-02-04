<?php
    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\JsonResource;

    // RECURSO API PARA CICLO FP
    // Transforma el modelo CicloFp en una respuesta JSON
    class CicloFpResource extends JsonResource {

        public function toArray(Request $request): array {
            return [
                'id' => $this->id,
                'centro_id' => $this->centro_id,
                'familia_profesional' => $this->familia_profesional,
                'codigo_familia' => $this->codigo_familia,
                'nivel_educativo' => $this->nivel_educativo,
                'clave_ciclo' => $this->clave_ciclo,
                'ciclo_formativo' => $this->ciclo_formativo,
                'modalidad' => $this->modalidad,
                'tipo_ensenanza' => $this->tipo_ensenanza,
                
                // Incluir el centro relacionado si está cargado
                'centro' => new CentroResource($this->whenLoaded('centro')),
            ];
        }
    }
?>