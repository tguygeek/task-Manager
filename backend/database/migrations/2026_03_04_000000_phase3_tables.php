<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Workspaces
        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('icon', 10)->default('📁');
            $table->string('color', 7)->default('#6366f1');
            $table->timestamps();
        });

        // Membres d'un workspace (owner + invités)
        Schema::create('workspace_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['owner', 'admin', 'member'])->default('member');
            $table->timestamps();
            $table->unique(['workspace_id', 'user_id']);
        });

        // Invitations (email + lien)
        Schema::create('workspace_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->foreignId('invited_by')->constrained('users')->onDelete('cascade');
            $table->string('email')->nullable();       // invitation par email
            $table->string('token', 64)->unique();     // invitation par lien
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Ajouter workspace_id + status + soft delete à tasks
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('workspace_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('status', ['todo', 'in_progress', 'done'])->default('todo');
            $table->softDeletes(); // pour la corbeille
        });

        // Historique des actions
        Schema::create('task_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('task_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action');           // 'created', 'updated', 'deleted', 'restored'
            $table->json('before')->nullable(); // état avant
            $table->json('after')->nullable();  // état après
            $table->string('description');      // texte lisible ex: "Tâche 'X' supprimée"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropForeign(['workspace_id']);
            $table->dropColumn(['workspace_id', 'status']);
        });
        Schema::dropIfExists('task_history');
        Schema::dropIfExists('workspace_invitations');
        Schema::dropIfExists('workspace_members');
        Schema::dropIfExists('workspaces');
    }
};
