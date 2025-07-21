<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
return $request->user();
});

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::post('logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [TaskController::class, 'user']);
    Route::get('/tasks', [TaskController::class, 'getTasks']);
    Route::post('/tasks', [TaskController::class, 'addTask']);
    Route::get('/user/tasks', [TaskController::class, 'getUserTasks']);
});
Route::post('/tasks/edit', [TaskController::class, 'updateTask']);
Route::delete('/tasks/delete', [TaskController::class, 'deleteTask']);