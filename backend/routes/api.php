<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\WorkspaceController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Accepter une invitation (peut être sans être connecté → redirect login puis retry)
Route::get('/invitations/{token}/accept', [WorkspaceController::class, 'acceptInvitation']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',    [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ── Tasks ────────────────────────────────────────────────────────────────
    Route::get('/user/tasks',         [TaskController::class, 'index']);
    Route::post('/tasks',             [TaskController::class, 'store']);
    Route::post('/tasks/reorder',     [TaskController::class, 'reorder']);   // avant {id} !
    Route::put('/tasks/{id}',         [TaskController::class, 'update']);
    Route::delete('/tasks/{id}',      [TaskController::class, 'destroy']);   // soft delete

    // Corbeille
    Route::get('/tasks/trash',              [TaskController::class, 'trash']);
    Route::post('/tasks/{id}/restore',      [TaskController::class, 'restore']);
    Route::delete('/tasks/{id}/force',      [TaskController::class, 'forceDelete']);

    // Dashboard + historique + recherche
    Route::get('/dashboard',          [TaskController::class, 'dashboard']);
    Route::get('/history',            [TaskController::class, 'history']);
    Route::get('/search',             [TaskController::class, 'search']);

    // ── Categories ───────────────────────────────────────────────────────────
    Route::get('/categories',         [CategoryController::class, 'index']);
    Route::post('/categories',        [CategoryController::class, 'store']);
    Route::post('/categories/seed',   [CategoryController::class, 'seedDefaults']);
    Route::put('/categories/{id}',    [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // ── Workspaces ───────────────────────────────────────────────────────────
    Route::get('/workspaces',                       [WorkspaceController::class, 'index']);
    Route::post('/workspaces',                      [WorkspaceController::class, 'store']);
    Route::put('/workspaces/{id}',                  [WorkspaceController::class, 'update']);
    Route::delete('/workspaces/{id}',               [WorkspaceController::class, 'destroy']);
    Route::get('/workspaces/{id}/members',          [WorkspaceController::class, 'members']);
    Route::delete('/workspaces/{id}/members/{uid}', [WorkspaceController::class, 'removeMember']);
    Route::post('/workspaces/{id}/invite',          [WorkspaceController::class, 'inviteByEmail']);
    Route::post('/workspaces/{id}/invite-link',     [WorkspaceController::class, 'generateInviteLink']);
});
