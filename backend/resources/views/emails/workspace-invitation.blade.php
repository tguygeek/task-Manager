<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #e5e5e5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; }
    .header { padding: 28px 32px; display: flex; align-items: center; gap: 16px; }
    .ws-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .header h1 { margin: 0; font-size: 1.3rem; color: #fff; }
    .header p  { margin: 4px 0 0; font-size: 0.85rem; color: #888; }
    .body { padding: 24px 32px; }
    .inviter { display: flex; align-items: center; gap: 10px; background: #111; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #e74c3c; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.9rem; }
    .cta { text-align: center; margin: 28px 0; }
    .cta a { background: #e74c3c; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-block; }
    .expire { text-align: center; font-size: 0.78rem; color: #555; margin-top: 8px; }
    .footer { padding: 16px 32px; border-top: 1px solid #222; font-size: 0.78rem; color: #555; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: {{ $workspace->color }}22; border-bottom: 1px solid {{ $workspace->color }}33;">
      <div class="ws-icon" style="background: {{ $workspace->color }}33;">{{ $workspace->icon }}</div>
      <div>
        <h1>{{ $workspace->name }}</h1>
        <p>{{ $workspace->description ?? 'Workspace Taskflow' }}</p>
      </div>
    </div>

    <div class="body">
      <div class="inviter">
        <div class="avatar">{{ strtoupper(substr($inviter->name, 0, 1)) }}</div>
        <div>
          <strong>{{ $inviter->name }}</strong> t'invite à collaborer
          <div style="font-size:0.8rem;color:#888;">sur le workspace <strong>{{ $workspace->name }}</strong></div>
        </div>
      </div>

      <p style="color:#aaa;font-size:0.9rem;line-height:1.6;">
        Tu as été invité à rejoindre <strong style="color:#fff">{{ $workspace->name }}</strong> sur Taskflow.
        Clique sur le bouton ci-dessous pour accepter l'invitation et commencer à collaborer.
      </p>

      <div class="cta">
        <a href="{{ config('app.frontend_url') }}/invite/{{ $invitation->token }}">
          Rejoindre {{ $workspace->name }} →
        </a>
      </div>
      <p class="expire">Cette invitation expire dans 7 jours.</p>
    </div>

    <div class="footer">⚡ Taskflow — Eliminez le chaos, suivez le flux © {{ date('Y') }}</div>
  </div>
</body>
</html>
