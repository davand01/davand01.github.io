---
layout: post
read_time: true
show_date: true
title: "The NVD is retrenching. The model it was built on was already obsolete."
date: 2026-04-21 00:00:00 +0100
description: The NVD cutbacks are not a funding crisis. They are a design crisis. Monolithic vulnerability intelligence never matched the shape of the actual problem, and defenders who keep treating it as authoritative are paying a tax they do not need to pay.
img: posts/20260421/nvd-retrenchment-cover.png
tags: [appsec, vulnerability management, nvd, euvd, cve, policy]
author: David Andersson
mathjax: no
---

"It's always DNS" is a saying that most people who have been part of solving outages are familiar with. And sure, DNS should not work, given its complexity.

I mean, whenever you're trying to look up an address, what happens is that your query bounces across dozens of systems, sometimes across continents - you will go from your local DNS server, to root servers, a top-level domain nameserver, and an authoritative nameserver for your specific domain. That's before you even notice that something has happened in the background.

It all works because of how DNS is designed. It's built on a clear principle: there can be only one authoritative source for each record. It may be distributed across many nodes, at many levels, with thoughtful redundancy built into every level - but it's still only *one* authoritative source per record.

The root servers are served by anycast from hundreds of physical locations. TLDs delegate to authoritative nameservers. Each level delegates further down the tree. This makes it so that there's one, and only one, correct answer for any given name. However, the system that delivers that answer is designed so that the loss of any single node should never even be noticed by the user (at least in principle).

Why am I mentioning this? Well. I've put some thought into this since the VulnCon announcement - the one that left no one particularly surprised - that NIST would stop attempting to enrich every CVE that gets reported, and would instead prioritise a subset deemed most impactful[^1]. Leaving no one surprised, eh? Well, no. Federal funding was cut by 12% in 2024, and the appsec world prepared for not being able to request CVEs by reserving CVE IDs in advance, just in case. After this, NVD suffered a talent exodus and the backlog of un-enriched records has only grown - both public knowledge for most of the past two years. What happened at VulnCon was not an announcement. It was a concession.

The system also suffers from another flaw by design. If you look at how tools such as Trivy, OSV, Snyk etc. work, they can use a lot of different sources to get information about the vulnerabilities that they detect - and as an outcome, a CVE detected by two tools can be listed with two completely different CVSS scores, potentially triggering internal SLOs that may or may not be correct for that particular vulnerability.

So. All of this got me thinking. Why don't we take this opportunity to redesign how we think about CVEs? Obviously, I'm coming from a utopian view - one where we don't have to take global politics into consideration, only a technology and practitioner's point of view.

For me, ideally, this would not be about *how do we restore the NVD's enrichment capacity*. The question is: why did we ever think one centralised database could scale in the first place? And the challenge that brings is this: could we not take inspiration from DNS, a truly resilient authoritative system at internet scale?

## The shape of the problem

Let's talk numbers. Somewhere around 40,000 CVEs were created in 2025, with an estimated 60,000 by the end of 2026.[^2] The CNA (CVE Numbering Authority) network now spans more than 500 organisations in over 40 countries. By definition in the CVE standard, the minimum data required to file a CVE is an identifier, a brief description, and a reference to the affected product. I.e., everything that makes a CVE *useful* - the exploitability context, the impacted component identifiers, the attack vector metadata - is by definition enrichment, and enrichment has by many been considered the problem of whoever did that at the magical NVD desk.

Meanwhile, AI-assisted vulnerability discovery is not a problem we can afford to postpone. It is already adding measurable volume to CVE intake today, and anyone who has spent five minutes with a modern coding agent can see where the curve is heading. Even if Project Glasswing is not generally available yet, and expected to be expensive - the price of finding vulnerabilities will drop, and the capabilities will not be limited to one single hyped model.

In parallel, the European Union Agency for Cybersecurity launched its own EU Vulnerability Database in 2024 under the NIS2 directive.[^3] The framing was reasonable enough: Europe needs its own authoritative source. Good intentions. Sure. But it still follows the flawed architecture of having many sources that compete with each other. In essence, EUVD is just another authoritative source that dilutes the information for each CVE. Yes, it brings much-needed redundancy, but it still introduces another authoritative source to take into consideration when weighting the vulnerability and preparing your response.

## The model was the problem

My hypothesis therefore is this: let's move away from a model of competing authoritative sources, where each level holds its own set of information for the same CVE. It's an outdated shape from when software developers were the outliers, not the norm.

What defenders actually need is the DNS pattern, applied to CVEs. One authoritative source per record, delegated to the level where that authority genuinely lives, backed by geographic and organisational redundancy so that no single node can take the whole system down with it.

So, let's keep NVD and EUVD. But as soon as there is a source that is more authoritative for a given product, the higher-level node cedes the information it holds - and subsequently responsibility as well - to that more-authoritative source. And you can scale this however far you want. All you need is a root entity that everyone can agree on. Is the analogy of this being the equivalent of DNS Root Servers → TLDs → Authoritative nameservers spot on? No - but it's a way to make an abstraction of it. You could think of it as each CVE existing at every level, but holding information about whether that level is authoritative to respond to the question. Add a short enough TTL to know when the cache needs to update.

This is not a new idea. What is new is the pressure that should be forcing the industry to take it seriously.

And we are already paying a tax for that gap. You can see it in the backlog of un-enriched CVEs. You can see it in the time-to-detection lag that downstream tools inherit when the NVD is behind. You can see it most clearly in the defender who pulls three different CVSS scores from three different providers, and struggles to set up the best possible course of action.

## What this means for defenders

The immediate implication is architectural, not operational. If your vulnerability management program treats the NVD as *the* source of truth, and was built around enriched records arriving within a predictable window, that assumption is already wrong. Three concrete shifts matter.

### Diversify your vulnerability intelligence sources

Identify what's driving your vulnerability response. If it's purely risk-based, and not contractual, treat the NVD as one input, not *the* input. Integrate vendor advisories directly where they exist and prioritise these. Use CISA's KEV catalogue as a filter to identify the most urgent patches. Use the EUVD as a cross-reference, particularly for European-context products. You should be able to determine the best course of action from as many actionable sources as possible, giving most weight to whichever is closest to the product. In other words, manually approximate the delegation model until the infrastructure catches up.

### Stop optimising for the CVSS score

CVSS scores have always been an approximation - a best effort. Now, as that approximation gets slower, the gap between the score and the actual risk in your environment is heavily impacted. Invest in building visibility and context that scanners looking purely for CVE patterns cannot provide, such as runtime exposure, compensating controls, blast radius - and at the end of the day, treat the CVE score as one input to your decision, not the decision itself.

### Design for the agent consumer

The next generation of vulnerability management tooling will be agent-driven. Optimise for that now, regardless of the future of NVD enrichment and whatever comes after. Your internal data needs to be queryable the same way: normalised, cross-referenced, weighted. If your inventory and your vulnerability feed cannot be stitched together by a machine, you are about to be outpaced by organisations whose tooling can. And ultimately, you're not only trying to outrun the bear (or zombie), you're trying to outrun another person being hunted by the same bear (or zombie).

## Closing

The world has changed, but CVE management has struggled to keep up. And this won't be fixed from the top down - regulators default to the architecture they already know. I hope that we will see a change, and I hope that CVE management will ultimately be completely refactored, but until that day - the defenders who stop waiting for it to catch up, and start building against the architecture we actually need, will be the ones who look prepared when the next crack opens.

[^1]: This piece is prompted by coverage of the announcement at VulnCon 2026, in which NIST's Harold Booth described the prioritisation model publicly for the first time.
[^2]: Figures from MITRE and CISA as cited in public remarks at VulnCon 2026.
[^3]: The EU Vulnerability Database, operated by ENISA under the NIS2 directive, launched in 2024. Publicly available at euvd.enisa.europa.eu.
