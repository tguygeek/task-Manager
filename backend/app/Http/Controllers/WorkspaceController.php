<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Mail\WorkspaceInvitationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class WorkspaceController extends Controller
{
    // GET /api/workspaces
    public function index()
    {
        $owned  = Auth::user()->ownedWorkspaces()->withCount('members')->get()
                    ->map(fn($w) => [...$w->toArray(), 'role' => 'owner']);

        $member = Auth::user()->workspaces()->withCount('members')->get()
                    ->map(fn($w) => [...$w->toArray(), 'role' => $w->pivot->role]);

        $all = $owned->merge($member)->unique('id')->values();

        return response()->json(['workspaces' => $all]);
    }

    // POST /api/workspaces
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'icon'        => 'nullable|string|max:10',
            'color'       => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $workspace = Workspace::create([
            ...$validated,
            'owner_id' => Auth::id(),
            'icon'     => $validated['icon']  ?? '📁',
            'color'    => $validated['color'] ?? '#6366f1',
        ]);

        // Ajoute le créateur comme owner dans la table pivot
        $workspace->members()->attach(Auth::id(), ['role' => 'owner']);

        return response()->json([
            'success'   => true,
            'message'   => 'Workspace créé !',
            'workspace' => $workspace->loadCount('members'),
        ], 201);
    }

    // PUT /api/workspaces/{id}
    public function update(Request $request, $id)
    {
        $workspace = $this->findOwned($id);
        $workspace->update($request->validate([
            'name'        => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:255',
            'icon'        => 'nullable|string|max:10',
            'color'       => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]));

        return response()->json(['success' => true, 'workspace' => $workspace]);
    }

    // DELETE /api/workspaces/{id}
    public function destroy($id)
    {
        $this->findOwned($id)->delete();
        return response()->json(['success' => true, 'message' => 'Workspace supprimé !']);
    }

    // GET /api/workspaces/{id}/members
    public function members($id)
    {
        $workspace = $this->findAccessible($id);
        return response()->json(['members' => $workspace->members()->get()]);
    }

    // DELETE /api/workspaces/{id}/members/{userId}
    public function removeMember($id, $userId)
    {
        $workspace = $this->findOwned($id);
        if ($userId == Auth::id()) {
            return response()->json(['message' => 'Le propriétaire ne peut pas se retirer'], 403);
        }
        $workspace->members()->detach($userId);
        return response()->json(['success' => true, 'message' => 'Membre retiré !']);
    }

    // POST /api/workspaces/{id}/invite — invitation par email
    public function inviteByEmail(Request $request, $id)
    {
        $workspace = $this->findOwned($id);
        $request->validate(['email' => 'required|email']);

        $token = Str::random(64);
        $invitation = WorkspaceInvitation::create([
            'workspace_id' => $workspace->id,
            'invited_by'   => Auth::id(),
            'email'        => $request->email,
            'token'        => $token,
            'expires_at'   => now()->addDays(7),
        ]);

        Mail::to($request->email)->send(new WorkspaceInvitationMail($workspace, $invitation, Auth::user()));

        return response()->json(['success' => true, 'message' => "Invitation envoyée à {$request->email} !"]);
    }

    // POST /api/workspaces/{id}/invite-link — génère un lien d'invitation
    public function generateInviteLink($id)
    {
        $workspace = $this->findOwned($id);
        $token = Str::random(64);

        WorkspaceInvitation::create([
            'workspace_id' => $workspace->id,
            'invited_by'   => Auth::id(),
            'token'        => $token,
            'expires_at'   => now()->addDays(7),
        ]);

        $link = config('app.frontend_url') . "/invite/{$token}";
        return response()->json(['success' => true, 'link' => $link]);
    }

    // GET /api/invitations/{token}/accept — accepter une invitation
    public function acceptInvitation($token)
    {
        $invitation = WorkspaceInvitation::where('token', $token)
                        ->where('status', 'pending')
                        ->firstOrFail();

        if ($invitation->isExpired()) {
            return response()->json(['message' => 'Invitation expirée'], 410);
        }

        $invitation->update(['status' => 'accepted']);
        $invitation->workspace->members()->syncWithoutDetaching([
            Auth::id() => ['role' => 'member']
        ]);

        return response()->json([
            'success'   => true,
            'message'   => "Tu as rejoint {$invitation->workspace->name} !",
            'workspace' => $invitation->workspace,
        ]);
    }

    // ── Helpers privés ───────────────────────────────────────────────────────
    private function findOwned($id)
    {
        return Workspace::where('id', $id)->where('owner_id', Auth::id())->firstOrFail();
    }

    private function findAccessible($id)
    {
        return Workspace::whereHas('members', fn($q) => $q->where('user_id', Auth::id()))
                        ->findOrFail($id);
    }
}
