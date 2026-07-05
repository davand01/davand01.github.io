---
layout: post
read_time: true
show_date: true
title: "The Security Leader's Job Is to Design Systems"
date: 2026-07-04 20:00:00 +0100
description: Security capabilities fail when they are built as activities instead of systems. A security leader's real job is to tell the two apart, turn the activities into systems, and keep improving those systems long after they are built.
img: posts/20260704/design-systems-cover.jpg
img_in_post: false
tags: [systems thinking, security program, operating-model, leadership]
author: David Andersson
---

In an [earlier piece]({% post_url 2026-06-30-security-is-a-product-not-a-gate %}) I argued that a modern security team's real output is a set of products, and that the difference between a good one and a bad one decides whether the team creates leverage or friction. If you accept that premise, an obvious question follows. If security teams produce products, what do those products look like?

The answer I propose is that each product is a system. 

## What a system actually is

First, let me share my definition of a system. It's not necessarily a tool, or an application. It can be, but it doesn't have to be. A system according to me is a defined set of inputs, a clear owner, some sort of automation that does the repeatable part, a feedback loop that tells you whether or not it is working, and a way to improve it when it fails. Whenever a security capability disappoints, it's usually not because the team members were wrong about the risk. It disappoints because the capability was never built as a system.

One way to help a security leader gauge the quality of each capability would be by asking five discrete questions. What feeds the system? Who owns the feeding? What does it output? Who acts on the output? And what guarantees that steps are taken to improve the thing next time it breaks? 

Each question should be thought of as a link in a chain, and if any of the questions (links) fails, the chain breaks. A capability with a broken link is no longer a system. It has become an activity, and activities (as discussed in the previous article) are one of the places where security effort goes to die.

Four of the five questions come directly from systems theory, but are intentionally designed to be easier to comprehend. What feeds it and what it outputs are _flows_ in the context of systems theory, who acts on the output is a _feedback loop_ and making sure deficiencies are handled and improved is a system's capacity to _change its own structure_. Where systems theory is notably quiet is around ownership. To bridge this gap, I've borrowed from value stream mapping, which follows a piece of work along its whole path, from request to delivered outcome, across every team and handoff, and shows where it waits, stalls, or gets dropped.

What becomes obvious is that organisations typically follow a hierarchical structure - but work flows sideways. Security capabilities die in the gap.

## Case in point

Take vulnerability management. At first glance the hard part looks like building the detection pipeline, so that is where the effort goes. Sources such as scanners and online advisories pour findings into a queue, the queue grows to thousands of items marked critical, and the organisation quickly learns the most dangerous lesson a security program can teach: that the word critical without context means nothing. Nothing is wrong about any individual finding - the system is simply absent. 

The one question with a good answer is what feeds it. Discovery is the easy part; everything after it is where this falls apart. There is no prioritisation function, so raw severity stands in for actual risk and drowns the signal. There is no real owner, because the findings sit in a central security backlog rather than in the repository owned by the team that ships the code. There is no automation worth mentioning, so a person hand-carries each item toward a fix. And there is no feedback loop, so the same two hundred findings reappear next quarter from the same outdated base image, and no one notices that the entire backlog has a single upstream cause.

Start to apply systems thinking instead. The input is still the union of scanner output, dependency advisories, and disclosure reports, but it passes through automation that prioritises findings before they reach a human: reachability, exploitability, and blast radius instead of a severity score detached from whether the vulnerable path can even be reached in your deployment.[^cvss] Instead of being owned by the security team, the owner is now the engineering team that ships the affected service, because they are the only ones who can fix it and the only ones who will absorb the consequences if it breaks. The automation opens the issue in the right repository with the suggested fix already attached, so the cheapest action and the correct action are the same action. The feedback loop measures time to remediate by team and surfaces systemic sources, so the base image generating two hundred findings becomes one piece of work instead of two hundred. And the improvement mechanism aims one level up from the instance: it kills the class. The leader's job here is not to triage faster. It is to design a loop in which triage volume falls over time, because the system keeps removing the sources rather than the symptoms.

You've now seen the chain break and get fixed once. Let's try it again somewhere that looks nothing like vulnerability management.

## A different link breaking

Responding to security questionnaires is another capability that security usually owns. This capability typically breaks at the output link. The team decides the thing to produce is an answer for the customer, when the thing that matters is a finding about themselves. A questionnaire arrives, a person copies answers into a spreadsheet under deadline, sends it back, and files it. The response went out, but the signal went nowhere: every question they couldn't truthfully answer.

A questionnaire is an audit a customer is running on your controls at their own expense. So build the system to keep the findings. Automation answers what the knowledge base can answer, and that is most of it, at scale, without a tired human in the loop. What it can't answer is the whole point: each unanswerable question leaves the response and an internal gap, routed to whoever owns that control. A clean run produces only a reply. A failed one produces a reply and a finding. The gap gets closed, the knowledge base learns the answer, and that question never surfaces again. Answer it once by fixing the control, not forever in a spreadsheet.

## The job is never done

Once you see capabilities as systems, the leader's first job is diagnosis. Walk every capability the team owns and sort it honestly: which are systems, and which are activities wearing a system's clothes. The five questions are the instrument. A capability that fails one isn't underperforming, it's miscategorised, and no amount of effort spent inside an activity turns it into a system. Most of the job is seeing which is which, because an activity with enough people on it looks a great deal like a system that is merely busy.

The second job is conversion, and the two examples already showed its shape: give the activity an owner, wire in the automation, close the loop. This is the work most people picture when they picture the job. It's real, but it's the smaller half. A system, once built, is not finished. It's barely started.

Over time, a system decays. The base image that was clean last year is not. Answers go stale, threat models age, tuned thresholds drift out of tune. The fifth link, improvement, is not a feature you build once and leave running. It is a thing someone keeps alive, on purpose, indefinitely, and that someone is the leader. Not operating the system, someone else does that, but monitoring it, owning it, improving it, quarter after quarter, so it gets better instead of quietly rotting. A system nobody tends is not a triumph of automation. It's an activity again, decaying more slowly.

This is where judgment goes. Not away, up. You stop spending it on the individual call and start spending it on the system that makes the call: is this loop still sound? Is this still the right owner? Is this the class worth killing next? That's a harder question than any single finding, and it's the one only the leader can answer.

So the measure of a security leader is not how many good decisions they made. It's how many good decisions the organisation makes without them, and whether that number is still climbing a year after they stopped watching.[^deming] A capability that only works because one particular person runs it was never a system. It was that person, borrowing the word.

## Closing

All of which is easy to write and hard to do, for one reason this piece has so far set aside. These systems are being introduced into organisations that do not already think this way, that did not ask for them, and that have their own work to do. A system designed in isolation is a slide. A system adopted by an organisation that was not waiting for it is the actual challenge. Which is the last question, and the hardest: how do you start? That is the subject of the next piece.

[^cvss]: I have made the longer version of this argument in [The NVD is retrenching. The model it was built on was already obsolete.]({% post_url 2026-04-21-nvd-retrenchment-obsolete-model %}). The short version: treat the CVE score as one input to a decision, not the decision itself, and invest in the runtime context (reachability, blast radius, compensating controls) that a scanner looking purely for CVE patterns cannot see.

[^deming]: The idea that outcomes owe more to systems than to individual heroics is older than security. W. Edwards Deming argued that most of the variation in what an organisation produces belongs to the system rather than to any one person inside it (*Out of the Crisis*, MIT Center for Advanced Engineering Study, 1982). The version I hold is narrower: a good system works with any capable person in the seat and keeps working when you swap them, which still demands capable people. What it must never do is depend on one named individual, because a capability only one person can run is not a system at all. I have written more about the people side of this in [my piece on T-shaped security leadership]({% post_url 2026-06-20-t-shaped-security-leadership %}).
