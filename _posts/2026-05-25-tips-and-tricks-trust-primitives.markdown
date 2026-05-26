---
layout: post
read_time: true
show_date: true
title: "Tips & Tricks: CI/CD Hardening and the Security Operating Model"
date: 2026-05-25 00:00:00 +0100
description: Practical takeaways from the May 2026 TanStack compromise. How to harden CI/CD trust primitives, and how to resize the operating model around modern security artefacts.
img: series/tips-and-tricks-cover.jpg
img_in_post: false
hide_description: true
tags: [appsec, ci-cd, supply-chain, operating-model, tips]
author: David Andersson
---

<div class="tips-layout">
<div style="background-color:#1a2744; color:#ffffff; border-radius:0.75rem; padding:2rem 2.5rem; margin-bottom:2.5rem;">
  <h2 style="color:#ffffff; font-size:2rem; font-weight:800; margin:0 0 1rem 0;">CI/CD &amp; Operating Model Tips &amp; Tricks</h2>
  <p style="font-size:1.05rem; line-height:1.7; margin:0; font-weight:500;">
      A working summary of the practical takeaways from <a href="{% post_url 2026-05-25-three-trust-primitives %}" style="color:#b1fedc; text-decoration:underline;">Three Trust Primitives, One Attack</a>. The May 11 TanStack compromise revealed how three CI/CD trust primitives drifted out of their design envelopes at once, and why the operating model around modern security artefacts has to follow. Use the first row as a hardening checklist for your pipelines, and the second row as a starting point for the harder leadership conversation about roles.
  </p>
</div>

<div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">

  <!-- Card 1: CI/CD primitives -->
  <div style="background-color:#e8f4f8; border-radius:0.75rem; padding:1.75rem;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem;">
      <h2 style="font-size:1.2rem; font-weight:800; color:#1a2744; margin:0;">Tighten your trust primitives</h2>
      <span style="font-size:2rem; opacity:0.6;">⚙️</span>
    </div>

    <h3 style="font-size:1rem; font-weight:700; color:#1a2744; margin:0 0 0.5rem 0;"><code>pull_request_target</code> discipline</h3>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      Audit every workflow in your repositories that uses <code>pull_request_target</code>. The Pwn Request pattern is two years old and still landing, most recently inside one of the most widely used JavaScript libraries on npm. The rule is simple: fork-supplied code should never be checked out into a context that holds your secrets.
    </p>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      Separate your read-only PR-check workflows from your publish-capable workflows. If a workflow needs to do both, split it. The same primitive was the proximate cause of the April 2025 Grafana Labs CI/CD incident; this is not a niche risk.
    </p>

    <h3 style="font-size:1rem; font-weight:700; color:#1a2744; margin:0 0 0.5rem 0;">Cache scope and OIDC tokens</h3>
    <p style="font-size:0.9rem; line-height:1.65; margin:0; color:#2a3439;">
      The GitHub Actions cache is not just data; it is a code path that the next workflow will load. Caches that cross the fork-to-base trust boundary are an injection vector. Scope cache keys so PR runs cannot poison base runs. Short OIDC token lifetimes are good hygiene but only matter if nothing inside the runner can read <code>/proc/&lt;pid&gt;/mem</code>. Treat the runner process itself as part of your threat model.
    </p>
  </div>

  <!-- Card 2: Detection -->
  <div style="background-color:#fce8e8; border-radius:0.75rem; padding:1.75rem;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem;">
      <h2 style="font-size:1.2rem; font-weight:800; color:#1a2744; margin:0;">Detect by observing, not by signing</h2>
      <span style="font-size:2rem; opacity:0.6;">🛰️</span>
    </div>

    <h3 style="font-size:1rem; font-weight:700; color:#1a2744; margin:0 0 0.5rem 0;">Build-environment runtime telemetry</h3>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      A signed attestation only proves the build identity, not the build behaviour. Telemetry from inside the runner is now a security control: <code>Runner.Worker</code> process events, OIDC token redemption patterns, post-merge artefact diffs, unusual cache key reads. If your SRE team has been doing high-cardinality CI tracing for years, the security team needs a seat at that table this quarter.
    </p>

    <h3 style="font-size:1rem; font-weight:700; color:#1a2744; margin:0 0 0.5rem 0;">Verify, then question</h3>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      Verify SLSA attestations as you always have. Then ask the harder question: does this attestation describe a pipeline that did what it was supposed to do? Diff attestations across builds. Anomalies in dependency lists, new network IO, or new build steps are now security signals.
    </p>
    <p style="font-size:0.9rem; line-height:1.65; margin:0; color:#2a3439;">
      Behavioural baselines for publish events are a small engineering investment with a high return. If you can answer "what did our last hundred legitimate publishes look like, and how does this one compare," you can detect the May 11 attack class in the runner, not just clean up after it in the registry.
    </p>
  </div>

</div>

<div class="tips-page-break"></div>

<div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">

  <!-- Card 3: Operating model -->
  <div style="background-color:#e8f4f8; border-radius:0.75rem; padding:1.75rem;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem;">
      <h2 style="font-size:1.2rem; font-weight:800; color:#1a2744; margin:0;">Resize your team for what artefacts have become</h2>
      <span style="font-size:2rem; opacity:0.6;">🧭</span>
    </div>

    <h3 style="font-size:1rem; font-weight:700; color:#1a2744; margin:0 0 0.5rem 0;">Audit your artefact economics</h3>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      For each artefact your team produces or consumes (SBOMs, SOC 2 reports, attestations, PR reviews, audit binders), answer two questions: how cheap is it to produce now, and how long does it take to evaluate well? If production has scaled by an order of magnitude over the past five years and evaluation has not, you have a sizing problem, not a tooling problem. This is a budget conversation, not a vendor conversation.
    </p>

    <h3 style="font-size:1rem; font-weight:700; color:#1a2744; margin:0 0 0.5rem 0;">Five role moves to plan</h3>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      Evidence work as engineering work: rescope GRC analysis as controls engineering, with structured evidence emitted continuously from the platform.
    </p>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      Detection engineering against the artefacts themselves, grown out of SecOps rather than AppSec. SecOps already thinks in signals; this is signals-as-code on the same query infrastructure SRE has been running for a decade.
    </p>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      Pipeline-runtime telemetry as a named role, sitting between platform engineering and security. The job description looks more like SRE than AppSec, with security responsibilities layered on.
    </p>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      AppSec as agent-orchestrated review-at-scale: agents run the breadth pass on every change, humans enrich and judge. The asymmetry that breaks the rest of the model becomes AppSec's leverage point.
    </p>
    <p style="font-size:0.9rem; line-height:1.65; margin:0; color:#2a3439;">
      Vulnerability response as coordination, not throughput: the SCA-driven side dissolves into Detection Engineer and AppSec Engineer; the disclosure-coordination side becomes Vulnerability Response Lead, a role measured by state-machine integrity rather than tickets closed.
    </p>
  </div>

  <!-- Card 4: Leadership conversation -->
  <div style="background-color:#fce8e8; border-radius:0.75rem; padding:1.75rem;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem;">
      <h2 style="font-size:1.2rem; font-weight:800; color:#1a2744; margin:0;">Have the harder conversation</h2>
      <span style="font-size:2rem; opacity:0.6;">📋</span>
    </div>

    <h3 style="font-size:1rem; font-weight:700; color:#1a2744; margin:0 0 0.5rem 0;">Name the work that does not transition</h3>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      Some of the current security work transitions cleanly into the new operating model. Some of it does not. The leadership job is naming which is which, and being honest with the people doing the work that does not. This is the part of the conversation that does not fit on a slide, and it does not get easier by being postponed.
    </p>

    <h3 style="font-size:1rem; font-weight:700; color:#1a2744; margin:0 0 0.5rem 0;">The 90-day plan</h3>
    <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
      The vendor pitch deck on the table is not the right artefact to be reading. The right artefacts are three: the org chart, the hiring plan, and an honest list of work products that no longer earn their place when the cost of producing them drops by an order of magnitude.
    </p>
    <p style="font-size:0.9rem; line-height:1.65; margin:0; color:#2a3439;">
      Get these three on the table for the next quarterly review. Whatever tooling decision is being argued about will follow from them, not the other way around.
    </p>
  </div>

</div>

<!-- Contact section -->
<div style="background-color:#e8f0ec; border-radius:0.75rem; padding:1.75rem; margin-bottom:2rem;">
  <h2 style="font-size:1.2rem; font-weight:800; color:#1a2744; margin:0 0 0.75rem 0;">Want to discuss?</h2>
  <p style="font-size:0.9rem; line-height:1.65; margin:0 0 1rem 0; color:#2a3439;">
    The full argument behind these tips lives in <a href="{% post_url 2026-05-25-three-trust-primitives %}">Three Trust Primitives, One Attack</a>. If you want to talk through any of this for your own organization, reach out via <a href="/contact.html">the contact page</a>.
  </p>
</div>

</div><!-- /.tips-layout -->
