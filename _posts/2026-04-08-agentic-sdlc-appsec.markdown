---
layout: post
read_time: true
show_date: true
title: "The SDLC has an agent now. Your AppSec program wasn't designed for that."
date: 2026-04-08 12:00:00 +0100
description: Agentic development doesn't just change how fast software is written — it changes who makes security decisions, and at what scale. Here's what that actually means for AppSec.
img: posts/20260408/agentic-sdlc-cover.png
linkedin_image_prompt: "Pixar-style 3D illustration, warm cinematic lighting. The subject is based on the pasted picture of me: a slim man in his mid-thirties, short brown hair swept to the side, round black-framed glasses, light stubble, friendly and slightly bemused expression. He is standing in a modern open-plan office, holding a coffee cup, dressed in a casual-smart outfit — beige zip-neck sweater over a collared shirt. He is positioned at a subtle checkpoint — a glowing archway or turnstile, rendered simply and cleanly, not sci-fi heavy. Around and past him, small luminous AI agent figures — abstract, friendly, slightly geometric, like tiny glowing constructs — are streaming through in a blur of motion, carrying fragments of code, pull request icons, and small padlock symbols. His expression is composed but thoughtful, one eyebrow slightly raised, coffee cup mid-lift — the look of someone who has noticed something important and is deciding what to say about it. Aspect ratio 1:1, suitable for a LinkedIn post thumbnail. No text overlays."
tags: [appsec, product security, sdlc, ai, agentic]
author: David Andersson
mathjax: no
---

Imagine it's a Monday morning. Your developers are barely past the login screen, and an AI agent has already drafted a feature, written the tests, opened a pull request, and flagged a dependency that needs updating. By the time standup is over, the PR is mergeable. By the time the first coffee is brewed, it's in main.

This is not the future. It's increasingly the present, with tools like GitHub Copilot Workspace, Claude Code, and a growing ecosystem of agentic development platforms changing what it means to "write software." And while the engineering community has been busy debating productivity gains and prompt engineering, AppSec has been largely quiet on what this actually means for how we secure software.

That quiet concerns me.

## The traditional SDLC, from an AppSec lens

The traditional software development lifecycle, however you've named it in your organisation, follows a recognisable shape. There's a design phase, a development phase, a testing phase, and a deployment phase. Somewhere along that chain, security gets involved. Ideally early: in threat modelling during design, in secure coding practices during development, in SAST, DAST, and SCA during testing. The pattern of addressing security early in the design phase is well-established in AppSec literature, even if the execution varies wildly in practice.[^1]

What the traditional SDLC has in common across its many flavours, whether waterfall, agile, or whatever hybrid your organisation has arrived at, is that humans make decisions at key points. A developer decides how to handle authentication. A reviewer catches an injection vulnerability. A security engineer flags a misconfigured IAM policy in code review. The pipeline has checkpoints, and humans staff and approve those checkpoints.

Security programs were built around that assumption.

## What the agentic SDLC actually changes

An agentic SDLC automates something more interesting than code generation. It automates decision-making. When an agent writes a function, it also picks the pattern, picks the library, and makes dozens of implicit security decisions along the way, at a velocity no human reviewer was designed to match.

The three things that change most significantly:

### Velocity becomes a security variable

In a traditional SDLC, velocity is usually a delivery concern. In an agentic one, it's a security concern. Technical debt, insecure patterns, and dependency risk no longer accumulate at the speed of human development. They accumulate at the speed of token generation. A poor security hygiene baseline, multiplied by agentic velocity, stops growing linearly and starts growing exponentially.

### The trust boundary is no longer at the keyboard

When a human developer writes a piece of code, we have a relatively clear picture of accountability. When an AI agent writes it, instrumented by a prompt an engineer crafted six months ago and running in a pipeline that three teams have touched, with five different models since its inception, that accountability becomes diffuse. It's a solvable problem, but most organisations haven't started solving it.

### Security controls designed for checkpoints break under continuous flow

SAST tools running on pull requests, security reviews gated behind ticket workflows, manual threat modelling sessions that happen quarterly. These controls assume a cadence. Agentic development doesn't have that cadence. If your controls require human time to execute, and your development no longer requires human time to produce, you have a structural gap.

## The hypothesis: your security program's baseline has never mattered more

I've held this belief for a while, and the agentic shift has only reinforced it: AI will make a good security program great, and a poor security program useless.

The agentic SDLC doesn't introduce fundamentally new vulnerability classes. An LLM-generated SQL injection is still an SQL injection. An agent that selects an outdated cryptographic algorithm still introduces the same risk as a developer who makes the same choice. What changes is the scale at which those decisions are made, the speed at which they propagate, and the difficulty of attributing them to any individual decision point.

If your security program is mature, with solid security requirements embedded in your development workflow, automated controls that don't depend on human checkpoints, and a culture where security is a shared responsibility rather than a gatekeeping function, then the agentic shift works in your favour. Your automated controls run faster. Your security requirements get encoded directly into agent context. Your developers get real-time security feedback at the point of generation, not at the point of review.

If your security program is not mature, the agentic SDLC will surface every gap, at scale, and exploit every weakness in your program before you have the capacity to address it.

## What this means in practice

I'm not arguing for slowing down adoption of agentic tooling. That ship has sailed, and the productivity gains are real. I'm arguing for asking one specific question before you accelerate:

> Is my security program designed to run without human checkpoints?

If the honest answer is no, then three things need attention before your teams adopt agentic development at scale.

### Security requirements need to be machine-readable

If your secure coding standards live in a Confluence page that nobody reads, an agent certainly won't. Embedding security context into agent system prompts, IDE policies, and automated gate criteria is the new "address security early in the design phase," applied one abstraction layer up.

### Automated controls need to be comprehensive, not complementary

SAST, DAST, SCA, and secrets detection need to be capable of running at agentic speed and catching agentic-generated output. That might mean reconsidering tool configurations that were tuned around human development cadences, and it almost certainly means revisiting what "good coverage" looks like when your codebase can double in size over a sprint.[^2]

### Accountability frameworks need updating

When an agent commits code, who is the responsible party in your vulnerability management process? It's a practical question before it's a philosophical one. Your SLAs, escalation paths, and incident response runbooks were written assuming a human on the other end, and that assumption deserves a deliberate review.

Facebook once said "move fast and break things." They quietly stopped saying it about twelve years ago, largely because the things that were breaking became consequential enough to matter. The agentic development wave carries the same energy, the same narrative about velocity as an unambiguous good, and potentially higher stakes. Are we repeating the same chapter, with a larger cast?

## Closing

The SDLC has changed before. It changed when we moved from waterfall to agile, when we moved from monoliths to microservices, when we moved to cloud-native. Each transition created a lag between how software was built and how it was secured, and each time, AppSec had to catch up, often at a cost.

The agentic shift is no different in kind, but it may be larger in degree than anything that has come before.

So, is your AppSec program ready to run without the human checkpoints?

[^1]: NIST's Secure Software Development Framework (SSDF) and OWASP's Software Assurance Maturity Model (SAMM) both ground security activities explicitly in development lifecycle phases, making the checkpoint assumption structural rather than incidental.

[^2]: The OWASP Top 10 for LLM Applications is a useful starting point for understanding what agentic-generated output tends to get wrong, though the field is moving faster than any static list can capture.