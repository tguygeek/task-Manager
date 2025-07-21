<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;


class TaskController extends Controller
{
    //

    function addTask(Request $request)
    {
        // Validate the request data
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            //'priority' => 'required|integer|min:1|max:5',
            'completed' => 'boolean',
        ]);

        $user = $request->user();
        // Create a new task
        $task = new \App\Models\Task();
        $task->title = $request->input('title');
        $task->description = $request->input('description');
       // $task->priority = $request->input('priority');
        $task->completed = $request->input('completed', false);
        $task->user_id = $user->id; // Assuming the user is authenticated

        // Save the task
        $task->save();

        return response()->json(['message' => 'Tache creer avec succes', 'task' => $task, 'success' => true,], 201);
    }

    function getTasks()
    {
        // Retrieve all tasks
        $tasks = \App\Models\Task::all();

        return response()->json(['tasks' => $tasks], 200);
    }

    public function user(Request $request) {
        // Return the authenticated user
        if (!$request->user()) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        // Return the user data
       return response()->json([
        'user' => $request->user(),
        'message' => 'Utilisateur récupéré avec succès'
        ]);    
    }

    public function getUserTasks(Request $request)
    {
        // Retrieve tasks for the authenticated user
        $tasks = $request->user()->tasks;

        return response()->json(['tasks' => $tasks], 200);
    }

    public function updateTask(Request $request,)
    {
        // Validate the request data
        $request->validate([
            //'title' => 'required|string|max:255',
            //'description' => 'nullable|string',
            //'priority' => 'required|integer|min:1|max:5',
            'completed' => 'boolean',
        ]);

        // Find the task by ID
        $task = \App\Models\Task::findOrFail($request->input('id'));

        // Update the task fields
        //$task->title = $request->input('title');
        //$task->description = $request->input('description');
        //$task->priority = $request->input('priority');
        $task->completed = $request->input('completed' );
        
        // Save the updated task
        $task->save();

        return response()->json(['message' => 'Tache mise a jour avec succes', 'task' => $task, 'success' => true], 200);
    }

    public function deleteTask(Request $request)
    {
        // Validate the request data
        $request->validate([
            'id' => 'required|integer|exists:tasks,id',
        ]);

        // Find the task by ID
        $task = \App\Models\Task::findOrFail($request->input('id'));

        // Delete the task
        $task->delete();

        return response()->json(['message' => 'Tache supprimee avec succes', 'success' => true], 200);
    }

}

