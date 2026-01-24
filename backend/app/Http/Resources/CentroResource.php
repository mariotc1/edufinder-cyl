<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CentroResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
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
            'distance' => $this->when(isset($this->distance), fn() => round($this->distance, 2)),
        ];
    }
}
