---
layout: post
read_time: true
show_date: true
title: "Lessons from a Security Incident (GrafanaCON 2026)"
date: 2026-05-15 09:00:00 +0100
talk_date: 2026-04-21
description: A walkthrough of the April 2025 CI/CD incident at Grafana Labs - one small misconfiguration, fast detection thanks to canary tokens, and why preparation beats reaction.
img: posts/20260515/grafanacon-2026-cover.jpg
img_in_post: false
tags: [speaking, incident-response, ci-cd, appsec, detection-engineering]
author: David Andersson
---

I had the opportunity to speak at **[GrafanaCON 2026](https://grafana.com/events/grafanacon/agenda/lessons-from-a-security-incident/)** in Barcelona, together with Nick Moore, Principal Security Engineer at Grafana Labs, on the topic of _Lessons from that security incident when everything went wrong (but ended up right)_.

![Nick and David on stage at GrafanaCON 2026, with a slide reading "One small change: a small change for Grafana, a giant opportunity for hackers"](./assets/img/posts/20260515/david_a_grafanacon_cropped.jpg)

<div class="aspect-video my-8">
  <iframe class="w-full h-full rounded-sm" src="https://www.youtube.com/embed/4D068lS85NY" title="Lessons from a Security Incident - GrafanaCON 2026" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Abstract

On a Saturday morning in April 2025, two members of the Grafana Labs security team got an alert they had never seen fire before. By the time the dust settled, the team had walked through a full CI/CD compromise, traced every action the attacker took, and confirmed - with evidence, not hope - that no customer or user data had been touched.

The talk tells that story end to end. The vulnerability was a single workflow change that swapped `pull_request` for `pull_request_target`, which is the kind of edit that *looks* safe and *isn't*. The attacker found it within hours, exfiltrated GitHub Secrets with Gato-X, and started validating tokens. The detection that bought us the time we needed came not from a flashy commercial tool, but from a canary token that fired the moment the attacker tried to authenticate. The rest of the response leaned heavily on open source: Loki for forensic queries that GitHub's native tooling cannot do, Trufflehog and Zizmor for sweeping the rest of the estate, Gato-X turned around to give us the attacker's view of our own repositories.

If there is one thing to take away, it is that preparation beats reaction. Detection engineering, observability, and secret hygiene applied to CI/CD is not optional infrastructure; it is the thing that earns you the right to say "no customer impact" and actually mean it.

## Key takeaways

- **The gap between *looks safe* and *is safe* is one keyword wide.** `pull_request_target` exists for legitimate reasons, but combined with user-controllable inputs, it is a foothold waiting to happen. Treat workflow changes the way you would treat changes to an IAM policy.
- **Canary tokens earn their keep when nothing else fires.** Even though they are an unfashionable, decades-old idea, they were the reason this incident was caught in hours rather than weeks.
- **Observability belongs in CI/CD, not only in production.** GitHub's native logs can be deleted by an attacker with the right token. Loki's logs cannot. That difference matters when you are trying to reconstruct what happened, and to whom you need to say what.
- **Open source is a defensive advantage.** Trufflehog, Zizmor, and Gato-X were available the moment we needed them. The same tools the attacker reached for were the ones we used to push them back out.
- **Preparation beats reaction.** The migration from GitHub Secrets to HashiCorp Vault, which was already underway when the incident happened, is a large part of the reason the impact was contained. Subsequent supply-chain compromises in the ecosystem (Aqua, Axios) landed in a much harder Grafana than they would have a year earlier.

## Slides

The slides are available as a [PDF download](./assets/img/posts/files/GrafanaCON_2026_Lessons_From_An_Incident.pdf).

## Recording

A recording of the talk is published on the [GrafanaCON agenda page](https://grafana.com/events/grafanacon/agenda/lessons-from-a-security-incident/), with the full transcript available under the [transcript tab](https://grafana.com/events/grafanacon/agenda/lessons-from-a-security-incident/?tab=transcript).

---

_Presented at GrafanaCON 2026, Barcelona, Spain - {{ page.talk_date | date: "%B %-d, %Y" }}_
