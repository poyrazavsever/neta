"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import logo from "../assets/logo.png";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Mood = "happy" | "neutral" | "sad" | "angry";
type MoodScore = 4 | 3 | 2 | 1;
type Energy = 1 | 2 | 3 | 4 | 5;

type MoodEntry = {
  id: string;
  date: string;
  mood: Mood;
  mood_score: MoodScore;
  energy: Energy;
};

const STORAGE_KEY = "mood-tracker-entries";

const moodConfig: Record<
  Mood,
  { label: string; icon: string; score: MoodScore; color: string }
> = {
  happy: { label: "Mutlu", icon: "😊", score: 4, color: "#2f7d63" },
  neutral: { label: "Nötr", icon: "😐", score: 3, color: "#4f7fbf" },
  sad: { label: "Üzgün", icon: "😔", score: 2, color: "#e3aa38" },
  angry: { label: "Sinirli", icon: "😠", score: 1, color: "#d8644a" },
};

const moodOptions = Object.entries(moodConfig) as Array<
  [Mood, (typeof moodConfig)[Mood]]
>;

const today = () => new Date().toISOString().slice(0, 10);

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Home() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [date, setDate] = useState(today);
  const [mood, setMood] = useState<Mood>("happy");
  const [energy, setEnergy] = useState<Energy>(3);
  const [message, setMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const rawEntries = window.localStorage.getItem(STORAGE_KEY);

    if (!rawEntries) {
      setIsLoaded(true);
      return;
    }

    try {
      const parsedEntries = JSON.parse(rawEntries) as MoodEntry[];
      if (Array.isArray(parsedEntries)) {
        setEntries(sortEntries(parsedEntries));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, isLoaded]);

  const lineData = useMemo(
    () =>
      entries.map((entry) => ({
        date: formatShortDate(entry.date),
        mood: entry.mood_score,
        energy: entry.energy,
      })),
    [entries],
  );

  const pieData = useMemo(
    () =>
      moodOptions
        .map(([key, config]) => ({
          name: config.label,
          value: entries.filter((entry) => entry.mood === key).length,
          color: config.color,
        }))
        .filter((item) => item.value > 0),
    [entries],
  );

  const insights = useMemo(() => buildInsights(entries), [entries]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date) {
      setMessage("Lütfen tarih seç.");
      return;
    }

    if (!mood) {
      setMessage("Lütfen ruh halini seç.");
      return;
    }

    if (energy < 1 || energy > 5) {
      setMessage("Enerji seviyesi 1 ile 5 arasında olmalı.");
      return;
    }

    const moodScore = moodConfig[mood].score;

    setEntries((currentEntries) => {
      const existingEntry = currentEntries.find((entry) => entry.date === date);
      const nextEntry: MoodEntry = {
        id: existingEntry?.id ?? createId(),
        date,
        mood,
        mood_score: moodScore,
        energy,
      };

      const nextEntries = existingEntry
        ? currentEntries.map((entry) =>
            entry.date === date ? nextEntry : entry,
          )
        : [...currentEntries, nextEntry];

      return sortEntries(nextEntries);
    });

    setMessage("Kayıt kaydedildi. Dashboard güncellendi.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={logo}
            alt="Mood Tracker logo"
            className="h-16 w-16 rounded-md object-contain sm:h-20 sm:w-20"
            priority
          />
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">
            Günlük ruh hali dashboard'u
          </h1>
        </div>
        <div className="rounded-md border border-ink/10 bg-white px-4 py-3 text-sm text-ink/70 shadow-soft">
          {entries.length} kayıt
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
        >
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-ink">Bugünün kaydı</h2>
            <p className="mt-1 text-sm text-ink/60">
              Aynı tarih tekrar kaydedilirse eski kayıt güncellenir.
            </p>
          </div>

          <label className="block text-sm font-medium text-ink" htmlFor="date">
            Tarih
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-md border border-ink/15 bg-mist px-3 py-2 outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
          />

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-ink">Ruh hali</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {moodOptions.map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMood(key)}
                  className={`flex min-h-20 flex-col items-center justify-center rounded-md border px-3 py-3 text-center transition ${
                    mood === key
                      ? "border-leaf bg-leaf text-white"
                      : "border-ink/10 bg-mist text-ink hover:border-leaf/60"
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {config.icon}
                  </span>
                  <span className="mt-1 text-sm font-semibold">
                    {config.label}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <label
            className="mt-5 block text-sm font-medium text-ink"
            htmlFor="energy"
          >
            Enerji seviyesi: {energy}
          </label>
          <input
            id="energy"
            type="range"
            min="1"
            max="5"
            step="1"
            value={energy}
            onChange={(event) => setEnergy(Number(event.target.value) as Energy)}
            className="mt-3 w-full accent-leaf"
          />
          <div className="mt-1 flex justify-between text-xs text-ink/50">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-leaf"
          >
            Kaydet
          </button>

          {message ? (
            <p className="mt-3 rounded-md bg-mist px-3 py-2 text-sm text-ink/70">
              {message}
            </p>
          ) : null}
        </motion.form>

        <div className="grid gap-5">
          <ChartCard title="Mood ve enerji trendi">
            {entries.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData} margin={{ left: 0, right: 16 }}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[1, 5]}
                    tickCount={5}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood score"
                    stroke="#2f7d63"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    name="Enerji"
                    stroke="#d8644a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Trend grafiği için ilk mood kaydını ekle." />
            )}
          </ChartCard>

          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <ChartCard title="Mood dağılımı">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {pieData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="Dağılım grafiği kayıt eklendikten sonra görünür." />
              )}
            </ChartCard>

            <ChartCard title="Insight">
              {insights.length > 0 ? (
                <ul className="space-y-3">
                  {insights.map((insight) => (
                    <li
                      key={insight}
                      className="rounded-md border border-ink/10 bg-mist px-3 py-3 text-sm leading-6 text-ink/75"
                    >
                      {insight}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState text="Insight üretmek için en az bir kayıt ekle." />
              )}
            </ChartCard>
          </div>
        </div>
      </section>
    </main>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
    >
      <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
      {children}
    </motion.section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-md border border-dashed border-ink/15 bg-mist px-4 text-center text-sm text-ink/55">
      {text}
    </div>
  );
}

function sortEntries(entries: MoodEntry[]) {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function buildInsights(entries: MoodEntry[]) {
  if (entries.length === 0) {
    return [];
  }

  const latestSeven = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  const moodAverage = average(latestSeven.map((entry) => entry.mood_score));
  const energyAverage = average(latestSeven.map((entry) => entry.energy));
  const mostFrequentMood = getMostFrequentMood(entries);
  const insights = [
    moodAverage >= 3
      ? "Son 7 kayıtta genel ruh halin pozitif görünüyor."
      : "Son 7 kayıtta ruh hali ortalaman düşük görünüyor.",
  ];

  if (energyAverage < 3) {
    insights.push("Enerji seviyen son kayıtlarda düşük seyrediyor.");
  } else {
    insights.push("Enerji seviyen son kayıtlarda dengeli görünüyor.");
  }

  if (mostFrequentMood) {
    insights.push(
      `En sık görülen ruh halin: ${moodConfig[mostFrequentMood].label}.`,
    );
  }

  return insights;
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getMostFrequentMood(entries: MoodEntry[]) {
  const counts = entries.reduce<Record<Mood, number>>(
    (currentCounts, entry) => {
      currentCounts[entry.mood] += 1;
      return currentCounts;
    },
    { happy: 0, neutral: 0, sad: 0, angry: 0 },
  );

  return moodOptions.reduce<Mood | null>((winner, [moodKey]) => {
    if (!winner || counts[moodKey] > counts[winner]) {
      return moodKey;
    }

    return winner;
  }, null);
}
