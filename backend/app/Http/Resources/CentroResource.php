<?php
    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\JsonResource;

    // RECURSO API PARA CENTRO
    // Transforma el modelo Centro en una respuesta JSON estandarizada
    class CentroResource extends JsonResource {

        public function toArray(Request $request): array {
            return [
                // Campos expuestos en la API
                'id' => $this->id,
                'codigo' => $this->codigo,
                'nombre' => $this->nombre,
                'naturaleza' => $this->naturaleza,
                'denominacion_generica' => $this->denominacion_generica,
                'provincia' => $this->provincia,
                'municipio' => $this->municipio,
                'localidad' => $this->localidad,
                'telefono' => $this->telefono,
                'email' => $this->email,
                'web' => $this->web,
                'codigo_postal' => $this->codigo_postal,
                'direccion' => $this->direccion,
                'latitud' => $this->latitud,
                'longitud' => $this->longitud,
                
                // incluye la distancia solo si fue calculada
                'distance' => $this->when(isset($this->distance), fn() => round($this->distance, 2)),
                
                // incluye los ciclos solo si fueron cargados para evitar queries N+1
                'ciclos' => CicloFpResource::collection($this->whenLoaded('ciclos')),
            ];
        }
    }
?>