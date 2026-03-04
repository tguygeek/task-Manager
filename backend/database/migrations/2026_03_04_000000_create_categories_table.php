<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('color', 7)->default('#6366f1'); // couleur hex
            $table->string('icon', 10)->nullable();         // emoji
            $table->boolean('is_default')->default(false);  // catégories prédéfinies
            $table->timestamps();
        });

        // Ajouter category_id + position à la table tasks
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->unsignedInteger('position')->default(0); // pour le drag & drop
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['category_id', 'position']);
        });
        Schema::dropIfExists('categories');
    }
};
