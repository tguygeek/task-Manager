<?php

namespace App\Mail;

use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Workspace $workspace,
        public WorkspaceInvitation $invitation,
        public User $inviter,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "⚡ Invitation à rejoindre {$this->workspace->name} sur Taskflow");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.workspace-invitation');
    }
}
