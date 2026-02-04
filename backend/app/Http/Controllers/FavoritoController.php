<?php
    namespace App\Http\Controllers;

    use App\Models\Favorito;
    use Illuminate\Http\Request;

    // CONTROLADOR DE FAVORITOS
    // Gestiona la lista de centros guardados por el usuario
    class FavoritoController extends Controller {

        // LISTAR FAVORITOS
        // Devuelve todos los centros marcados como favoritos por el usuario actual
        public function index(Request $request)
        {
            $favoritos = $request->user()->favoritos()->with('centro')->get();
            return response()->json($favoritos);
        }

        // GUARDAR FAVORITO
        // Añade un centro a la lista de favoritos si no existe ya
        public function store(Request $request, $id) {
            // $id is the centro_id
            $exist = Favorito::where('user_id', $request->user()->id)
                ->where('centro_id', $id)
                ->exists();

            if ($exist) {
                return response()->json(['message' => 'Ya está en favoritos'], 409);
            }

            $request->user()->favoritos()->create([
                'centro_id' => $id
            ]);

            return response()->json(['message' => 'Añadido a favoritos']);
        }

        // ELIMINAR FAVORITO
        // Quita un centro de la lista de favoritos
        public function destroy(Request $request, $id) {
            $deleted = Favorito::where('user_id', $request->user()->id)
                ->where('centro_id', $id)
                ->delete();

            if ($deleted) {
                return response()->json(['message' => 'Eliminado de favoritos']);
            }

            return response()->json(['message' => 'No encontrado'], 404);
        }
    }
?>