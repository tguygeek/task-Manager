<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public array $overdueTasks,
        public array $dueTodayTasks,
        public array $dueTomorrowTasks,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📋 Taskflow — Rappel de tes tâches',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.task-reminder',
        );
    }
}
