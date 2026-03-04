<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;
    protected $fillable = [
        'user_id',
        'category_id',  // ← nouveau Phase 2
        'title',
        'description',
        'priority',
        'due_date',
        'completed',
        'position',     // ← nouveau Phase 2
    ];
    protected $casts = [
        'completed' => 'boolean',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

     public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
