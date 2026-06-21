---
layout: post
read_time: true
show_date: true
title: "Why Security Leadership Needs T-Shaped Thinking"
date: 2026-06-20 09:00:00 +0100
description: Specialist-only career models no longer fit modern security organizations. T-shape, depth in one specialty and fluency across the others, is the floor of the modern leadership profile, and AI is making T-shape required sooner than the older boundaries did.
img: posts/20260620/t-shaped-leader.jpg
img_in_post: false
tags: [leadership, security program, head of security, organizational design, ai]
author: David Andersson
---

Consider how a modern security incident actually unfolds. A pull request quietly swaps `pull_request` for `pull_request_target` in a GitHub Actions workflow. The change passes review. An attacker finds it within hours, exfiltrates secrets from the runner, and starts validating cloud tokens. By the time anyone notices, the incident touches the AppSec team that should have been invited to review the change, the cloud security team that owns the tokens and the blast radius, the SecOps team that runs the forensic queries, the GRC team that has to interpret the customer notification clauses, the engineering organisation that has to remediate without breaking deploy velocity, and the executive team that has to decide what to say in public.

That is not a theoretical incident. That is an example of what work looks like now.[^grafanacon]

## The career model that built us

For most of the last twenty years, security careers have rewarded depth. Become the person who knows web application security. Become the person who knows the cloud. Become the person who knows compliance. The career ladder ran vertically through your specialty, the salary bands too, and the conferences you attended were specialist conferences where you talked to people who already knew what you knew. The model worked when the work was narrow enough that one specialist could own it, when the boundaries between AppSec and SecOps and Cloud and GRC stayed stable, and when the cost of crossing those boundaries was paid by someone else.

Those conditions have unwound.

## The work crosses the boundaries, the org chart does not

Look at almost any modern security problem and the boundaries collapse. A vulnerability in a cloud-native application reaches engineering, AppSec, cloud security, vulnerability management, and incident response inside an hour. A new privacy regulation reaches GRC, engineering enablement, product, and legal inside a week. The threat model for an AI feature includes prompt injection (AppSec), model and tooling supply chain (vendor management), training data handling (GRC), inference cost abuse (SecOps), and customer trust (business). No single specialist has the vocabulary to lead a response that spans all of these.

The work is getting less siloed. The org charts stay the same.

## This is a systems failure, not a personal one

The deep-only security leader is rarely the problem. They are, in most cases, very good at their specialty. The problem is that the organisation is asking them to do something the design of their role never had to support. The career system rewarded depth, the hiring system selected for depth, the salary bands reinforced depth, and now the role design quietly expects breadth.

The gap between what the leadership system produces and what the leadership work requires is a systems failure, not an individual one. Security outcomes are driven by systems, incentives, ownership, and organisational design, not by individual effort.[^deming] Leadership outcomes follow the same rule.

## What deep-only leadership actually costs

Three failure modes show up consistently when a head of security has depth in one specialty and limited fluency across the others.

The budget drifts. Investment concentrates in the leader's specialty because those decisions feel safe to evaluate, and the rest of the program is read by the organisation as the leader's implicit definition of what security is.

The specialists outside the leader's specialty lose advocacy. The cloud lead or the GRC lead has to make their own case upward, because the person who should translate their work into business language does not have the vocabulary to do it.

Most importantly, mediation breaks. When the AppSec, cloud, SecOps, and GRC leads disagree about who owns a problem, the deep-only leader cannot adjudicate on merits. They can only side with whoever sounds most like them. The team learns this within a quarter and starts routing decisions accordingly, which means the seams between specialties stop receiving leadership attention, which is exactly where the modern incident lives.

Of these three, the mediation failure is the one that does the most damage and gets discussed the least, because it shows up as quiet drift rather than visible breakdown.

## What T-shape actually means

The shape is borrowed from product design. Tim Brown at IDEO popularised it; David Guest used it earlier.[^tshape-origin] The vertical bar is depth in one discipline. The horizontal bar is breadth across many. It is not new. What is new is how consistently the modern security organisation now produces problems that deep-only leaders cannot handle.

A T-shaped security leader has depth in one specialty, deep enough to remain technically credible, and fluency across all the others, fluent enough to make good decisions and to recognise what good looks like. The vertical bar is the area where they can still go toe to toe with senior practitioners and add value to a hard technical conversation. The horizontal bar is enough cloud, enough GRC, enough SecOps, enough engineering, enough business, to read the room and to recognise when something is off.

The shape matters because real work does not respect specialties. The most interesting security problems sit at the seams between domains, which is exactly where the deep-only specialist runs out of language and the breadth-only generalist runs out of credibility. T-shape is the only shape that survives both edges.

## T-shape is the floor, not the ceiling

T-shape is the entry condition for modern security leadership, not the destination. The senior leaders who run the largest security organisations over the next decade will look more like pi-shape, two specialties at depth, or comb-shape, several specialties at meaningful depth, than like a single tall T. Those shapes do not come from career models that select for depth alone. They come from leaders who started learning the second specialty before the system asked them to.

## AI changes the rate, not the rule

AI is not a new specialty to stack onto the T. It is a force that changes the rate at which the seams produce work. The GitHub Actions incident in the opening took hours from pull request to compromise. Agentic development compresses that further: a feature flagged on Monday morning can be drafted, tested, PR'd, and deploy-ready by lunchtime.[^agentic-research] The seam-collision the article describes does not disappear under that velocity. It compounds.

AI fluency is becoming a mandatory dimension of the horizontal bar, on the same scale as cloud or GRC were a decade ago. The leader who cannot reason about prompt injection[^promptinjection] in a design review, evaluate an AI supply chain claim,[^mitreatlas] or push back on an AI-generated remediation plan is operating below the modern floor. The clock for that to become widely true is not a decade. It is the next two or three years.

A subtler test sits inside this. AI gives T-shaped leaders a tool to maintain breadth more efficiently. A leader can ask an AI to summarise the state of cloud security tooling, the changes in a new compliance regime, the threat surface of a new architecture. The value of that summary is bounded by the leader's own fluency. A leader with no horizontal breadth gets a confident-sounding summary they cannot evaluate. A T-shaped leader gets a faster reading partner. The same tool, used by leaders at two different shapes, produces two different qualities of decision.

## What T-shape looks like in operating mode

T-shape is not a credential. It shows up in how leaders run their function.

They run architecture reviews that ask the seam questions. Where does this design produce data, or AI-mediated behaviour, that crosses domains? Whose threat model owns that boundary? What is the agreed response if it fails? Specialty-deep leaders ask whether the design is secure inside each domain. T-shaped leaders ask whether it is secure between them.

They hire and promote against breadth alongside depth. The senior engineer who has worked on AppSec for ten years is a great AppSec lead. They are not automatically a great director-of-security-engineering candidate. T-shaped leaders look for the people who have worked across two or three specialties in a hands-on capacity, because those are the people who can read the seams.

They spend security budget in a different shape. Specialty-deep leaders tend to spend within their specialty, because those decisions feel safe. T-shaped leaders fund the boundary functions: detection engineering, security platform engineering, security enablement. These functions are chronically underfunded because no specialty owns them, and they only get funded when the leader can see across all of them.

## The argument against T-shape, and what is true about it

There is a real tradeoff here. A leader's bandwidth is finite. Time spent learning cloud at intermediate depth is time not spent staying current at expert depth in AppSec. The honest version of T-shape is bounded breadth, not unlimited breadth. The relevant question is not "do I know everything," it is "do I know enough to lead, decide, and recognise risk across the domains my organisation actually spans."

There is also a narrow-organisation case where deep-only leadership is genuinely appropriate. A pure-play cryptography vendor, a hardware security module manufacturer, a focused threat-intelligence boutique: the leader of a deeply specialised function in a deeply specialised organisation can survive on depth, because the seams are few and the cross-domain demand is low. Most security organisations are not in that category, and most security leaders should not plan their career as if they will be.

The version of the argument that fails is the one that says deep-only is fine because specialists can be hired underneath. They can. But the leader still has to mediate when those specialists disagree, evaluate when each is wrong, and translate the whole program upward in business terms. None of that runs on hiring. It runs on the leader's own breadth, which is precisely the thing the older career model never taught anyone to build, and a leader who refuses to engage with AI as the latest entrant to that breadth is choosing depth-only by default.

## Close

The security work, the engineering work, and the business work are no longer separable in the way the older career model assumed. Leaders without breadth are not flexible enough to handle the modern problem. Leaders without depth are not credible enough to lead the modern engineer. The shape that survives sits between the two, and getting there is a system to build, not a habit to acquire.

Are you the person who can sit in that architecture review and tell which specialist is right when they disagree? If not, the more useful question is whether the system around you, the hiring pipeline, the promotion criteria, the way breadth is rewarded, is set up to produce that person. The answer for most security organisations today is no. That is the work the next decade of security leadership has to fix. AI is making the front end of that decade the part that matters most.

[^grafanacon]: For a walk-through of a real incident with exactly this mechanic, see [Lessons from a Security Incident (GrafanaCON 2026)]({% post_url 2026-05-15-grafanacon-lessons-from-a-security-incident %}).

[^deming]: W. Edwards Deming estimated that 94% of variation in organisational outcomes belongs to the system itself, with only 6% attributable to special causes (see [The W. Edwards Deming Institute](https://deming.org/quotes/i-should-estimate-that-in-my-experience-most-troubles-and-most-possibilities-for-improvement-add-up-to-the-proportions-something-like-this94-belongs-to-the-system-responsibility-of-management6-sp-3/)). The argument is developed in *Out of the Crisis* (MIT Press, 1986).

[^tshape-origin]: David Guest, "The hunt is on for the Renaissance Man of computing," *The Independent*, 17 September 1991, is the earliest mainstream use. Tim Brown later popularised the shape from IDEO.

[^agentic-research]: For empirical measurement of how coding agents compress development cycles, see ["AI IDEs or Autonomous Agents? Measuring the Impact of Coding Agents on Software Development"](https://arxiv.org/pdf/2601.13597) (arxiv 2601.13597).

[^promptinjection]: OWASP ranks prompt injection as LLM01 in its [Top 10 for LLM Applications (2025)](https://genai.owasp.org/llmrisk/llm01-prompt-injection/), the highest-priority risk in the list since it was first compiled.

[^mitreatlas]: [MITRE ATLAS](https://atlas.mitre.org/) catalogues adversarial tactics against AI-enabled systems, including ML supply chain compromise. Modelled on MITRE ATT&CK.
