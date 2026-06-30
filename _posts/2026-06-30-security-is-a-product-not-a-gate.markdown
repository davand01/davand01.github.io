---
layout: post
read_time: true
show_date: true
title: "Security Is a Product, Not a Gate"
date: 2026-06-30 18:00:00 +0100
description: For years we said security is a process, not a product. That was right, and it still is. What changed is that the modern security team now ships products to make the process run, and the most common one it ships is a gate, which is the worst product it could build.
img: posts/20260630/security-product-not-gate-cover.jpg
img_in_post: false
tags: [appsec, product security, platform-engineering, developer-experience, operating-model]
author: David Andersson
---

For years many of us repeated a line that did more good than almost any other idea in our field: security is a process, not a product.[^schneier] We were right. We are still right. The line was a correction aimed at a specific mistake. People wanted to buy a box (the proverbial firewall), install it, and declare themselves safe. The reminder that security is a process protected a generation of teams from believing that safety could be purchased and then forgotten about.

The idea is not new, but it remains relevant today. A process is still the right mental model for what security is. What has changed is what a process requires in order to run.

## Security is still a process

Let's state some ground rules first. A process that lives in someone's head is not a process. It is a habit, and habits leave when people do. A process that depends on a recurring meeting is not much better. It is a meeting, and meetings get cancelled the week you need them most. For a process to survive contact with a fast-moving engineering organization, it needs something underneath it. Something that keeps running no matter who is awake, who is paying attention, or how close the deadline is. Call it systems, or - for the sake of this article - products.

Consider threat modeling, which most teams consider to be a process. More often than not, threat modeling is the instinct of a security engineer captured on a whiteboard, on the days that engineer happens to be available. That is not a system. It is a person. When the person is busy, the modeling does not happen. When the person leaves, the capability leaves with them. Now consider the same intent rendered as a product: a trigger that fires when a design document reaches a certain stage, a default set of questions tied to the kind of system being built, a place the output lands so it is visible the next time the architecture changes, and a feedback path so the questions improve as real incidents teach you which ones mattered. The intent is identical. One version evaporates under load. The other compounds.

## Artefacts of a modern security team

Look at what a modern security team should strive for in terms of deliverables. Paved roads through the software lifecycle. Continuous integration guardrails that fail a build before a secret reaches a remote. Policy engines that encode a rule once so no human has to remember it under pressure. Secrets management. Internal libraries that make the safe call the default call. Trust portals that answer a customer's hundredth security question without a person writing the hundredth answer. Vulnerability workflows that route a finding to the team that can fix it with a proposed fix already attached.

Each of these carries the defining traits of a product. It has users, and the users have opinions whether or not you ask for them. It has a roadmap, because it is never finished. It has adoption metrics, because something built that no one uses is not a capability, it is a liability with documentation. It has a support burden. It has a user experience, and that experience is either good or bad, and the difference decides whether the thing gets used or routed around.

## The gate is a product, and usually a bad one

The opposite of a security product is not a process. The opposite of a good security product is a bad one. And the most common bad security product in our industry has a name. It is the gate.

A gate is a product. We rarely think of it that way, which is exactly why it stays bad. The gate has users: every engineer who has to pass through it. It has a user experience: the ticket queue, the review request, the wait. It has a service level, usually one that is quietly violated. It has an adoption pattern, and the pattern is avoidance. When a security review is a gate, engineers learn its hours, its blind spots, and its exceptions. They route around it the way water routes around a rock. The work still ships, but without the scrutiny that was intended.

And there is a cost here that should worry a security leader more than lost velocity. A gate that gets routed around does not leave you where you started. It leaves you blind, and it robs you of organizational trust. Before the gate, a risky change might have surfaced in a shared review channel or a design document where you could see it and weigh in. Once the gate punishes disclosure with delay, the rational move for an engineer on a deadline is to stop disclosing. A gate that trains the organization to hide work from security has producetd negative security: you are now less aware of what ships than you would be with no review at all, and you are paying headcount for the privilege. A bad security product is not merely a product nobody uses. It is one that actively destroys the visibility you built it to gain.

This is the real reason gates fail, and it is not the reason most security teams believe. Gates do not fail because engineers are reckless or because they do not care. Gates fail because a gate is a serialization point in a system that is trying to move in parallel. It becomes a bottleneck, something intelligent people under pressure learn to defeat. The more important the gate, the more pressure builds against it, and pressure finds the gaps. You can staff the gate with your best people and it will still lose, because you are not competing against incompetence. You are competing against the path of least resistance, and the gate sits at the top of a hill everyone is already trying to get down.

## The only question that matters

Once you see security capabilities as products, a sharper question replaces the old one. The question was never whether security should build a product. If you run a review process, a policy, an approval step, you have already shipped a product. You shipped it to engineers, and they have already returned their verdict in the only currency that counts, which is whether they reach for it or around it. The only real question is whether the product is one people choose or one they are forced through, and you have already seen what forcing it costs.

This reframes what a security team is for. A gate measures its success by how much it stops. A product measures its success by how much it enables. The first manufactures approvals. The second manufactures leverage. Leverage is the only thing that scales, because the work always grows faster than the security headcount does. If your model of security requires a person in the loop for the right thing to happen, you have built a system that fails the moment you cannot hire fast enough, which is always.

There is a simple test for whether you have built a security product or a security tax. Is the secure path the easy path? If using your tool, your library, your paved road is faster and less painful than not using it, you have built security, and adoption stops being a campaign. If using it is slower or more painful than the alternative, you have built a tax, and taxes get evaded by anyone clever enough to evade them. In an engineering organization, that is everyone. You cannot mandate your way out of a bad answer to this question. You can only build your way out.

None of this is an argument against enforcement, and it is easy to misread "not a gate" as "no hard stops." The secret scanner that breaks the build before a credential reaches a remote blocks absolutely, and it belongs on the list of things a good team ships. Blocking is not the problem. The mechanism is. A gate is a human review that everything queues behind whether or not anything is wrong. A guardrail is automated and instant, and it stops you only at the moment you are doing the wrong thing, where the cheapest way through is to not do the wrong thing. So scan for secrets, break the build, and enforce what is objective enough to enforce without a meeting. What the argument rules out is the human bottleneck and the friction that sends people around it. The caveat is that a guardrail which turns slow, noisy, or easy to skip has quietly become a gate, and engineers route around a skipped check exactly the way they route around a review queue.

## What product thinking demands of the security team

Product thinking also makes demands of the security team itself, and they are uncomfortable demands. It means talking to your users before you build, not after they complain. It means running your own paved road instead of recommending one you have never driven. It means measuring adoption honestly and treating low adoption as a defect in your product rather than a defect in your users. It means deprecating things, owning the migration cost when you do, and accepting that a security tool with no support story is a promise you have already broken. None of this is how security teams are trained to think. All of it is how the good ones now operate.

## Closing

None of this retires the old idea. Security is still a process. The threat does not hold still, the architecture does not hold still, the business does not hold still, and anything you could finish and walk away from was never security to begin with. What has changed is the recognition that a process needs a body to live in. The products a modern team builds are that body. They are what let the process repeat ten thousand times a day without a heroic human standing at every checkpoint. The process is the intent. The product is what makes the intent survive contact with reality.

Which raises a question worth a piece of its own. If a security team's real output is a set of products, and if the gap between a good one and a bad one decides whether the team creates leverage or friction, then it is worth being precise about what those products are made of. They are not features. They are systems. And designing systems, rather than knowing answers, turns out to be the actual job.

[^schneier]: The phrase is Bruce Schneier's, from around the turn of the millennium and can be found [as an article](https://www.schneier.com/essays/archives/2000/04/the_process_of_secur.html), but is maybe most associated with *Secrets and Lies: Digital Security in a Networked World* (Wiley, 2000). It was a deliberate corrective against the idea that security was something you could buy and install once.
