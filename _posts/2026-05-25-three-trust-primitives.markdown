---
layout: post
read_time: true
show_date: true
title: "Three Trust Primitives, One Attack: What May 11 asks your security organization to become"
date: 2026-05-25 09:00:00 +0100
description: On May 11 between 19:20 and 19:26 UTC, 84 malicious @tanstack/* npm versions shipped with valid SLSA Build Level 3 provenance. The signatures verified. The OIDC binding was real. The malicious package shipped anyway. The artefacts did not fail. The teams reading them were never sized for what they would become.
img: posts/20260525/cover_photo.jpeg
img_in_post: false
tags: [appsec, supply-chain, slsa, tanstack, operating-model, platform-engineering]
author: David Andersson
---

On May 11, 2026, between 19:20 and 19:26 UTC, an attacker published 84 malicious versions across 42 `@tanstack/*` npm packages. The published artefacts carried valid SLSA Build Level 3 provenance attestations, because npm generates them automatically when packages are published via OIDC trusted publishing, and the build did, in the strict sense, happen in TanStack's `release.yml` on `refs/heads/main`. The signatures verified. The OIDC binding was real. The malicious package shipped to consumers anyway.

This is a piece about what happened, the broader campaign it sits inside, and the harder question both leave on the desk of every security leader reading this: what does a security organization become when its primary work product is the same artefact an attacker can produce just as easily?

![Six minutes from first malicious publish to last. Three trust primitives chained. One valid SLSA attestation per artefact.](./assets/img/posts/20260525/timeline.jpeg)

## Six minutes, three trust primitives

The TanStack first-party postmortem[^tanstack] tells the story tight. Between 19:20:39 and 19:26:14 UTC on May 11, an attacker published 84 malicious versions across 42 `@tanstack/*` packages on npm. Five minutes and thirty-five seconds. The attacker did not steal an npm publishing token from a maintainer's laptop. They did not phish a CI secret. They did not brute-force an account. They hijacked TanStack's own legitimate release pipeline, used its trusted OIDC identity to publish, and let npm's standard provenance machinery sign the result on the way out.

The chain involved three separate trust primitives, each functioning exactly as designed, each operating outside the assumptions of that design.

The first was `pull_request_target`. The second was the GitHub Actions cache, abused as a code path rather than a build optimisation. The third was the OIDC token itself, read out of the runner process memory before it could be redeemed by npm's trusted-publishing endpoint.

And on the way out, npm did what it does for every OIDC-published package. It minted a SLSA Build Level 3 provenance attestation. The attestation correctly described the build: the workflow was `release.yml`, the ref was `refs/heads/main`, the repository was `TanStack/router`. Everything the attestation was designed to assert was true. The consumer who verified got exactly what the attestation promised. The package landed in production with a credential stealer.

We're now catching up with a fast-evolving threat landscape, with tools and organization that in many ways stem from a 2015 point of view. SLSA has been considered a solution that needs no more afterthought, but we're now seeing hard proof that it does what it always claimed to do: show provenance around the pipeline that built the artefact, not the integrity of that pipeline, even if that was always a (faulty) assumption.[^bleepingcomputer][^snyk][^rescana]

This was the first documented case of malicious npm packages carrying valid SLSA Build Level 3 provenance.[^rescana] It will not be the last. If the cryptography is holding and the consumer is still being compromised, the question is what exactly the cryptography was signing. The answer is three other primitives that had drifted out of their design envelopes first.

## What each primitive was supposed to do

### `pull_request_target`

`pull_request_target` was designed as a controlled extension point for safe automation on forks. The workflow runs in the base repository's security context, which means it can read secrets, label issues, post comments, and run privileged actions. The assumption was that maintainers would write workflows narrow enough that fork-supplied code could not reach the secrets. The TanStack `bundle-size.yml` workflow violated that assumption in a way that thousands of repositories do every day: it checked out the fork's code into a context that could read the base repository's `GITHUB_TOKEN`.[^tanstack] The Pwn Request pattern, first documented by Adnan Khan against Angular, MDN, and `hyperledger/besu` in May 2024, is not a new technique.[^tanstack] It caused the April 2025 Grafana Labs CI/CD incident I covered in an earlier post and a GrafanaCON 2026 talk.[^grafanacon-post] What is new is that it landed inside the trust boundary of one of the most widely used JavaScript libraries on npm.

### The GitHub Actions cache

The GitHub Actions cache was designed as a build optimisation. Cache the pnpm store, the `node_modules` folder, the build artefacts. Keep CI fast across runs. The assumption was that the cache was data, not a code path. The attack made it a code path. A malicious `vite_setup.mjs` from the attacker-controlled fork poisoned the pnpm-store cache under a key that the trusted `release.yml` workflow would later look up. When the release workflow ran on the next push to main, it loaded the poisoned cache into `node_modules` and executed the attacker's code as part of the legitimate publish chain.[^tanstack][^hivesecurity] The cache had crossed a trust boundary that nobody had named as a trust boundary.

### The OIDC token

The OIDC token was designed as a short-lived, scoped credential. Minted by GitHub's OIDC provider at the moment of publish, redeemed by npm for trusted publishing, then discarded. The assumption was that the token would live only in environment variables and only long enough to publish. The attack read it directly out of `/proc/<pid>/mem` from the `Runner.Worker` process before npm could redeem it.[^tanstack][^stepsecurity] The token was a short-lived credential in calendar time. It was a long-lived credential in attacker time, because the attacker was already inside the runner.

![Three primitives, two operating envelopes, one indistinguishable output.](./assets/img/posts/20260525/figure_2.png)

Three primitives. Three modes of use the original designs did not anticipate. One indistinguishable SLSA attestation out the other end. The primitives did exactly what they were designed to do, in envelopes the designers did not.

## The same move, four times

The TanStack incident is not isolated. It is the most technically sophisticated instance, so far, of a campaign that has been running since at least September 2025. The campaign is attributed to TeamPCP, also tracked by Google's Threat Intelligence Group as UNC6780, with aliases DeadCatx3, PCPcat, ShellForce, and CipherForce.[^wiz][^stepsecurity-faq] Across four documented attacks in 2026, the tactical entry has varied. The strategic move has not.

In March 2026, TeamPCP compromised the `aquasecurity/trivy-action` GitHub Action, injecting a credential stealer into 76 of 77 version tags. Tracked as CVE-2026-33634, CVSS 9.4. The tactical entry was action compromise.[^stepsecurity-trivy][^unit42]

In April 2026, the Bitwarden CLI npm package was compromised in a maintainer-account-mediated attack attributed to the same threat group. This was the first attack to carry the "Mini Shai-Hulud" label.[^unit42][^theregister-bitwarden]

On May 11, the TanStack pipeline was hijacked through the three-primitive chain described above.

On May 19, GitHub removed 640 malicious packages from the `@antv` data-visualisation ecosystem after another maintainer account was compromised.[^microsoft-antv]

Four different doors. One room. The consistent technique underneath was OIDC token extraction from runner memory, followed by exfiltration to attacker-controlled command-and-control, followed by self-propagation using the harvested tokens.[^stepsecurity][^unit42]

<figure class="figure-table">
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Target</th>
      <th>Tactical entry</th>
      <th>Consistent move</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2026-03</td>
      <td>aquasecurity/trivy-action</td>
      <td>Action compromise (CVE-2026-33634)</td>
      <td>OIDC + runner memory extraction</td>
    </tr>
    <tr>
      <td>2026-04</td>
      <td>Bitwarden CLI (npm)</td>
      <td>Maintainer account compromise</td>
      <td>Same</td>
    </tr>
    <tr>
      <td>2026-05-11</td>
      <td>@tanstack/* (42 packages)</td>
      <td>Pwn Request + cache poisoning + OIDC extraction</td>
      <td>Same</td>
    </tr>
    <tr>
      <td>2026-05-19</td>
      <td>@antv (640 packages)</td>
      <td>Maintainer account compromise</td>
      <td>Same</td>
    </tr>
  </tbody>
</table>
<figcaption>Four attacks, four tactical entries, one consistent move.</figcaption>
</figure>

This matters because it changes the framing of the defensive question. TeamPCP is not exploiting a specific weakness in npm or in GitHub Actions. They are exploiting the platform trust model itself: the property that legitimate outputs and malicious outputs become indistinguishable downstream once the legitimate pipeline has been turned. Patching `pull_request_target`, patching cache scoping, patching `/proc` access, even ratcheting OIDC token lifetimes to single-digit seconds, will each raise the cost of one tactical entry without changing the strategic move. The room is still there.

## The defender's asymmetry, compounded

Getting things wrong is unfortunately easy, and no matter how hard you try as a defender, you have to find and fix all occurrences where a repository has been impacted by a supply-chain compromise. Unfortunately, the attacker only needs the good guys to miss one, as illustrated by Grafana Labs' recent incident.[^grafana-labs-may-2026] The math has not changed in twenty years. What has changed is the speed at which the asymmetry compounds: the May 11 publish-to-peak-distribution window was six minutes; tracking and remediating every downstream consumer takes longer than that by a factor most response programmes are not staffed for.

This is the structural pattern, and TanStack is one instance of it, not the universal case. Look at the cost-to-produce on the artefacts your security organization currently ships.

<figure class="figure-table">
<table>
  <thead>
    <tr>
      <th>Artefact</th>
      <th>Cost to produce, 2018</th>
      <th>Cost to produce, 2026</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>SOC 2 report</td>
      <td>Weeks of analyst time</td>
      <td>Hours of automated generation</td>
    </tr>
    <tr>
      <td>SBOM</td>
      <td>Custom tooling project</td>
      <td>One line in a build pipeline</td>
    </tr>
    <tr>
      <td>Signed commit</td>
      <td>Manual GPG ceremony</td>
      <td>Auto-issued by every coding agent</td>
    </tr>
    <tr>
      <td>Code review comment</td>
      <td>Human reading the diff</td>
      <td>Generated faster than reviewers can read</td>
    </tr>
    <tr>
      <td>SLSA Build Level 3 attestation</td>
      <td>Custom infrastructure</td>
      <td>Auto-minted by npm trusted publishing</td>
    </tr>
    <tr>
      <td>Audit evidence binder</td>
      <td>Quarterly project, four people</td>
      <td>Continuous evidence stream</td>
    </tr>
  </tbody>
</table>
<figcaption>Cost-to-produce, then and now. The teams reading these were sized for the left column.</figcaption>
</figure>

The artefacts your security organization spends most of its time on have all gotten cheap, but not in the same way. Some flood the room they were supposed to be evaluated in: signed commits are produced by agents under human identities at a rate that already exceeds reviewer capacity, code review comments are produced by AI reviewers faster than humans can read them with a measurable inverse correlation between comment volume and finding quality, and SBOMs are exported automatically from build systems that may or may not match the deployed artefact. Some lose their signal because the act of producing one no longer means what it used to: SOC 2 reports are now auto-generated by compliance-automation startups that, in at least one recent case, allegedly produced hundreds of near-identical attestations across hundreds of unrelated customers,[^hn-delve] and the auditors who are supposed to certify those reports are caught in their own version of the same squeeze, expected to attest at the new pace without lowering the bar they were hired to enforce. And some carry valid cryptographic proof that does not say what the consumer thinks it says: SLSA attestations now ship on malicious npm packages with valid Build Level 3 provenance.

None of these failed. The teams that were supposed to make sense of them were never sized for what they would become, because security leaders, myself included, never managed to present a case strong enough to land the headcount.

That is the load-bearing observation, and it is worth pausing on. The operating model around the artefacts assumed that producing them would be the expensive part, and that the people reading them would never need to scale beyond a quarterly cadence. Both assumptions broke. Neither was ever made explicit, costed, or argued strongly enough to dislodge. They held by default because no one whose job it was to challenge them, leaders included, ever made the case the budget conversation had to take seriously.

## What the security organization becomes

The modern security org chart was drawn for a different world, one in which producing the artefact was the expensive part: the GRC analyst whose quarterly job was evidence collection, the SecOps analyst whose work was alert triage, the AppSec reviewer whose throughput was bounded by reading speed, the audit lead whose role was a multi-week project repeated four times a year, the vulnerability manager whose work product was the ticket queue. Each of these roles exists because the artefact existed and was expensive. None of them was misconceived. They were correctly designed for the operating envelope of the time. The world they were designed for has moved on.

Vulnerability management deserves a second's pause here, because the role is doing two distinct jobs under one title and the literature blurs them. The SCA-driven version, where someone reads the output of dependency scanners, dedupes findings, and feeds a ticket queue, is the role being quietly retired by everything else described below: cooldowns reduce the noise, detection engineering replaces the alert-handling, agent-orchestrated review catches issues earlier. The work mostly evaporates. The coordination version is the opposite. Someone has to own the state machine of first-party vulnerability response: receive the report, triage severity, assign ownership, coordinate the fix, manage disclosure timelines, communicate with researchers, and make sure every transition is recoverable in the audit trail. That role does not evaporate. It probably grows, as incident volume climbs and coordination overhead with it. The success metric is not tickets closed per week; it is whether the state machine executed correctly, on time, and with a defensible record at the end.[^vulncoord-post]

Across 2026, the dominant operating-model prediction has been that platform engineering will absorb security. The PlatformCon 2026 CFP explicitly bundles security into the platform stack.[^platformcon] The KubeCon EU 2026 recap pieces converged on the same read: a substantial share of the platform-engineering track described platform teams taking ownership of capabilities previously owned by security.[^kubecon-recap] The prediction is mostly right for organizations large enough to have a real platform team. It is mostly wrong, or at least dangerously underspecified, for organizations whose platform team is two people and a Backstage instance. Both modes are worth naming, because the failure modes are different, and the leadership move is different in each.

Four concrete operating-model moves are worth making in the next ninety days.

### Move 1: evidence work becomes engineering work

Compliance evidence collection, signed-artefact verification, audit-trail generation. These are software jobs now. The GRC analyst function does not disappear; it gets re-tooled into a controls-engineering function that writes code, emits structured evidence as a continuous stream, and integrates with the platform. The OpenSSF Gemara model is the cleanest public framing of what this role looks like in practice.[^openssf-gemara] The role transition is real, and it is not a re-titling. The people in the seat today need different tools, different reporting lines, and in many cases different skills.

### Move 2: detection engineering against the artefacts themselves

If SLSA attestations can be valid and useless in the same artefact, the security question is no longer "is this attestation signed." It is "does this attestation describe a pipeline that did what it was supposed to do." That is a detection-engineering question, and the role that owns it grows out of SecOps, not AppSec. The two stances are different: AppSec is proactive, looking for flaws before code ships; detection engineering is reactive, but reactive in a deliberate, query-driven, detections-as-code way. It requires build-environment runtime telemetry, attestation diffing across builds, behavioural baselines for publish events, and the high-cardinality query infrastructure that SRE teams have been operating for a decade. SecOps analysts who already think in alerts, signals, and correlations are the natural starting point.

### Move 3: pipeline-runtime telemetry as a named role

This is the role that does not yet exist on most security org charts and probably should. It sits between platform engineering and security. It owns the telemetry plane that watches `Runner.Worker` processes, OIDC token redemption, cache key patterns, post-merge artefact diffs. It looks more like an SRE job than an AppSec job, with security responsibilities layered on. The CISO who reads this section should leave with a job description draft.

### Move 4: AppSec as agent-orchestrated review-at-scale

AppSec does not disappear in this picture; it changes its leverage point. The same cost asymmetry that breaks the rest of the operating model is, for AppSec, an opportunity. If producing a code review pass has gotten cheap, the AppSec engineer's job is to orchestrate those passes at fleet scale, not to perform them one PR at a time. Agents do the first pass across every change in the codebase; humans enrich, contextualise, and judge the cases the agents flagged, plus the cases the agents systematically miss. The bottleneck moves from "how many PRs can a human read this week" to "how well are the agents tuned, and what are they consistently blind to." Different job description, different success metric, distinct from Detection Engineering.

If the operating-model overhaul has to be sequenced, and at the budget table it always does, Move 2 is the place to start. Detection engineering against the artefacts themselves has the most direct leverage against the attack class this post just described, because a TanStack-style compromise produces precisely the kind of behavioural anomaly that high-cardinality CI telemetry catches first. The other three moves are necessary. This one earns its first quarter.

![The roles that need to exist. Most do not yet.](./assets/img/posts/20260525/new_structure.jpeg)

### The harder conversation

Before the harder conversation about roles, there is one that security leaders have to have with themselves. The teams below us were not undersized for lack of trying. Most of us, myself included, made the case for headcount in budget cycles, in board memos, in quarterly reviews. We did not, however, make the case well-evidenced and well-timed enough that the people with sign-off could not defensibly refuse it. The undersizing now visible is the bill for that, the argument we did not win. Asking ICs to absorb the displacement that follows, without the leaders above them owning that the displacement is downstream of a case they could not yet sell, is the move that does not survive a sniff test.

The harder conversation, the one most security leaders postpone, is which roles on the current team carry forward and which do not. Some of the work transitions cleanly into the new operating model. Some of it does not. Naming which is which, and being honest with the people doing the work that does not, is the part of this job that does not fit on a slide.

The political point is worth making explicit. This is a ninety-day leadership conversation, not a tooling decision. The vendor pitch deck on the table is not the right artefact to be reading right now. The right artefacts are the org chart, the hiring plan, and an honest list of which work products on the current quarterly review still earn their place when the cost of producing them drops by an order of magnitude.

---

Six minutes, three trust primitives, one valid SLSA attestation per artefact. The signatures verified. The OIDC binding was real. The malicious package shipped anyway.

If the artefacts your security organization produces can be produced just as easily by the people you are trying to keep out, what is your organization for?

The artefacts have not changed. The operating model has to.

---

[^tanstack]: Tanner Linsley, [*"Postmortem: TanStack npm supply-chain compromise,"*](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem) TanStack blog, 2026-05-11.

[^bleepingcomputer]: BleepingComputer, [*"Shai Hulud attack ships signed malicious TanStack, Mistral npm packages."*](https://www.bleepingcomputer.com/news/security/shai-hulud-attack-ships-signed-malicious-tanstack-mistral-npm-packages/)

[^snyk]: Snyk Security Research, [*"TanStack npm Packages Hit by Mini Shai-Hulud."*](https://snyk.io/blog/tanstack-npm-packages-compromised/)

[^rescana]: Rescana, [*"TanStack npm Supply Chain Attack: Detailed Analysis of the May 2026 GitHub Actions Breach and Multi-Ecosystem Impact."*](https://www.rescana.com/post/tanstack-npm-supply-chain-attack-detailed-analysis-of-the-may-2026-github-actions-breach-and-multi-ecosystem-impact)

[^hivesecurity]: Hive Security, [*"The Cache That Bites Back: GitHub Actions Cache Poisoning Attacks."*](https://hivesecurity.gitlab.io/blog/github-actions-cache-poisoning-supply-chain/)

[^stepsecurity]: StepSecurity, [*"TeamPCP's Mini Shai-Hulud Is Back: A Self-Spreading Supply Chain Attack Compromises TanStack npm Packages."*](https://www.stepsecurity.io/blog/mini-shai-hulud-is-back-a-self-spreading-supply-chain-attack-hits-the-npm-ecosystem)

[^stepsecurity-trivy]: StepSecurity, [*"10 Layers Deep: How StepSecurity Stops TeamPCP's Trivy Supply Chain Attack on GitHub Actions."*](https://www.stepsecurity.io/blog/10-layers-deep-how-stepsecurity-stops-teampcps-trivy-supply-chain-attack-on-github-actions)

[^wiz]: Wiz, [*"The Worm That Keeps on Digging: TeamPCP Hits @antv in Latest Wave."*](https://www.wiz.io/blog/mini-shai-hulud-teampcp-hits-antv-supply-chain)

[^stepsecurity-faq]: Security Boulevard, [*"Mini Shai-Hulud: Frequently Asked Questions about the TeamPCP npm and PyPI Supply Chain Campaign."*](https://securityboulevard.com/2026/05/mini-shai-hulud-frequently-asked-questions-about-the-teampcp-npm-and-pypi-supply-chain-campaign/)

[^unit42]: Unit 42 (Palo Alto Networks), [*"Weaponizing the Protectors: TeamPCP's Multi-Stage Supply Chain Attack on Security Infrastructure."*](https://unit42.paloaltonetworks.com/teampcp-supply-chain-attacks/)

[^theregister-bitwarden]: The Register, [*"Another npm supply chain worm hits dev environments,"*](https://www.theregister.com/2026/04/22/another_npm_supply_chain_attack/) 2026-04-22.

[^microsoft-antv]: Microsoft Defender Security Research Team, [*"Mini Shai Hulud: Compromised @antv npm packages enable CI/CD credential theft,"*](https://www.microsoft.com/en-us/security/blog/2026/05/20/mini-shai-hulud-compromised-antv-npm-packages-enable-ci-cd-credential-theft/) Microsoft Security Blog, 2026-05-20.

[^grafana-labs-may-2026]: Grafana Labs, [*"Grafana Labs security update: Latest on TanStack npm supply chain ransomware incident."*](https://grafana.com/blog/grafana-labs-security-update-latest-on-tanstack-npm-supply-chain-ransomware-incident/#summary-and-background)

[^grafanacon-post]: David Andersson and Nick Moore, [*"Lessons from a Security Incident (GrafanaCON 2026)"*]({% post_url 2026-05-15-grafanacon-lessons-from-a-security-incident %}). The April 2025 Grafana Labs CI/CD incident traced to the same `pull_request_target` misuse pattern.

[^hn-delve]: Hacker News, [*"Delve – Fake Compliance as a Service,"* item 47444319](https://news.ycombinator.com/item?id=47444319) (836 points, 296 comments). Source: deepdelver.substack.com.

[^platformcon]: [PlatformCon 2026 program](https://platformcon.com/program). Theme 1 (Platform Stack) bundles security with Kubernetes, IaC, and GitOps.

[^kubecon-recap]: [*"KubeCon Europe 2026 Wrap-Up: AI, Sovereignty & Platforms"*](https://www.efficientlyconnected.com/kubecon-cloudnativecon-europe-2026-wrap-up-sovereignty-security-and-the-shift-from-ai-experimentation-to-production-reality/), Efficiently Connected.

[^openssf-gemara]: OpenSSF, [*"Introducing the Gemara Model for Automated GRC Engineering,"*](https://openssf.org/blog/2026/03/09/introducing-the-gemara-model/) 2026-03-09.

[^vulncoord-post]: David Andersson, [*"Vulnerability management is a coordination problem. Here is what existing SaaS and automation can do about it."*]({% post_url 2026-05-18-vulnerability-coordination-state-machine %}). The state-machine framing of first-party vulnerability response that the second half of this paragraph rests on.
