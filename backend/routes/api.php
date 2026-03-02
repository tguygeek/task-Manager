<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',         [AuthController::class, 'user']);
    Route::post('/logout',      [AuthController::class, 'logout']);

    // Tasks - RESTful routes
    Route::get('/user/tasks',   [TaskController::class, 'index']);
    Route::post('/tasks',       [TaskController::class, 'store']);
    Route::put('/tasks/{id}',   [TaskController::class, 'update']);   // ✅ PUT au lieu de POST /tasks/edit
    Route::delete('/tasks/{id}',[TaskController::class, 'destroy']);  // ✅ /{id} au lieu de body param
});
