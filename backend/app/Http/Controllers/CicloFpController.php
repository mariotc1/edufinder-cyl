<?php
    namespace App\Http\Controllers;

    use App\Models\CicloFp;
    use App\Http\Resources\CicloFpResource;
    use Illuminate\Http\Request;

    // CONTROLADOR DE CICLOS FORMATIVOS
    // Gestiona la búsqueda exhaustiva de ciclos (independiente del centro)
    class CicloFpController extends Controller {

        // LISTADO FILTRADO DE CICLOS
        // Permite buscar ciclos por familia, nivel, modalidad y otros criterios
        public function index(Request $request) {
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

        // SUGERENCIAS DE CICLOS
        // Autocompletado para la barra de búsqueda de ciclos
        // Filtra por nivel, familia y modalidad si están presentes
        public function suggestions(Request $request) {
            $request->validate([
                'q' => 'nullable|string|min:2',
                'nivel' => 'nullable|string',
                'familia' => 'nullable|string',
                'modalidad' => 'nullable|string',
            ]);

            if (!$request->q) {
                return response()->json([]);
            }

            $query = CicloFp::query()
                ->select('ciclo_formativo')
                ->where('ciclo_formativo', 'ilike', '%' . $request->q . '%');

            // Filtrar por nivel educativo si está presente
            if ($request->nivel) {
                switch ($request->nivel) {
                    case 'GM':
                        $query->where('nivel_educativo', 'ILIKE', '%Grado Medio%');
                        break;
                    case 'GS':
                        $query->where('nivel_educativo', 'ILIKE', '%Grado Superior%');
                        break;
                    case 'BASICA':
                        $query->where('nivel_educativo', 'ILIKE', '%Grado B%sico%');
                        break;
                    case 'CE':
                        $query->where('nivel_educativo', 'ILIKE', '%Curso Especializa%');
                        break;
                    default:
                        $query->where('nivel_educativo', 'ILIKE', '%' . $request->nivel . '%');
                }
            }

            // Filtrar por familia profesional si está presente
            if ($request->familia) {
                $query->where('familia_profesional', 'ILIKE', '%' . $request->familia . '%');
            }

            // Filtrar por modalidad si está presente
            if ($request->modalidad) {
                $query->where('modalidad', 'ILIKE', '%' . $request->modalidad . '%');
            }

            $suggestions = $query
                ->distinct()
                ->limit(10)
                ->pluck('ciclo_formativo');

            return response()->json($suggestions);
        }
    }
?>