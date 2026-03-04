"use strict";

const STORAGE_KEY = "abcLiftTrackerDataV1";

const DEFAULT_DATA = buildDefaultData();

function buildDefaultData() {
  const lifts = {};

  // Strength day A
  lifts["Squat"] = mkStrength(120, 5, 0.10, 3, true);
  lifts["Bench Press"] = mkStrength(100, 5, 0.10, 3, false);
  lifts["Barbell Row"] = mkStrength(70, 5, 0.10, 3, false);
  lifts["Situp"] = mkAccessory(0, 5, 8, 0.10, 3, false);

  // Strength day B
  lifts["Deadlift"] = mkStrength(85, 10, 0.10, 3, true);
  lifts["Overhead Press"] = mkStrength(45, 2.5, 0.10, 3, true);
  lifts["Dips"] = mkAccessory(0, 5, 5, 0.10, 3, false);
  lifts["Planks"] = mkTimed(45, 5, 0.10, 3, false);

  // Hypertrophy day C
  lifts["Incline Bench Press"] = mkHypertrophy(50, 5, 8, 12, 0.10, 3, false);
  lifts["Dumbbell Pullover"] = mkHypertrophy(30, 5, 8, 12, 0.10, 3, false);
  lifts["Dumbbell Bench Press"] = mkHypertrophy(35, 5, 8, 12, 0.10, 3, true);
  lifts["Dumbbell Row"] = mkHypertrophy(35, 5, 8, 12, 0.10, 3, true);
  lifts["Skullcrushers"] = mkHypertrophy(45, 5, 8, 15, 0.10, 3, false);
  lifts["Barbell Curl"] = mkHypertrophy(50, 5, 8, 15, 0.10, 3, false);
  lifts["Standing Calf Raise"] = mkHypertrophy(85, 5, 8, 20, 0.10, 3, true);
  lifts["Front Raise"] = mkHypertrophy(15, 5, 8, 15, 0.10, 3, false);

  return {
    version: 1,
    profile: { name: "Jay", unit: "lb", restSeconds: 180, schedule: [0, 2, 4] },
    bodyweight: [{ date: isoToday(), weight: 200 }],
    lifts,
    sessions: []
  };
}

function mkStrength(start, increment, deloadPct, failToDeload, reducedSets = false) {
  return {
    type: "strength",
    nextWeight: start,
    increment,
    deloadPct,
    failToDeload,
    reducedSets,
    failCount: 0
  };
}

function mkHypertrophy(start, increment, repMin, repMax, deloadPct, failToDeload, reducedSets = false) {
  return {
    type: "hypertrophy",
    nextWeight: start,
    increment,
    repMin,
    repMax,
    deloadPct,
    failToDeload,
    reducedSets,
    failCount: 0
  };
}

function mkAccessory(start, increment, reps, deloadPct, failToDeload, reducedSets = false) {
  return {
    type: "accessory",
    nextWeight: start,
    increment,
    repsTarget: reps,
    deloadPct,
    failToDeload,
    reducedSets,
    failCount: 0
  };
}

function mkTimed(seconds, sets, deloadPct, failToDeload, reducedSets = false) {
  return {
    type: "timed",
    nextSeconds: seconds,
    setsTarget: sets,
    deloadPct,
    failToDeload,
    reducedSets,
    failCount: 0
  };
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(DEFAULT_DATA);
  try {
    const d = JSON.parse(raw);
    if (!d || d.version !== 1) return structuredClone(DEFAULT_DATA);
    return d;
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

const state = {
  data: loadData()
};

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekdayName(d = new Date()) {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
}

function getWorkoutForDate(d = new Date()) {
  const sched = state.data.profile.schedule || [0, 2, 4];
  const day = d.getDay();
  const idx = sched.indexOf(day);
  if (idx === 0) return "A";
  if (idx === 1) return "B";
  if (idx === 2) return "C";
  return null;
}

function workoutTitle(letter) {
  if (letter === "A") return "Workout A";
  if (letter === "B") return "Workout B";
  if (letter === "C") return "Workout C";
  return "Rest Day";
}

function plannedLiftsForWorkout(letter) {
  if (letter === "A") {
    return [
      { lift: "Squat", sets: 5, reps: 5, plus: true },
      { lift: "Bench Press", sets: 5, reps: 5, plus: true },
      { lift: "Barbell Row", sets: 5, reps: 5, plus: true },
      { lift: "Situp", sets: 5, reps: 8, plus: false }
    ];
  }
  if (letter === "B") {
    return [
      { lift: "Deadlift", sets: 1, reps: 5, plus: true },
      { lift: "Overhead Press", sets: 5, reps: 5, plus: true },
      { lift: "Dips", sets: 5, reps: 5, plus: false },
      { lift: "Planks", sets: 5, reps: 45, plus: false, timed: true }
    ];
  }
  if (letter === "C") {
    return [
      { lift: "Incline Bench Press", sets: 4, reps: "8-12" },
      { lift: "Dumbbell Pullover", sets: 3, reps: "8-12" },
      { lift: "Dumbbell Bench Press", sets: 3, reps: "8-12" },
      { lift: "Dumbbell Row", sets: 4, reps: "10-12" },
      { lift: "Skullcrushers", sets: 3, reps: "12-15" },
      { lift: "Barbell Curl", sets: 3, reps: "12-15" },
      { lift: "Standing Calf Raise", sets: 4, reps: "15-20" },
      { lift: "Front Raise", sets: 3, reps: "12-15" }
    ];
  }
  return [];
}

function roundToStep(value, step) {
  const s = Number(step) || 1;
  return Math.round(value / s) * s;
}

function calcDeloadWeight(current, deloadPct) {
  const w = current * (1 - deloadPct);
  return roundToStep(w, 2.5);
}

function strengthNextWeight(liftName, usedWeight, success, lastSetReps) {
  const lift = state.data.lifts[liftName];
  let next = lift.nextWeight;
  let deloaded = false;

  if (success) {
    lift.failCount = 0;
    if (typeof lastSetReps === "number" && lastSetReps >= 8) next = usedWeight + lift.increment;
    else next = usedWeight;
  } else {
    lift.failCount = (lift.failCount || 0) + 1;
    if (lift.failCount >= lift.failToDeload) {
      next = calcDeloadWeight(usedWeight, lift.deloadPct);
      lift.failCount = 0;
      deloaded = true;
    } else next = usedWeight;
  }

  lift.nextWeight = next;
  return { nextWeight: next, deloaded };
}

function hypertrophyNextWeight(liftName, usedWeight, success, repsTopSet) {
  const lift = state.data.lifts[liftName];
  let next = lift.nextWeight;
  let deloaded = false;

  if (success) {
    lift.failCount = 0;
    if (typeof repsTopSet === "number" && repsTopSet >= lift.repMax) next = usedWeight + lift.increment;
    else next = usedWeight;
  } else {
    lift.failCount = (lift.failCount || 0) + 1;
    if (lift.failCount >= lift.failToDeload) {
      next = calcDeloadWeight(usedWeight, lift.deloadPct);
      lift.failCount = 0;
      deloaded = true;
    } else next = usedWeight;
  }

  lift.nextWeight = next;
  return { nextWeight: next, deloaded };
}

function accessoryNextWeight(liftName, usedWeight, success, repsTopSet) {
  const lift = state.data.lifts[liftName];
  let next = lift.nextWeight;
  let deloaded = false;

  if (success) {
    lift.failCount = 0;
    if (typeof repsTopSet === "number" && repsTopSet >= lift.repsTarget) next = usedWeight + lift.increment;
    else next = usedWeight;
  } else {
    lift.failCount = (lift.failCount || 0) + 1;
    if (lift.failCount >= lift.failToDeload) {
      next = calcDeloadWeight(usedWeight, lift.deloadPct);
      lift.failCount = 0;
      deloaded = true;
    } else next = usedWeight;
  }

  lift.nextWeight = next;
  return { nextWeight: next, deloaded };
}

function timedNextSeconds(liftName, usedSeconds, success) {
  const lift = state.data.lifts[liftName];
  let next = lift.nextSeconds;
  let deloaded = false;

  if (success) {
    lift.failCount = 0;
    next = usedSeconds;
  } else {
    lift.failCount = (lift.failCount || 0) + 1;
    if (lift.failCount >= lift.failToDeload) {
      const n = usedSeconds * (1 - lift.deloadPct);
      next = Math.max(10, Math.round(n));
      lift.failCount = 0;
      deloaded = true;
    } else next = usedSeconds;
  }

  lift.nextSeconds = next;
  return { nextSeconds: next, deloaded };
}

function setTodayLine() {
  const d = new Date();
  const letter = getWorkoutForDate(d);
  const line = `${weekdayName(d)} • ${letter ? workoutTitle(letter) : "Rest Day"} • ${isoToday()}`;
  document.getElementById("todayLine").textContent = line;
}

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of children) n.appendChild(c);
  return n;
}

function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

function latestBodyweight() {
  const arr = state.data.bodyweight || [];
  if (!arr.length) return null;
  return arr[arr.length - 1];
}

function showToast(msg = "Saved") {
  const existing = document.querySelector(".toast")
  if (existing) existing.remove()
  const toast = el("div", { class: "toast", text: msg })
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add("toast-visible"))
  setTimeout(() => {
    toast.classList.remove("toast-visible")
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

function renderBodyweightQuick() {
  const input = el("input", { type: "number", step: "0.1", placeholder: "Bodyweight" });
  const btn = el("button", { class: "ok" }, [document.createTextNode("Save")]);
  btn.addEventListener("click", () => {
    const v = Number(input.value);
    if (!Number.isFinite(v) || v <= 0) return;
    state.data.bodyweight.push({ date: isoToday(), weight: v });
    saveData();
    renderAll();
  });

  return el("div", { class: "card" }, [
    el("div", { class: "h1", text: "Quick bodyweight log" }),
    el("div", { class: "row" }, [
      input,
      btn,
      el("div", { class: "muted", text: "Saves to this device" })
    ])
  ]);
}

function suggestForLift(liftName) {
  const lift = state.data.lifts[liftName];
  if (!lift) return "unset";
  if (lift.type === "timed") return `${lift.nextSeconds} sec`;
  return `${lift.nextWeight} ${state.data.profile.unit}`;
}

function renderPlannedItem(letter, item) {
  const liftName = item.lift;
  const lift = state.data.lifts[liftName];

  let suggest = "";
  if (lift) {
    if (lift.type === "timed") suggest = `${lift.nextSeconds} sec`;
    else suggest = `${lift.nextWeight} ${state.data.profile.unit}`;
  }

  const subtitleParts = [];
  if (item.timed) subtitleParts.push(`${item.sets} sets of ${item.reps} seconds`);
  else if (typeof item.reps === "string") subtitleParts.push(`${item.sets} sets of ${item.reps} reps`);
  else subtitleParts.push(`${item.sets} sets of ${item.reps}${item.plus ? "+" : ""} reps`);

  if (lift && lift.type === "strength" && item.plus) subtitleParts.push("last set is plus set");

  return el("div", { class: "card" }, [
    el("div", { class: "row space" }, [
      el("div", {}, [
        el("div", { class: "h1", text: liftName }),
        el("div", { class: "muted", text: subtitleParts.join(" • ") })
      ]),
      el("div", { class: "pill", text: `Next: ${suggest || "set in settings"}` })
    ])
  ]);
}

function renderToday() {
  const root = document.getElementById("tab-today");
  clear(root);

  const letter = getWorkoutForDate(new Date());
  const plan = plannedLiftsForWorkout(letter);

  const bw = latestBodyweight();

  root.appendChild(el("div", { class: "card" }, [
    el("div", { class: "row space" }, [
      el("div", {}, [
        el("div", { class: "h1", text: letter ? workoutTitle(letter) : "Rest Day" }),
        el("div", { class: "muted", text: `Bodyweight latest: ${bw ? bw.weight : "none"} ${state.data.profile.unit}` })
      ]),
      el("div", { class: "pill", text: letter ? "Train today" : "No training scheduled" })
    ])
  ]));

  root.appendChild(renderBodyweightQuick());

  if (!letter) {
    root.appendChild(el("div", { class: "card" }, [
      el("div", { class: "h1", text: "Optional" }),
      el("div", { class: "muted", text: "You can still log a session manually in the Log tab." })
    ]));
    return;
  }

  for (const item of plan) root.appendChild(renderPlannedItem(letter, item));

  root.appendChild(el("div", { class: "card" }, [
    el("div", { class: "row space" }, [
      el("div", {}, [
        el("div", { class: "h1", text: "Log this workout" }),
        el("div", { class: "muted", text: "Tap Log tab to enter sets and mark success or fail." })
      ]),
      el("button", { class: "primary", onclick: () => switchTab("log") }, [document.createTextNode("Go to Log")])
    ])
  ]));
}

const logState = {
  sets: {},
  notes: "",
  warmupSets: {}
}

function resetLogState() {
  logState.sets = {}
  logState.notes = ""
  logState.warmupSets = {}
}

function renderLiftCircles(item, isWarmup) {
  const liftName = item.lift
  const lift = state.data.lifts[liftName]
  if (!lift) return el("div")

  const unit = state.data.profile.unit
  let setsData = []

  if (isWarmup) {
    if (lift.type === "timed" || lift.nextWeight === 0) return el("div")
    const warmups = calcWarmupSets(lift.nextWeight, unit)
    setsData = warmups.map(w => ({ reps: w.reps, weight: w.weight, targetReps: w.reps }))
    if (!logState.warmupSets[liftName]) {
      logState.warmupSets[liftName] = setsData.map(() => ({ done: false, reps: 0 }))
    }
  } else {
    if (lift.type === "timed") {
      const numSets = item.sets
      setsData = Array.from({ length: numSets }, () => ({
        reps: lift.nextSeconds, weight: null, targetReps: lift.nextSeconds, timed: true
      }))
      if (!logState.sets[liftName]) {
        logState.sets[liftName] = setsData.map(s => ({ done: false, reps: s.reps }))
      }
    } else {
      const targetReps = typeof item.reps === "string" ? Number(item.reps.split("-")[1] || item.reps.split("-")[0]) : item.reps
      const weights = calcWorkingSets(lift.nextWeight, item.sets, lift.reducedSets !== false)
      setsData = weights.map(w => ({ reps: targetReps, weight: w, targetReps }))
      if (!logState.sets[liftName]) {
        logState.sets[liftName] = setsData.map(s => ({ done: false, reps: s.targetReps }))
      }
    }
  }

  const stateArr = isWarmup ? logState.warmupSets[liftName] : logState.sets[liftName]
  const summaryWeight = lift.type === "timed"
    ? `${item.sets}x${lift.nextSeconds}s`
    : `${item.sets}x${lift.nextWeight}${unit}`

  const circlesWrap = el("div", { class: "set-circles" })

  setsData.forEach((sd, i) => {
    const setObj = stateArr[i]
    const circleEl = el("div", {
      class: `circle${setObj.done ? (isWarmup ? " warmup-done" : " done") : ""}`,
      text: String(setObj.done ? setObj.reps : sd.targetReps)
    })

    circleEl.addEventListener("click", () => {
      if (!setObj.done) {
        setObj.done = true
        setObj.reps = sd.targetReps
        circleEl.classList.add(isWarmup ? "warmup-done" : "done")
        circleEl.textContent = String(setObj.reps)
        if (!isWarmup) restTimer.start()
      } else {
        if (setObj.reps > 0) {
          setObj.reps--
          circleEl.textContent = String(setObj.reps)
        } else {
          setObj.done = false
          circleEl.classList.remove(isWarmup ? "warmup-done" : "done")
          circleEl.textContent = String(sd.targetReps)
        }
      }
    })

    const weightLabel = sd.timed
      ? ""
      : `${sd.weight ?? 0}`

    circlesWrap.appendChild(el("div", { class: "set-circle" }, [
      circleEl,
      el("div", { class: "weight-label", text: weightLabel })
    ]))
  })

  const lastSd = setsData[setsData.length - 1]
  const extraTargetReps = lastSd ? lastSd.targetReps : 0
  const extraWeight = lastSd ? lastSd.weight : null
  const extraTimed = lastSd ? !!lastSd.timed : false

  const addSetCircle = el("div", { class: "circle add-set", text: "+" })
  const addSetWrap = el("div", { class: "set-circle" }, [
    addSetCircle,
    el("div", { class: "weight-label", text: extraTimed || extraWeight == null ? "" : `${extraWeight}` })
  ])

  addSetCircle.addEventListener("click", () => {
    const newSetObj = { done: false, reps: extraTargetReps }
    stateArr.push(newSetObj)
    const newSd = { weight: extraWeight, targetReps: extraTargetReps, timed: extraTimed }
    const newCircleEl = el("div", { class: "circle", text: String(extraTargetReps) })
    newCircleEl.addEventListener("click", () => {
      if (!newSetObj.done) {
        newSetObj.done = true
        newSetObj.reps = newSd.targetReps
        newCircleEl.classList.add(isWarmup ? "warmup-done" : "done")
        newCircleEl.textContent = String(newSetObj.reps)
        if (!isWarmup) restTimer.start()
      } else {
        if (newSetObj.reps > 0) {
          newSetObj.reps--
          newCircleEl.textContent = String(newSetObj.reps)
        } else {
          newSetObj.done = false
          newCircleEl.classList.remove(isWarmup ? "warmup-done" : "done")
          newCircleEl.textContent = String(newSd.targetReps)
        }
      }
    })
    circlesWrap.insertBefore(
      el("div", { class: "set-circle" }, [
        newCircleEl,
        el("div", { class: "weight-label", text: newSd.timed ? "" : `${newSd.weight ?? 0}` })
      ]),
      addSetWrap
    )
  })

  circlesWrap.appendChild(addSetWrap)

  const row = el("div", { class: "lift-row" }, [
    el("div", { class: "lift-row-header" }, [
      el("div", { class: "lift-name", text: liftName }),
      el("div", { class: "lift-summary", text: isWarmup ? "Warmup" : summaryWeight })
    ]),
    circlesWrap
  ])

  return row
}

function renderLog() {
  const root = document.getElementById("tab-log")
  clear(root)

  const planned = getWorkoutForDate(new Date())
  const unit = state.data.profile.unit

  const workoutSelect = el("select", { class: "log-workout-select" }, [
    el("option", { value: "", text: "Choose" }),
    el("option", { value: "A", text: "Workout A" }),
    el("option", { value: "B", text: "Workout B" }),
    el("option", { value: "C", text: "Workout C" })
  ])
  workoutSelect.value = planned || ""

  root.appendChild(el("div", { class: "log-header" }, [workoutSelect]))

  let activeTab = "workout"
  const toggleWrap = el("div", { class: "log-toggle" })
  const workoutBtn = el("button", { class: "active", text: "Workout" })
  const warmupBtn = el("button", { text: "Warmup" })
  toggleWrap.appendChild(workoutBtn)
  toggleWrap.appendChild(warmupBtn)
  root.appendChild(toggleWrap)

  const entriesWrap = el("div")
  root.appendChild(entriesWrap)

  const bw = latestBodyweight()
  const bwRow = el("div", { class: "bw-row" }, [
    el("div", { class: "bw-label", text: "Body Weight" }),
    el("div", { class: "bw-value", text: bw ? `${bw.weight}${unit}` : "---" })
  ])
  root.appendChild(bwRow)

  const spacer = el("div", { style: "height:70px" })
  root.appendChild(spacer)

  const timerDisplay = el("div", { class: "timer-display", text: restTimer.formatTime(state.data.profile.restSeconds || 180) })
  restTimer.displayEl = timerDisplay

  timerDisplay.addEventListener("click", () => {
    if (restTimer.interval) {
      restTimer.stop()
      restTimer.remaining = 0
      restTimer.update()
      return
    }
    const existing = document.querySelector(".timer-picker")
    if (existing) { existing.remove(); return }
    const presets = [90, 180]
    const picker = el("div", { class: "timer-picker" })
    for (const p of presets) {
      const isActive = (state.data.profile.restSeconds || 180) === p
      const b = el("button", { class: isActive ? "active" : "", text: restTimer.formatTime(p) })
      b.addEventListener("click", () => {
        state.data.profile.restSeconds = p
        saveData()
        timerDisplay.textContent = restTimer.formatTime(p)
        picker.remove()
      })
      picker.appendChild(b)
    }
    document.body.appendChild(picker)
  })

  const noteBtn = el("div", { class: "note-btn", text: "Note" })
  noteBtn.addEventListener("click", () => {
    const overlay = el("div", { class: "note-overlay" })
    const textarea = el("textarea", { placeholder: "Workout notes...", style: "width:100%;min-height:100px" })
    textarea.value = logState.notes
    const doneBtn = el("button", { class: "primary", text: "Done" })
    doneBtn.addEventListener("click", () => {
      logState.notes = textarea.value
      overlay.remove()
    })
    overlay.addEventListener("click", (e) => { if (e.target === overlay) { logState.notes = textarea.value; overlay.remove() } })
    overlay.appendChild(el("div", { class: "note-box" }, [textarea, el("div", { style: "height:10px" }), doneBtn]))
    document.body.appendChild(overlay)
  })

  const saveBtn = el("div", { class: "save-btn", text: "Save" })
  saveBtn.addEventListener("click", () => {
    const workout = workoutSelect.value
    if (!workout) return
    const today = isoToday()
    const items = plannedLiftsForWorkout(workout)
    const entries = []

    for (const item of items) {
      const liftName = item.lift
      const lift = state.data.lifts[liftName]
      if (!lift) continue
      const setStates = logState.sets[liftName]
      if (!setStates) continue

      const completedSets = setStates.filter(s => s.done)
      if (!completedSets.length) continue

      const lastSetReps = completedSets[completedSets.length - 1].reps
      const allHitTarget = completedSets.every(s => {
        const target = lift.type === "timed"
          ? lift.nextSeconds
          : (typeof item.reps === "string" ? Number(item.reps.split("-")[1] || item.reps.split("-")[0]) : item.reps)
        return s.reps >= target
      })
      const success = completedSets.length >= item.sets && allHitTarget

      if (lift.type === "timed") {
        const usedSeconds = completedSets[0].reps
        const { nextSeconds, deloaded } = timedNextSeconds(liftName, usedSeconds, success)
        entries.push({ lift: liftName, seconds: usedSeconds, success, nextSeconds, deloaded })
      } else {
        const usedWeight = lift.nextWeight
        let res
        if (lift.type === "strength") res = strengthNextWeight(liftName, usedWeight, success, lastSetReps)
        else if (lift.type === "hypertrophy") res = hypertrophyNextWeight(liftName, usedWeight, success, lastSetReps)
        else res = accessoryNextWeight(liftName, usedWeight, success, lastSetReps)
        entries.push({ lift: liftName, weight: usedWeight, lastSetReps, success, nextWeight: res.nextWeight, deloaded: res.deloaded })
      }
    }

    state.data.sessions.push({ date: today, workout, notes: logState.notes, entries })
    saveData()
    resetLogState()
    restTimer.stop()
    renderAll()
    switchTab("history")
  })

  const footer = el("div", { class: "log-footer" }, [noteBtn, timerDisplay, saveBtn])
  root.appendChild(footer)

  let currentWorkout = workoutSelect.value

  function buildEntries() {
    clear(entriesWrap)
    const w = workoutSelect.value
    if (!w) {
      entriesWrap.appendChild(el("div", { class: "card" }, [
        el("div", { class: "muted", text: "Pick A, B, or C above." })
      ]))
      return
    }
    if (w !== currentWorkout) {
      resetLogState()
      currentWorkout = w
    }
    const items = plannedLiftsForWorkout(w)
    for (const it of items) {
      entriesWrap.appendChild(renderLiftCircles(it, activeTab === "warmup"))
    }
  }

  workoutSelect.addEventListener("change", buildEntries)

  workoutBtn.addEventListener("click", () => {
    activeTab = "workout"
    workoutBtn.classList.add("active")
    warmupBtn.classList.remove("active")
    buildEntries()
  })

  warmupBtn.addEventListener("click", () => {
    activeTab = "warmup"
    warmupBtn.classList.add("active")
    workoutBtn.classList.remove("active")
    buildEntries()
  })

  buildEntries()
}

function renderTable(headers, rows) {
  const thead = el("thead", {}, [el("tr", {}, headers.map(h => el("th", { text: h })))]);
  const tbody = el("tbody", {}, rows.map(r => el("tr", {}, r.map(c => el("td", { text: String(c ?? "") })))));
  return el("table", {}, [thead, tbody]);
}

function makeLineChart(points) {
  if (!points.length) return el("div", { class: "muted small", text: "No data yet.", style: "padding:10px 0" });
  const W = 300, H = 90, pl = 38, pr = 10, pt = 8, pb = 22;
  const cw = W - pl - pr, ch = H - pt - pb;
  const yVals = points.map(p => p.y);
  const yMin = Math.min(...yVals), yMax = Math.max(...yVals);
  const yRange = yMax - yMin || 1;
  const sx = i => pl + (points.length > 1 ? (i / (points.length - 1)) * cw : cw / 2);
  const sy = v => pt + ch - ((v - yMin) / yRange) * ch;
  const linePts = points.map((p, i) => `${sx(i).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const dots = points.map((p, i) => {
    const fill = p.success === false ? "#ff6b6b" : "#6ee7ff";
    return `<circle cx="${sx(i).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="3.5" fill="${fill}" />`;
  }).join("");
  const labelFirst = points[0].x.slice(5);
  const labelLast = points[points.length - 1].x.slice(5);
  const svgStr = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
    <line x1="${pl}" y1="${pt}" x2="${pl}" y2="${pt+ch}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
    <line x1="${pl}" y1="${pt+ch}" x2="${pl+cw}" y2="${pt+ch}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
    <polyline points="${linePts}" fill="none" stroke="rgba(110,231,255,0.45)" stroke-width="1.5" stroke-linejoin="round"/>
    ${dots}
    <text x="${pl}" y="${H-4}" fill="#a7a7b2" font-size="9" text-anchor="middle">${labelFirst}</text>
    <text x="${pl+cw}" y="${H-4}" fill="#a7a7b2" font-size="9" text-anchor="end">${labelLast}</text>
    <text x="${pl-4}" y="${pt+5}" fill="#a7a7b2" font-size="9" text-anchor="end">${yMax}</text>
    <text x="${pl-4}" y="${pt+ch}" fill="#a7a7b2" font-size="9" text-anchor="end">${yMin}</text>
  </svg>`;
  const wrap = document.createElement("div");
  wrap.innerHTML = svgStr;
  return wrap.firstElementChild;
}

function renderHistory() {
  const root = document.getElementById("tab-history");
  clear(root);

  root.appendChild(el("div", { class: "card" }, [
    el("div", { class: "h1", text: "History" }),
    el("div", { class: "muted", text: "Sessions are stored on this device. Use Export for backups." })
  ]));

  // Progress graphs
  const workoutSel = el("select", {}, [
    el("option", { value: "A", text: "Workout A" }),
    el("option", { value: "B", text: "Workout B" }),
    el("option", { value: "C", text: "Workout C" })
  ]);
  const graphsWrap = el("div");

  function buildGraphs() {
    clear(graphsWrap);
    const w = workoutSel.value;
    const sessions = state.data.sessions || [];
    const unit = state.data.profile.unit;

    plannedLiftsForWorkout(w).forEach(item => {
      const lift = state.data.lifts[item.lift];
      if (!lift || lift.type === "timed") return;
      const points = sessions
        .filter(s => s.workout === w)
        .flatMap(s => {
          const e = (s.entries || []).find(e => e.lift === item.lift);
          return e && typeof e.weight === "number" ? [{ x: s.date, y: e.weight, success: e.success }] : [];
        });
      graphsWrap.appendChild(el("div", { class: "chart-label", text: `${item.lift} (${unit})` }));
      graphsWrap.appendChild(makeLineChart(points));
    });

    // Bodyweight
    graphsWrap.appendChild(el("div", { class: "chart-label", text: `Bodyweight (${unit})` }));
    const bwPoints = (state.data.bodyweight || []).map(b => ({ x: b.date, y: b.weight }));
    graphsWrap.appendChild(makeLineChart(bwPoints));
  }

  workoutSel.addEventListener("change", buildGraphs);
  buildGraphs();

  root.appendChild(el("div", { class: "card" }, [
    el("div", { class: "row space", style: "margin-bottom:12px" }, [
      el("div", { class: "h1", text: "Progress" }),
      workoutSel
    ]),
    graphsWrap
  ]));

  // Session list
  const sessions = [...(state.data.sessions || [])].reverse();
  if (!sessions.length) {
    root.appendChild(el("div", { class: "card" }, [el("div", { class: "muted", text: "No sessions yet." })]));
    return;
  }

  for (const s of sessions) {
    const rows = [];
    for (const e of s.entries || []) {
      const status = e.success ? "Success" : "Fail";
      const deloadTag = e.deloaded ? "Deload" : "";
      if (typeof e.seconds === "number") rows.push([e.lift, `${e.seconds} sec`, status, deloadTag, e.nextSeconds ? `${e.nextSeconds} sec` : ""]);
      else {
        const repInfo = (typeof e.lastSetReps === "number") ? ` reps ${e.lastSetReps}` : "";
        rows.push([e.lift, `${e.weight} ${state.data.profile.unit}${repInfo}`, status, deloadTag, e.nextWeight ? `${e.nextWeight} ${state.data.profile.unit}` : ""]);
      }
    }
    root.appendChild(el("div", { class: "card" }, [
      el("div", { class: "row space" }, [
        el("div", {}, [
          el("div", { class: "h1", text: `${s.date} • Workout ${s.workout}` }),
          el("div", { class: "muted", text: s.notes ? s.notes : "No notes" })
        ]),
        el("div", { class: "pill", text: `${rows.length} entries` })
      ]),
      renderTable(["Lift","Performed","Result","Flag","Next"], rows)
    ]));
  }
}

function clampNumber(x, lo, hi) { if (!Number.isFinite(x)) return lo; return Math.min(hi, Math.max(lo, x)); }
function clampInt(x, lo, hi) { x = Math.round(x); if (!Number.isFinite(x)) return lo; return Math.min(hi, Math.max(lo, x)); }
function clamp01(x, lo, hi) { if (!Number.isFinite(x)) return lo; return Math.min(hi, Math.max(lo, x)); }

function calcWorkingSets(workingWeight, numSets, reduced = true) {
  if (!reduced) {
    const sets = []
    for (let i = 0; i < numSets; i++) sets.push(workingWeight)
    return sets
  }
  const reducedWeight = Math.ceil(workingWeight * 0.9167 / 2) * 2
  const sets = []
  for (let i = 0; i < numSets; i++) {
    sets.push(i === 0 ? workingWeight : reducedWeight)
  }
  return sets
}

function calcWarmupSets(workingWeight, unit) {
  const bar = unit === "kg" ? 20 : 45
  if (workingWeight <= bar) return [{ reps: 5, weight: bar }]
  const sets = []
  sets.push({ reps: 5, weight: bar })
  sets.push({ reps: 5, weight: bar })
  const w40 = Math.round(workingWeight * 0.40)
  const w60 = Math.round(workingWeight * 0.60)
  const w80 = Math.round(workingWeight * 0.80)
  if (w40 > bar) sets.push({ reps: 5, weight: w40 })
  if (w60 > bar) sets.push({ reps: 3, weight: w60 })
  if (w80 > bar) sets.push({ reps: 2, weight: w80 })
  return sets
}

const restTimer = {
  interval: null,
  remaining: 0,
  displayEl: null,
  audioCtx: null,

  start() {
    this.stop()
    this.remaining = state.data.profile.restSeconds || 180
    this.update()
    if (this.displayEl) this.displayEl.classList.add("running")
    this.interval = setInterval(() => {
      this.remaining--
      this.update()
      if (this.remaining <= 0) this.finish()
    }, 1000)
  },

  stop() {
    if (this.interval) clearInterval(this.interval)
    this.interval = null
    if (this.displayEl) this.displayEl.classList.remove("running")
  },

  finish() {
    this.stop()
    this.update()
    if (this.displayEl) {
      this.displayEl.classList.add("flash")
      setTimeout(() => this.displayEl.classList.remove("flash"), 1600)
    }
    this.playBeep()
  },

  update() {
    if (!this.displayEl) return
    if (this.remaining <= 0) {
      this.displayEl.textContent = this.formatTime(state.data.profile.restSeconds || 180)
      return
    }
    this.displayEl.textContent = this.formatTime(this.remaining)
  },

  formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, "0")}`
  },

  getAudioCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this.audioCtx
  },

  playBeep() {
    try {
      const ctx = this.getAudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.value = 880
        gain2.gain.value = 0.3
        osc2.start()
        osc2.stop(ctx.currentTime + 0.3)
      }, 400)
    } catch {}
  }
}

function renderLiftConfigCard(liftName) {
  const lift = state.data.lifts[liftName];

  const nextWeight = el("input", { type: "number", step: "2.5", value: String(lift.nextWeight ?? 0) });
  const increment = el("input", { type: "number", step: "0.5", value: String(lift.increment ?? 5) });
  const deloadPct = el("input", { type: "number", step: "1", value: String(Math.round((lift.deloadPct ?? 0.10) * 100)) });
  const failToDeload = el("input", { type: "number", step: "1", value: String(lift.failToDeload ?? 3) });

  const repMin = el("input", { type: "number", step: "1", value: String(lift.repMin ?? 8) });
  const repMax = el("input", { type: "number", step: "1", value: String(lift.repMax ?? 12) });

  const repsTarget = el("input", { type: "number", step: "1", value: String(lift.repsTarget ?? 8) });
  const nextSeconds = el("input", { type: "number", step: "1", value: String(lift.nextSeconds ?? 45) });

  const reducedSetsCheck = el("input", { type: "checkbox", style: "width:18px;height:18px;min-width:18px" });
  reducedSetsCheck.checked = lift.reducedSets === true;

  const typeSel = el("select", {}, [
    el("option", { value: "strength", text: "Strength" }),
    el("option", { value: "hypertrophy", text: "Hypertrophy" }),
    el("option", { value: "accessory", text: "Accessory" }),
    el("option", { value: "timed", text: "Timed" })
  ]);
  typeSel.value = lift.type;

  const saveBtn = el("button", { class: "primary" }, [document.createTextNode("Save")]);
  const delBtn = el("button", { class: "bad" }, [document.createTextNode("Delete")]);

  const card = el("div", { class: "card" }, [
    el("div", { class: "row space" }, [
      el("div", {}, [el("div", { class: "h1", text: liftName }), el("div", { class: "muted", text: `Type: ${lift.type}` })]),
      el("div", { class: "pill", text: `Suggested next: ${suggestForLift(liftName)}` })
    ]),
    el("div", { class: "row" }, [
      el("div", { class: "muted", text: "Type" }), typeSel,
      el("div", { class: "muted", text: "Deload %" }), deloadPct,
      el("div", { class: "muted", text: "Fails to deload" }), failToDeload
    ]),
    el("div", { style: "height:10px" }),
    el("div", { class: "row" }, [
      ...(lift.type === "timed"
        ? [el("div", { class: "muted", text: "Next seconds" }), nextSeconds]
        : [el("div", { class: "muted", text: `Next weight (${state.data.profile.unit})` }), nextWeight,
           el("div", { class: "muted", text: `Increment (${state.data.profile.unit})` }), increment])
    ]),
    el("div", { style: "height:10px" }),
    el("div", { class: "row" }, [
      ...(lift.type === "hypertrophy"
        ? [el("div", { class: "muted", text: "Rep min" }), repMin, el("div", { class: "muted", text: "Rep max" }), repMax]
        : lift.type === "accessory"
          ? [el("div", { class: "muted", text: "Target reps" }), repsTarget]
          : [])
    ]),
    ...(lift.type === "timed" ? [] : [
      el("div", { style: "height:10px" }),
      el("div", { class: "row" }, [
        reducedSetsCheck,
        el("div", { class: "muted", text: "Reduce weight 9% on sets 2+" })
      ])
    ]),
    el("div", { style: "height:10px" }),
    el("div", { class: "row" }, [saveBtn, delBtn])
  ]);

  saveBtn.addEventListener("click", () => {
    const t = typeSel.value;
    lift.type = t;

    lift.deloadPct = clamp01(Number(deloadPct.value) / 100, 0.01, 0.50);
    lift.failToDeload = clampInt(Number(failToDeload.value), 1, 10);

    if (t === "timed") lift.nextSeconds = clampInt(Number(nextSeconds.value), 10, 600);
    else {
      lift.nextWeight = clampNumber(Number(nextWeight.value), 0, 5000);
      lift.increment = clampNumber(Number(increment.value), 0.5, 100);
    }

    if (t === "hypertrophy") {
      lift.repMin = clampInt(Number(repMin.value), 1, 30);
      lift.repMax = clampInt(Number(repMax.value), lift.repMin, 40);
    }
    if (t === "accessory") lift.repsTarget = clampInt(Number(repsTarget.value), 1, 50);
    if (t !== "timed") lift.reducedSets = reducedSetsCheck.checked;

    saveData();
    renderAll();
    showToast("Lift saved");
  });

  delBtn.addEventListener("click", () => {
    delete state.data.lifts[liftName];
    saveData();
    renderAll();
  });

  return card;
}

function renderAddLiftCard() {
  const name = el("input", { placeholder: "New lift name" });
  const typeSel = el("select", {}, [
    el("option", { value: "strength", text: "Strength" }),
    el("option", { value: "hypertrophy", text: "Hypertrophy" }),
    el("option", { value: "accessory", text: "Accessory" }),
    el("option", { value: "timed", text: "Timed" })
  ]);
  const start = el("input", { type: "number", step: "2.5", placeholder: "Start weight or seconds" });
  const inc = el("input", { type: "number", step: "0.5", placeholder: "Increment" });
  const reducedCheck = el("input", { type: "checkbox", style: "width:18px;height:18px;min-width:18px" });
  const addBtn = el("button", { class: "ok" }, [document.createTextNode("Add lift")]);

  addBtn.addEventListener("click", () => {
    const n = (name.value || "").trim();
    if (!n) return;
    const t = typeSel.value;
    const s = Number(start.value);
    const i = Number(inc.value);
    const reduced = reducedCheck.checked;

    if (t === "timed") state.data.lifts[n] = mkTimed(Number.isFinite(s) && s > 0 ? s : 45, 5, 0.10, 3, false);
    else if (t === "hypertrophy") state.data.lifts[n] = mkHypertrophy(Number.isFinite(s) ? s : 0, Number.isFinite(i) && i > 0 ? i : 5, 8, 12, 0.10, 3, reduced);
    else if (t === "strength") state.data.lifts[n] = mkStrength(Number.isFinite(s) ? s : 0, Number.isFinite(i) && i > 0 ? i : 5, 0.10, 3, reduced);
    else state.data.lifts[n] = mkAccessory(Number.isFinite(s) ? s : 0, Number.isFinite(i) && i > 0 ? i : 5, 10, 0.10, 3, reduced);

    saveData();
    renderAll();
    showToast("Lift added");
  });

  return el("div", { class: "card" }, [
    el("div", { class: "h1", text: "Add a lift" }),
    el("div", { class: "row" }, [el("div", { class: "muted", text: "Name" }), name, el("div", { class: "muted", text: "Type" }), typeSel]),
    el("div", { style: "height:10px" }),
    el("div", { class: "row" }, [el("div", { class: "muted", text: "Start" }), start, el("div", { class: "muted", text: "Increment" }), inc]),
    el("div", { style: "height:10px" }),
    el("div", { class: "row" }, [reducedCheck, el("div", { class: "muted", text: "Reduce weight on sets 2+ (9% drop)" }), addBtn]),
    el("div", { class: "small", text: "You can tweak everything after adding." })
  ]);
}

function renderSettings() {
  const root = document.getElementById("tab-settings");
  clear(root);

  root.appendChild(el("div", { class: "card" }, [
    el("div", { class: "h1", text: "Settings" }),
    el("div", { class: "muted", text: "Adjust increments and deload behavior per lift." })
  ]));

  const name = el("input", { value: state.data.profile.name || "Jay" });
  const unit = el("select", {}, [el("option", { value: "lb", text: "lb" }), el("option", { value: "kg", text: "kg" })]);
  unit.value = state.data.profile.unit || "lb";

  const saveProfile = el("button", { class: "primary" }, [document.createTextNode("Save profile")]);
  saveProfile.addEventListener("click", () => {
    state.data.profile.name = name.value || "Jay";
    state.data.profile.unit = unit.value || "lb";
    saveData();
    renderAll();
    showToast("Profile saved");
  });

  root.appendChild(el("div", { class: "card" }, [
    el("div", { class: "h1", text: "Profile" }),
    el("div", { class: "row" }, [el("div", { class: "muted", text: "Name" }), name, el("div", { class: "muted", text: "Unit" }), unit, saveProfile])
  ]));

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
  const sched = state.data.profile.schedule || [0, 2, 4];
  const selected = new Set(sched);

  const pickerWrap = el("div", { class: "day-picker" });
  const summaryEl = el("div", { class: "schedule-summary" });

  function updateSummary() {
    const sorted = [...selected].sort((a, b) => a - b);
    const labels = ["A", "B", "C"];
    const parts = sorted.map((d, i) => `${labels[i]} = ${DAY_NAMES[d]}`);
    summaryEl.textContent = parts.length === 3 ? parts.join(" \u2022 ") : `Select ${3 - parts.length} more day${3 - parts.length === 1 ? "" : "s"}`;
  }

  for (let i = 0; i < 7; i++) {
    const btn = el("div", {
      class: `day-btn${selected.has(i) ? " selected" : ""}`,
      text: DAY_LETTERS[i]
    });
    btn.addEventListener("click", () => {
      if (selected.has(i)) {
        selected.delete(i);
        btn.classList.remove("selected");
      } else {
        if (selected.size >= 3) return;
        selected.add(i);
        btn.classList.add("selected");
      }
      updateSummary();
    });
    pickerWrap.appendChild(btn);
  }

  updateSummary();

  const saveDays = el("button", { class: "primary" }, [document.createTextNode("Save schedule")]);
  saveDays.addEventListener("click", () => {
    if (selected.size !== 3) return;
    state.data.profile.schedule = [...selected].sort((a, b) => a - b);
    saveData();
    renderAll();
    showToast("Schedule saved");
  });

  root.appendChild(el("div", { class: "card" }, [
    el("div", { class: "h1", text: "Training Days" }),
    el("div", { class: "muted", text: "Pick 3 days. First = Workout A, second = B, third = C." }),
    pickerWrap,
    summaryEl,
    el("div", { style: "height:10px" }),
    saveDays
  ]));

  const liftNames = Object.keys(state.data.lifts).sort((a,b) => a.localeCompare(b));
  for (const ln of liftNames) root.appendChild(renderLiftConfigCard(ln));
  root.appendChild(renderAddLiftCard());
}

function renderAll() {
  setTodayLine();
  renderToday();
  const hasLogState = Object.keys(logState.sets).length > 0;
  if (!hasLogState) renderLog();
  renderHistory();
  renderSettings();
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(p => p.classList.add("hidden"));
  document.getElementById(`tab-${name}`).classList.remove("hidden");
  const mainFoot = document.querySelector(".foot");
  const logFoot = document.querySelector(".log-footer");
  if (mainFoot) mainFoot.style.display = name === "log" ? "none" : "flex";
  if (logFoot) logFoot.style.display = name === "log" ? "flex" : "none";
  const picker = document.querySelector(".timer-picker");
  if (picker) picker.remove();
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));
}

function setupExportImportReset() {
  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abc-lift-tracker-${isoToday()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importFile").addEventListener("change", async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const d = JSON.parse(text);
      if (!d || d.version !== 1) return;
      state.data = d;
      saveData();
      renderAll();
    } catch {
      // ignore
    } finally {
      ev.target.value = "";
    }
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all local data on this device?")) return;
    state.data = structuredClone(DEFAULT_DATA);
    saveData();
    renderAll();
    switchTab("today");
  });
}

function showOnboarding() {
  const overlay = el("div", { class: "onboarding-overlay" })

  const nameInput = el("input", { placeholder: "Your name", value: "Jay" })
  const unitSel = el("select", {}, [
    el("option", { value: "lb", text: "lb (pounds)" }),
    el("option", { value: "kg", text: "kg (kilograms)" })
  ])
  unitSel.value = "lb"
  const bwInput = el("input", { type: "number", step: "0.1", placeholder: "e.g. 185" })

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"]
  const selected = new Set([0, 2, 4])

  const pickerWrap = el("div", { class: "day-picker" })
  const summaryEl = el("div", { class: "schedule-summary" })

  function updateSummary() {
    const sorted = [...selected].sort((a, b) => a - b)
    const labels = ["A", "B", "C"]
    const parts = sorted.map((d, i) => `${labels[i]} = ${DAY_NAMES[d]}`)
    summaryEl.textContent = parts.length === 3
      ? parts.join(" \u2022 ")
      : `Select ${3 - parts.length} more day${3 - parts.length === 1 ? "" : "s"}`
  }

  for (let i = 0; i < 7; i++) {
    const btn = el("div", { class: `day-btn${selected.has(i) ? " selected" : ""}`, text: DAY_LETTERS[i] })
    btn.addEventListener("click", () => {
      if (selected.has(i)) {
        selected.delete(i)
        btn.classList.remove("selected")
      } else {
        if (selected.size >= 3) return
        selected.add(i)
        btn.classList.add("selected")
      }
      updateSummary()
    })
    pickerWrap.appendChild(btn)
  }
  updateSummary()

  const startBtn = el("button", { class: "primary", style: "width:100%;padding:14px;font-size:16px" }, [document.createTextNode("Get Started")])
  startBtn.addEventListener("click", () => {
    if (selected.size !== 3) return
    state.data.profile.name = (nameInput.value || "").trim() || "Jay"
    state.data.profile.unit = unitSel.value
    state.data.profile.schedule = [...selected].sort((a, b) => a - b)
    const bw = parseFloat(bwInput.value)
    if (Number.isFinite(bw) && bw > 0) state.data.bodyweight = [{ date: isoToday(), weight: bw }]
    saveData()
    renderAll()
    overlay.remove()
  })

  overlay.appendChild(el("div", { class: "onboarding-box" }, [
    el("div", { class: "onboarding-title", text: "5x5+" }),
    el("div", { class: "onboarding-sub", text: "Let\u2019s get you set up." }),
    el("div", { style: "height:24px" }),
    el("div", { class: "card" }, [
      el("div", { class: "h1", text: "What\u2019s your name?" }),
      el("div", { style: "height:8px" }),
      nameInput
    ]),
    el("div", { style: "height:10px" }),
    el("div", { class: "card" }, [
      el("div", { class: "h1", text: "Weight unit" }),
      el("div", { style: "height:8px" }),
      unitSel
    ]),
    el("div", { style: "height:10px" }),
    el("div", { class: "card" }, [
      el("div", { class: "h1", text: "Bodyweight" }),
      el("div", { class: "muted", text: "Optional \u2014 you can update this any time." }),
      el("div", { style: "height:8px" }),
      bwInput
    ]),
    el("div", { style: "height:10px" }),
    el("div", { class: "card" }, [
      el("div", { class: "h1", text: "Training days" }),
      el("div", { class: "muted", text: "Pick 3 days. First = Workout A, second = B, third = C." }),
      el("div", { style: "height:10px" }),
      pickerWrap,
      summaryEl
    ]),
    el("div", { style: "height:20px" }),
    startBtn
  ]))

  document.body.appendChild(overlay)
}

setupTabs();
setupExportImportReset();
renderAll();
if (!localStorage.getItem(STORAGE_KEY)) showOnboarding();
