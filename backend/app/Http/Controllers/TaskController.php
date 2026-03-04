<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    // GET /api/user/tasks
    public function index()
    {
        $tasks = Auth::user()->tasks()
            ->with('category')                  // charge la catégorie associée
            ->orderBy('position')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['tasks' => $tasks]);
    }

    // POST /api/tasks
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'nullable|in:low,medium,high',
            'due_date'    => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        // Position = dernier + 1
        $maxPosition = Auth::user()->tasks()->max('position') ?? 0;

        $task = Auth::user()->tasks()->create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority'    => $validated['priority'] ?? 'medium',
            'due_date'    => $validated['due_date'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'completed'   => false,
            'position'    => $maxPosition + 1,
        ]);

        $task->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Tâche créée avec succès !',
            'task'    => $task,
        ], 201);
    }

    // PUT /api/tasks/{id}
    public function update(Request $request, $id)
    {
        $task = Auth::user()->tasks()->findOrFail($id);

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'nullable|in:low,medium,high',
            'due_date'    => 'nullable|date',
            'completed'   => 'sometimes|boolean',
            'category_id' => 'nullable|exists:categories,id',
            'position'    => 'sometimes|integer',
        ]);

        $task->update($validated);
        $task->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Tâche mise à jour !',
            'task'    => $task,
        ]);
    }

    // DELETE /api/tasks/{id}
    public function destroy($id)
    {
        $task = Auth::user()->tasks()->findOrFail($id);
        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tâche supprimée !',
        ]);
    }

    // POST /api/tasks/reorder — met à jour les positions après drag & drop
    public function reorder(Request $request)
    {
        $request->validate([
            'tasks' => 'required|array',
            'tasks.*.id'       => 'required|integer',
            'tasks.*.position' => 'required|integer',
            'tasks.*.category_id' => 'nullable|integer',
        ]);

        foreach ($request->tasks as $item) {
            Auth::user()->tasks()
                ->where('id', $item['id'])
                ->update([
                    'position'    => $item['position'],
                    'category_id' => $item['category_id'],
                ]);
        }

        return response()->json(['success' => true, 'message' => 'Ordre mis à jour !']);
    }
}