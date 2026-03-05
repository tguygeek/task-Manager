<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskHistory extends Model
{
    protected $fillable = ['user_id', 'task_id', 'action', 'before', 'after', 'description'];

    protected $casts = [
        'before' => 'array',
        'after'  => 'array',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function task() { return $this->belongsTo(Task::class)->withTrashed(); }
}
