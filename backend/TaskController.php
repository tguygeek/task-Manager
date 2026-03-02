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
        $tasks = Auth::user()->tasks()->orderBy('created_at', 'desc')->get();
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
        ]);

        $task = Auth::user()->tasks()->create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority'    => $validated['priority'] ?? 'medium',
            'due_date'    => $validated['due_date'] ?? null,
            'completed'   => false,
        ]);

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
        ]);

        $task->update($validated);

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
}
