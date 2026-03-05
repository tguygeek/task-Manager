<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = ['owner_id', 'name', 'description', 'icon', 'color'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'workspace_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function invitations()
    {
        return $this->hasMany(WorkspaceInvitation::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
