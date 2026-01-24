<?php

namespace App\Http\Controllers;

use App\Models\CicloFp;
use App\Http\Resources\CicloFpResource;
use Illuminate\Http\Request;

class CicloFpController extends Controller
{
    public function index(Request $request)
    {
        $query = CicloFp::with('centro');

        if ($request->has('familia_profesional')) {
            $query->where('familia_profesional', 'ilike', '%' . $request->familia_profesional . '%');
        }

        if ($request->has('nivel_educativo')) {
            $query->where('nivel_educativo', 'ilike', '%' . $request->nivel_educativo . '%');
        }

        if ($request->has('modalidad')) {
            $query->where('modalidad', 'ilike', '%' . $request->modalidad . '%');
        }

        if ($request->has('tipo_ensenanza')) {
            $query->where('tipo_ensenanza', 'ilike', '%' . $request->tipo_ensenanza . '%');
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where('ciclo_formativo', 'ilike', "%{$search}%");
        }

        return CicloFpResource::collection($query->paginate(20));
    }
}
