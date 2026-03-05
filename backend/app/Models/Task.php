<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'category_id', 'workspace_id',
        'title', 'description', 'priority',
        'due_date', 'completed', 'position', 'status',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'due_date'  => 'date:Y-m-d',
    ];

    public function user()      { return $this->belongsTo(User::class); }
    public function category()  { return $this->belongsTo(Category::class); }
    public function workspace() { return $this->belongsTo(Workspace::class); }
    public function history()   { return $this->hasMany(TaskHistory::class); }
}
