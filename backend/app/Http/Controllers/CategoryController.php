<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    // Catégories prédéfinies proposées à la création du compte
    const DEFAULT_CATEGORIES = [
        ['name' => 'Travail',    'color' => '#3b82f6', 'icon' => '💼', 'is_default' => true],
        ['name' => 'Personnel',  'color' => '#10b981', 'icon' => '🏠', 'is_default' => true],
        ['name' => 'Urgent',     'color' => '#ef4444', 'icon' => '🚨', 'is_default' => true],
        ['name' => 'Courses',    'color' => '#f59e0b', 'icon' => '🛒', 'is_default' => true],
        ['name' => 'Santé',      'color' => '#8b5cf6', 'icon' => '❤️', 'is_default' => true],
    ];

    // GET /api/categories
    public function index()
    {
        $categories = Auth::user()->categories()
            ->withCount('tasks')
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    // POST /api/categories
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:50',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon'  => 'nullable|string|max:10',
        ]);

        $category = Auth::user()->categories()->create([
            'name'       => $validated['name'],
            'color'      => $validated['color'],
            'icon'       => $validated['icon'] ?? '📁',
            'is_default' => false,
        ]);

        return response()->json([
            'success'  => true,
            'message'  => 'Catégorie créée !',
            'category' => $category,
        ], 201);
    }

    // PUT /api/categories/{id}
    public function update(Request $request, $id)
    {
        $category = Auth::user()->categories()->findOrFail($id);

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:50',
            'color' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon'  => 'nullable|string|max:10',
        ]);

        $category->update($validated);

        return response()->json([
            'success'  => true,
            'message'  => 'Catégorie mise à jour !',
            'category' => $category,
        ]);
    }

    // DELETE /api/categories/{id}
    public function destroy($id)
    {
        $category = Auth::user()->categories()->findOrFail($id);

        // Les tâches liées auront category_id = null (onDelete: set null)
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée. Les tâches associées ont été conservées.',
        ]);
    }

    // POST /api/categories/seed — appelé après inscription pour créer les catégories par défaut
    public function seedDefaults()
    {
        $user = Auth::user();

        // Ne pas re-créer si déjà existantes
        if ($user->categories()->where('is_default', true)->exists()) {
            return response()->json(['message' => 'Déjà initialisé']);
        }

        foreach (self::DEFAULT_CATEGORIES as $cat) {
            $user->categories()->create($cat);
        }

        return response()->json(['success' => true, 'message' => 'Catégories par défaut créées !']);
    }
}
