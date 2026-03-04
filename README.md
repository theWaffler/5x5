# 5x5+

Stronglift 5x5 + accessory workout tracker, focused on hypertrophy

## Features
- Shows today's workout (A/B/C) based on day of week
- Logs sessions and bodyweight
- Auto calculates next weight
- Auto deload after N failures (default 3) by a percent (default 10%)
- Stores data locally on the device (localStorage)
- Export/Import JSON for backups and moving between devices

## Program
- Workout A (Squat, Bench, Row, Situps)
- Workout B (Deadlift, OHP, Dips, Planks)
- Workout C (Incline DB work + arms + calves + front raise)

### Progression rules
Strength lifts:
- If success and last set reps >= 8 -> add increment next time
- If fail -> +1 fail
- If fails reach threshold -> deload and reset fail counter

Hypertrophy lifts:
- If success and top set hits rep max -> add increment next time
- Same fail/deload logic
