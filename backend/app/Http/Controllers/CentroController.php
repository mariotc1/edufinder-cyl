<?php

namespace App\Http\Controllers;

use App\Models\Centro;
use App\Http\Resources\CentroResource;
use App\Http\Resources\CicloFpResource;
use Illuminate\Http\Request;

class CentroController extends Controller
{
    public function index(Request $request)
    {
        $query = Centro::query();

        if ($request->has('provincia')) {
            $query->where('provincia', 'ilike', '%' . $request->provincia . '%');
        }

        if ($request->has('municipio')) {
            $query->where('municipio', 'ilike', '%' . $request->municipio . '%');
        }

        if ($request->has('localidad')) {
            $query->where('localidad', 'ilike', '%' . $request->localidad . '%');
        }

        if ($request->has('naturaleza')) {
            $query->where('naturaleza', 'ilike', '%' . $request->naturaleza . '%');
        }

        if ($request->has('denominacion_generica')) {
            $query->where('denominacion_generica', 'ilike', '%' . $request->denominacion_generica . '%');
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'ilike', "%{$search}%")
                    ->orWhere('denominacion_generica', 'ilike', "%{$search}%")
                    ->orWhere('provincia', 'ilike', "%{$search}%")
                    ->orWhere('municipio', 'ilike', "%{$search}%");
            });
        }

        // Advanced Filters (Relations)
        if ($request->has('nivel')) {
            $query->whereHas('ciclos', function ($q) use ($request) {
                $q->where('nivel', 'ilike', '%' . $request->nivel . '%');
            });
        }

        if ($request->has('familia')) {
            $query->whereHas('ciclos', function ($q) use ($request) {
                $q->where('familia_profesional', 'ilike', '%' . $request->familia . '%');
            });
        }

        if ($request->has('modalidad')) {
            $query->whereHas('ciclos', function ($q) use ($request) {
                $q->where('modalidad', 'ilike', '%' . $request->modalidad . '%');
            });
        }

        // Geolocation Radius Filter
        if ($request->has(['lat', 'lon', 'radius'])) {
            $lat = $request->lat;
            $lon = $request->lon;
            $radius = $request->radius; // in km

            // Haversine formula
            $query->selectRaw("*, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitud ) ) * cos( radians( longitud ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitud ) ) ) ) AS distance", [$lat, $lon, $lat])
                ->havingRaw("distance < ?", [$radius])
                ->orderBy("distance");
        } else {
            $query->orderBy('nombre');
        }

        if ($request->has('map')) {
            return CentroResource::collection($query->limit(2000)->get());
        }

        return CentroResource::collection($query->paginate(20));
    }

    public function show($id)
    {
        $centro = Centro::findOrFail($id);
        return new CentroResource($centro);
    }

    public function ciclos($id)
    {
        $centro = Centro::findOrFail($id);
        return CicloFpResource::collection($centro->ciclos);
    }
}
