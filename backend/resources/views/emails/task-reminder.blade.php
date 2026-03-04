<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Taskflow — Rappel de tâches</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #e5e5e5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; }
    .header { background: #e74c3c; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 1.6rem; color: #fff; }
    .header p  { margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 0.95rem; }
    .body { padding: 28px 32px; }
    .greeting { font-size: 1.1rem; margin-bottom: 20px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 10px; }
    .task-card { background: #111; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; border-left: 4px solid #555; }
    .task-card.overdue  { border-left-color: #e74c3c; }
    .task-card.today    { border-left-color: #f1c40f; }
    .task-card.tomorrow { border-left-color: #3b82f6; }
    .task-title { font-weight: 600; font-size: 0.95rem; }
    .task-meta  { font-size: 0.8rem; color: #888; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
    .badge.high   { background: rgba(231,76,60,0.2);  color: #e74c3c; }
    .badge.medium { background: rgba(241,196,15,0.2); color: #f1c40f; }
    .badge.low    { background: rgba(46,204,113,0.2); color: #2ecc71; }
    .cta { text-align: center; margin: 28px 0 8px; }
    .cta a { background: #e74c3c; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; }
    .footer { padding: 16px 32px; border-top: 1px solid #222; font-size: 0.78rem; color: #555; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Taskflow</h1>
      <p>Eliminez le chaos, suivez le flux</p>
    </div>

    <div class="body">
      <p class="greeting">Salut <strong>{{ $userName }}</strong> 👋</p>
      <p style="color:#aaa; font-size:0.9rem;">Voici un résumé de tes tâches qui nécessitent ton attention :</p>

      {{-- Tâches en retard --}}
      @if(count($overdueTasks) > 0)
      <div class="section">
        <div class="section-title">⚠️ En retard ({{ count($overdueTasks) }})</div>
        @foreach($overdueTasks as $task)
        <div class="task-card overdue">
          <div class="task-title">
            {{ $task['title'] }}
            <span class="badge {{ $task['priority'] }}">{{ ucfirst($task['priority']) }}</span>
          </div>
          <div class="task-meta">Échéance : {{ \Carbon\Carbon::parse($task['due_date'])->format('d M Y') }}</div>
        </div>
        @endforeach
      </div>
      @endif

      {{-- Tâches pour aujourd'hui --}}
      @if(count($dueTodayTasks) > 0)
      <div class="section">
        <div class="section-title">📅 À faire aujourd'hui ({{ count($dueTodayTasks) }})</div>
        @foreach($dueTodayTasks as $task)
        <div class="task-card today">
          <div class="task-title">
            {{ $task['title'] }}
            <span class="badge {{ $task['priority'] }}">{{ ucfirst($task['priority']) }}</span>
          </div>
        </div>
        @endforeach
      </div>
      @endif

      {{-- Tâches pour demain --}}
      @if(count($dueTomorrowTasks) > 0)
      <div class="section">
        <div class="section-title">🔔 À faire demain ({{ count($dueTomorrowTasks) }})</div>
        @foreach($dueTomorrowTasks as $task)
        <div class="task-card tomorrow">
          <div class="task-title">
            {{ $task['title'] }}
            <span class="badge {{ $task['priority'] }}">{{ ucfirst($task['priority']) }}</span>
          </div>
        </div>
        @endforeach
      </div>
      @endif

      <div class="cta">
        <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/tasks">
          Ouvrir Taskflow →
        </a>
      </div>
    </div>

    <div class="footer">
      Tu reçois cet email car tu utilises Taskflow. © {{ date('Y') }} Taskflow
    </div>
  </div>
</body>
</html>
