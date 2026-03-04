<?php

namespace App\Console\Commands;

use App\Mail\TaskReminderMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTaskReminders extends Command
{
    protected $signature   = 'tasks:send-reminders';
    protected $description = 'Envoie les rappels email pour les tâches en retard ou à échéance proche';

    public function handle(): void
    {
        $today    = Carbon::today();
        $tomorrow = Carbon::tomorrow();

        $users = User::with(['tasks' => function ($q) use ($today, $tomorrow) {
            $q->where('completed', false)
              ->whereNotNull('due_date')
              ->where(function ($q) use ($today, $tomorrow) {
                  $q->where('due_date', '<', $today)          // en retard
                    ->orWhereDate('due_date', $today)          // aujourd'hui
                    ->orWhereDate('due_date', $tomorrow);      // demain
              });
        }])->get();

        $sent = 0;

        foreach ($users as $user) {
            if ($user->tasks->isEmpty()) continue;

            $overdue   = $user->tasks->filter(fn($t) => Carbon::parse($t->due_date)->lt($today))->values()->toArray();
            $dueToday  = $user->tasks->filter(fn($t) => Carbon::parse($t->due_date)->isToday())->values()->toArray();
            $dueTomorrow = $user->tasks->filter(fn($t) => Carbon::parse($t->due_date)->isTomorrow())->values()->toArray();

            Mail::to($user->email)->send(new TaskReminderMail(
                userName:      $user->name,
                overdueTasks:  $overdue,
                dueTodayTasks: $dueToday,
                dueTomorrowTasks: $dueTomorrow,
            ));

            $sent++;
            $this->info("Email envoyé à {$user->email}");
        }

        $this->info("✅ {$sent} email(s) envoyé(s).");
    }
}
