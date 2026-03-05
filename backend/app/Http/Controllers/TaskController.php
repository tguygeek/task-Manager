<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    // GET /api/user/tasks
    public function index()
    {
        $tasks = Auth::user()->tasks()
            ->with('category', 'workspace')
            ->orderBy('position')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['tasks' => $tasks]);
    }

    // POST /api/tasks
    public function store(Request $request)
    {
        $v = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'priority'     => 'nullable|in:low,medium,high',
            'due_date'     => 'nullable|date',
            'category_id'  => 'nullable|exists:categories,id',
            'workspace_id' => 'nullable|exists:workspaces,id',
            'status'       => 'nullable|in:todo,in_progress,done',
        ]);

        $maxPosition = Auth::user()->tasks()->max('position') ?? 0;

        $task = Auth::user()->tasks()->create([
            ...$v,
            'priority'  => $v['priority']  ?? 'medium',
            'status'    => $v['status']    ?? 'todo',
            'completed' => false,
            'position'  => $maxPosition + 1,
        ]);

        $task->load('category', 'workspace');

        // Historique
        $this->logHistory('created', null, $task->toArray(), "Tâche \"{$task->title}\" créée", $task->id);

        return response()->json(['success' => true, 'message' => 'Tâche créée !', 'task' => $task], 201);
    }

    // PUT /api/tasks/{id}
    public function update(Request $request, $id)
    {
        $task = Auth::user()->tasks()->findOrFail($id);
        $before = $task->toArray();

        $v = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'priority'     => 'nullable|in:low,medium,high',
            'due_date'     => 'nullable|date',
            'completed'    => 'sometimes|boolean',
            'category_id'  => 'nullable|exists:categories,id',
            'workspace_id' => 'nullable|exists:workspaces,id',
            'position'     => 'sometimes|integer',
            'status'       => 'nullable|in:todo,in_progress,done',
        ]);

        // Synchroniser completed et status
        if (isset($v['status'])) {
            $v['completed'] = $v['status'] === 'done';
        } elseif (isset($v['completed'])) {
            $v['status'] = $v['completed'] ? 'done' : 'todo';
        }

        $task->update($v);
        $task->load('category', 'workspace');

        $this->logHistory('updated', $before, $task->toArray(), "Tâche \"{$task->title}\" modifiée", $task->id);

        return response()->json(['success' => true, 'message' => 'Tâche mise à jour !', 'task' => $task]);
    }

    // DELETE /api/tasks/{id} — soft delete (corbeille)
    public function destroy($id)
    {
        $task = Auth::user()->tasks()->findOrFail($id);
        $this->logHistory('deleted', $task->toArray(), null, "Tâche \"{$task->title}\" supprimée", $task->id);
        $task->delete(); // soft delete grâce au trait SoftDeletes

        return response()->json(['success' => true, 'message' => 'Tâche déplacée dans la corbeille !']);
    }

    // GET /api/tasks/trash — liste la corbeille
    public function trash()
    {
        $tasks = Auth::user()->tasks()->onlyTrashed()->orderBy('deleted_at', 'desc')->get();
        return response()->json(['tasks' => $tasks]);
    }

    // POST /api/tasks/{id}/restore — restaurer depuis la corbeille
    public function restore($id)
    {
        $task = Auth::user()->tasks()->onlyTrashed()->findOrFail($id);
        $task->restore();
        $this->logHistory('restored', null, $task->toArray(), "Tâche \"{$task->title}\" restaurée", $task->id);

        return response()->json(['success' => true, 'message' => 'Tâche restaurée !', 'task' => $task]);
    }

    // DELETE /api/tasks/{id}/force — suppression définitive
    public function forceDelete($id)
    {
        $task = Auth::user()->tasks()->onlyTrashed()->findOrFail($id);
        $task->forceDelete();
        return response()->json(['success' => true, 'message' => 'Tâche supprimée définitivement !']);
    }

    // POST /api/tasks/reorder
    public function reorder(Request $request)
    {
        $request->validate([
            'tasks'               => 'required|array',
            'tasks.*.id'          => 'required|integer',
            'tasks.*.position'    => 'required|integer',
            'tasks.*.category_id' => 'nullable|integer',
            'tasks.*.status'      => 'nullable|in:todo,in_progress,done',
        ]);

        foreach ($request->tasks as $item) {
            Auth::user()->tasks()->where('id', $item['id'])->update([
                'position'    => $item['position'],
                'category_id' => $item['category_id'] ?? null,
                'status'      => $item['status'] ?? 'todo',
                'completed'   => ($item['status'] ?? 'todo') === 'done',
            ]);
        }

        return response()->json(['success' => true]);
    }

    // GET /api/search?q=...
    public function search(Request $request)
    {
        $q = $request->query('q', '');
        if (strlen($q) < 2) return response()->json(['results' => []]);

        $tasks = Auth::user()->tasks()
            ->with('category', 'workspace')
            ->where(fn($query) =>
                $query->where('title', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%")
            )
            ->limit(10)
            ->get();

        $categories = Auth::user()->categories()
            ->where('name', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        $workspaces = Auth::user()->workspaces()
            ->where('name', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        return response()->json([
            'results' => [
                'tasks'      => $tasks,
                'categories' => $categories,
                'workspaces' => $workspaces,
            ]
        ]);
    }

    // GET /api/dashboard
    public function dashboard()
    {
        $user  = Auth::user();
        $tasks = $user->tasks()->with('category')->get();
        $allTasks = $user->tasks()->withTrashed()->get();

        // Taux de complétion global
        $total     = $tasks->count();
        $completed = $tasks->where('completed', true)->count();
        $rate      = $total > 0 ? round(($completed / $total) * 100) : 0;

        // Tâches complétées par jour sur les 7 derniers jours
        $weeklyData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date  = now()->subDays($i)->format('Y-m-d');
            $label = now()->subDays($i)->locale('fr')->isoFormat('ddd D');
            $count = $user->tasks()
                ->whereDate('updated_at', $date)
                ->where('completed', true)
                ->count();
            $weeklyData[] = ['date' => $date, 'label' => $label, 'count' => $count];
        }

        // Répartition par catégorie
        $byCategory = $user->categories()->withCount([
            'tasks',
            'tasks as completed_count' => fn($q) => $q->where('completed', true),
        ])->get()->map(fn($c) => [
            'name'      => $c->name,
            'icon'      => $c->icon,
            'color'     => $c->color,
            'total'     => $c->tasks_count,
            'completed' => $c->completed_count,
        ]);

        // Streak — jours consécutifs avec au moins une tâche complétée
        $streak = 0;
        $day    = now()->startOfDay();
        while (true) {
            $count = $user->tasks()->whereDate('updated_at', $day)->where('completed', true)->count();
            if ($count === 0) break;
            $streak++;
            $day = $day->subDay();
            if ($streak > 365) break;
        }

        return response()->json([
            'stats' => [
                'total'       => $total,
                'completed'   => $completed,
                'active'      => $total - $completed,
                'rate'        => $rate,
                'streak'      => $streak,
                'weeklyData'  => $weeklyData,
                'byCategory'  => $byCategory,
            ]
        ]);
    }

    // GET /api/history
    public function history()
    {
        $history = Auth::user()->taskHistory()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json(['history' => $history]);
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private function logHistory($action, $before, $after, $description, $taskId = null)
    {
        TaskHistory::create([
            'user_id'     => Auth::id(),
            'task_id'     => $taskId,
            'action'      => $action,
            'before'      => $before,
            'after'       => $after,
            'description' => $description,
        ]);
    }
}
