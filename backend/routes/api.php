<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CategoryController;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',    [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Tasks
    Route::post('/tasks/reorder',  [TaskController::class, 'reorder']); // ← en premier
    Route::get('/user/tasks',      [TaskController::class, 'index']);
    Route::post('/tasks',          [TaskController::class, 'store']);
    Route::put('/tasks/{id}',      [TaskController::class, 'update']);
    Route::delete('/tasks/{id}',   [TaskController::class, 'destroy']);
    Route::post('/tasks/reorder',  [TaskController::class, 'reorder']); // drag & drop

    // Categories
    Route::get('/categories',           [CategoryController::class, 'index']);
    Route::post('/categories',          [CategoryController::class, 'store']);
    Route::put('/categories/{id}',      [CategoryController::class, 'update']);
    Route::delete('/categories/{id}',   [CategoryController::class, 'destroy']);
    Route::post('/categories/seed',     [CategoryController::class, 'seedDefaults']);
});
