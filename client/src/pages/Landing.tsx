import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { LAB_NOTICE } from '@/data/environment';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-haven-bg text-haven-text">
      <header className="border-b border-haven-border bg-haven-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-haven-navy text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">HavenSec Arena</p>
              <p className="text-2xs text-haven-muted">Academic cyber range</p>
            </div>
          </div>
          <Link to="/app">
            <Button variant="primary" size="sm">Launch Arena</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-haven-muted">Isolated simulation lab</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-haven-navy sm:text-5xl">
            HavenSec Arena
          </h1>
          <p className="mt-3 text-lg font-medium text-haven-primary">Attack. Detect. Defend. Improve.</p>
          <p className="mt-4 max-w-2xl text-base text-haven-secondary">
            An isolated AI-powered cybersecurity simulation environment where controlled Red Team exercises meet Blue Team defense and measurable evaluation.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-haven-muted">{LAB_NOTICE}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/app">
              <Button variant="primary" size="lg" icon={<ArrowRight size={16} />}>Launch Arena</Button>
            </Link>
            <Link to="/app/scenarios">
              <Button variant="secondary" size="lg">View scenarios</Button>
            </Link>
          </div>
        </section>

        <section className="border-y border-haven-border bg-haven-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
            {[
              { title: 'How it works', body: 'Select a scenario, start a timed synthetic exercise, watch telemetry, then review referee scores. The loop is simulate → detect → respond → evaluate → learn.' },
              { title: 'Red Team', body: 'Recon Simulator, Attack Path Planner, Simulation Executor, and Objective Agent emit lab-only events. They never leave the in-memory range.' },
              { title: 'Blue Team', body: 'Monitoring, Detection, Response, and Recovery agents consume that stream the way a teaching SOC would — alerts, incidents, containment, restore.' },
            ].map((b) => (
              <div key={b.title}>
                <h2 className="text-sm font-semibold text-haven-text">{b.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-haven-secondary">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-semibold">Simulation workflow</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Scenario + isolated sandbox',
              'Red Team synthetic activity',
              'Telemetry to Blue Team',
              'Referee evaluation + report',
            ].map((step, i) => (
              <li key={step} className="rounded-lg border border-haven-border bg-haven-surface p-4">
                <span className="text-2xs font-semibold uppercase text-haven-muted">Step {i + 1}</span>
                <p className="mt-1 text-sm font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 md:grid-cols-2">
          <Card>
            <h2 className="text-sm font-semibold">Referee</h2>
            <p className="mt-2 text-sm text-haven-secondary">
              Prototype metrics for detection time, containment, response quality, recovery, simulated damage, and an overall resilience score. Scores are academic evaluation aids, not certified measurements.
            </p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold">Technology</h2>
            <p className="mt-2 text-sm text-haven-secondary">
              React + TypeScript client, Express simulation API, deterministic in-memory engine, synthetic Acme Digital range. Optional watsonx/OpenAI providers can replace the mock planner later without changing the exercise loop.
            </p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold">Key capabilities</h2>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-haven-secondary">
              <li>Repeatable 30-second demo runs for evaluation</li>
              <li>Live agent status, telemetry, and incidents</li>
              <li>Printable exercise reports</li>
              <li>Coach recommendations after each completed run</li>
            </ul>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold">Future scope</h2>
            <p className="mt-2 text-sm text-haven-secondary">
              MITRE mapping, persisted exercises, additional scenario packs, and authorized research sandboxes. Real-world targeting is out of scope.
            </p>
          </Card>
        </section>
      </main>
    </div>
  );
}
