---
layout: post
read_time: true
show_date: true
title: "Three Trust Primitives, One Attack: What May 11 asks your security organization to become"
date: 2026-05-25 09:00:00 +0100
description: On May 11 between 19:20 and 19:26 UTC, 84 malicious @tanstack/* npm versions shipped with valid SLSA Build Level 3 provenance. The signatures verified. The canon held. The consumer was compromised anyway. The plays the security industry defined between 2015 and 2022 are no longer safe by virtue of being canon.
img: posts/20260525/cover_photo.jpeg
img_in_post: false
tags: [appsec, supply-chain, slsa, tanstack, operating-model, platform-engineering]
author: David Andersson
---

On May 11, 2026, between 19:20 and 19:26 UTC, an attacker published 84 malicious versions across 42 `@tanstack/*` npm packages. The published artefacts carried valid SLSA Build Level 3 provenance attestations, because npm generates them automatically when packages are published via OIDC trusted publishing, and the build did, in the strict sense, happen in TanStack's `release.yml` on `refs/heads/main`. The signatures verified. The OIDC binding was real. The malicious package shipped to consumers anyway.

This is a piece about what happened, the campaign it sits inside, and what the incident proves about the security canon. The plays the industry settled on between roughly 2015 and 2022, SAST at the gate, SCA in CI, attestation as proof of build provenance, ticket queues as the work surface, GRC binders as the artefact of compliance, still produce outputs that pass their technical validation. They no longer mean what they meant when the canon was written. May 11 is the cleanest public proof of that we have so far. It will not be the last.

![Six minutes from first malicious publish to last. Three trust primitives chained. One valid SLSA attestation per artefact.](./assets/img/posts/20260525/timeline.jpeg)

## Six minutes, three trust primitives

The TanStack first-party postmortem[^tanstack] tells the story tight. Between 19:20:39 and 19:26:14 UTC on May 11, an attacker published 84 malicious versions across 42 `@tanstack/*` packages on npm. Five minutes and thirty-five seconds. The attacker did not steal an npm publishing token from a maintainer's laptop. They did not phish a CI secret. They did not brute-force an account. They hijacked TanStack's own legitimate release pipeline, used its trusted OIDC identity to publish, and let npm's standard provenance machinery sign the result on the way out.

The chain involved three separate trust primitives, each functioning exactly as designed, each operating outside what that design assumed.

The first was `pull_request_target`. The second was the GitHub Actions cache, abused as a code path rather than a build optimisation. The third was the OIDC token itself, read out of the runner process memory before it could be redeemed by npm's trusted-publishing endpoint.

And on the way out, npm did what it does for every OIDC-published package. It minted a SLSA Build Level 3 provenance attestation. The attestation correctly described the build: the workflow was `release.yml`, the ref was `refs/heads/main`, the repository was `TanStack/router`. Everything the attestation was designed to assert was true. The consumer who verified got exactly what the attestation promised. The package landed in production with a credential stealer.

We're now catching up with a fast-evolving threat landscape, with tools and organization that in many ways stem from a 2015 point of view. SLSA has been considered a solution that needs no more afterthought, but we're now seeing hard proof that it does what it always claimed to do: show provenance around the pipeline that built the artefact, not the integrity of that pipeline, even if that was always a (faulty) assumption.[^bleepingcomputer][^snyk][^rescana]

This was the first documented case of malicious npm packages carrying valid SLSA Build Level 3 provenance.[^rescana] If the cryptography is holding and the consumer is still being compromised, the question is what the cryptography is actually signing. The answer is three other primitives that had drifted out of their design envelopes first.

## What each primitive was supposed to do

### `pull_request_target`

`pull_request_target` was designed as a controlled extension point for safe automation on forks. The workflow runs in the base repository's security context, which means it can read secrets, label issues, post comments, and run privileged actions. The assumption was that maintainers would write workflows narrow enough that fork-supplied code could not reach the secrets. The TanStack `bundle-size.yml` workflow violated that assumption in a way that thousands of repositories do every day: it checked out the fork's code into a context that could read the base repository's `GITHUB_TOKEN`.[^tanstack] The Pwn Request pattern, first documented by Adnan Khan against Angular, MDN, and `hyperledger/besu` in May 2024, is not a new technique.[^tanstack] It caused the April 2025 Grafana Labs CI/CD incident I covered in an earlier post and a GrafanaCON 2026 talk.[^grafanacon-post] What is new is that it landed inside the trust boundary of one of the most widely used JavaScript libraries on npm.

### The GitHub Actions cache

The GitHub Actions cache was designed as a build optimisation. Cache the pnpm store, the `node_modules` folder, the build artefacts. Keep CI fast across runs. The assumption was that the cache was data, not a code path. The attack made it a code path. A malicious `vite_setup.mjs` from the attacker-controlled fork poisoned the pnpm-store cache under a key that the trusted `release.yml` workflow would later look up. When the release workflow ran on the next push to main, it loaded the poisoned cache into `node_modules` and executed the attacker's code as part of the legitimate publish chain.[^tanstack][^hivesecurity] The cache had crossed a trust boundary that nobody had named as a trust boundary.

### The OIDC token

The OIDC token was designed as a short-lived, scoped credential. Minted by GitHub's OIDC provider at the moment of publish, redeemed by npm for trusted publishing, then discarded. The assumption was that the token would live only in environment variables and only long enough to publish. The attack read it directly out of `/proc/<pid>/mem` from the `Runner.Worker` process before npm could redeem it.[^tanstack][^stepsecurity] The token was a short-lived credential in calendar time. It was a long-lived credential in attacker time, because the attacker was already inside the runner.

![Three primitives, two operating envelopes, one indistinguishable output.](./assets/img/posts/20260525/figure_2.png)

Three primitives. Three modes of use the original designs did not anticipate. One indistinguishable SLSA attestation out the other end. The primitives did exactly what they were designed to do, in envelopes the designers did not. The canon, which trusts the attestation those primitives produce, is being asked a question it does not know how to answer.

## The class: canon artefacts that pass validation and no longer mean what they meant

Getting things wrong is unfortunately easy, and no matter how hard you try as a defender, you have to find and fix all occurrences where a repository has been impacted by a supply-chain compromise. Unfortunately, the attacker only needs the good guys to miss one, as illustrated by Grafana Labs' recent incident.[^grafana-labs-may-2026] The math has not changed in twenty years. What has changed is the speed at which the asymmetry compounds: the May 11 publish-to-peak-distribution window was six minutes; tracking and remediating every downstream consumer takes longer than that by a factor most response programmes are not staffed for.

The TanStack incident is one instance of a broader class. The class is canon artefacts that pass their technical validation and no longer carry the meaning the canon attached to them.

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
  </tbody>
</table>
<figcaption>Canon artefacts. The 2018 production cost was the part the canon trusted as the trust signal. The 2026 production cost is what the canon now has to answer for.</figcaption>
</figure>

The artefacts your security program is built on have all gotten cheap, but not in the same way. Some flood the room they were supposed to be evaluated in: signed commits are produced by agents under human identities at a rate that already exceeds reviewer capacity, code review comments are produced by AI reviewers faster than humans can read them, and SBOMs are exported automatically from build systems that may or may not match the deployed artefact. Some lose their signal because the act of producing one no longer means what it used to: SOC 2 reports are now auto-generated by compliance-automation startups that, in at least one recent case, allegedly produced hundreds of near-identical attestations across hundreds of unrelated customers,[^hn-delve] and the auditors who certify those reports are caught in their own version of the same squeeze. And some carry valid cryptographic proof that does not say what the consumer thinks it says: SLSA attestations now ship on malicious npm packages with valid Build Level 3 provenance.

Before going further, the strongest defensible rebuttal to the canon argument is worth naming. The rebuttal is: this is an automation problem, not a canon problem. You already bought the SAST, the SCA, the SBOM tool, the policy engine, the runtime scanner. If you actually deployed them, tuned them, and made the alerts actionable, you would catch this. That rebuttal is true for organizations whose binding constraint is operational maturity. If your problem is that the tools you bought are not being used well, deploy them. That is not the situation this piece is about. This piece is about organizations where the tooling is deployed, the program is mature, and the artefacts are still failing. That is where the canon argument lives. The rebuttal speaks to operational gaps in the existing playbook. It cannot speak to capabilities the playbook never contained, and independent verification of canon artefacts is in that second category. No amount of better-deployed SAST gets you there.

## A threat actor the canon was not designed against

The TanStack incident is the most technically sophisticated instance, so far, of a campaign that has been running since at least September 2025. The campaign is attributed to TeamPCP, tracked by Google's Threat Intelligence Group as UNC6780, with aliases DeadCatx3, PCPcat, ShellForce, and CipherForce.[^wiz][^stepsecurity-faq]

Across four documented attacks in 2026, the tactical entry has varied. The strategic move has not.

In March 2026, TeamPCP compromised the `aquasecurity/trivy-action` GitHub Action, injecting a credential stealer into 76 of 77 version tags. Tracked as CVE-2026-33634, CVSS 9.4.[^stepsecurity-trivy][^unit42]

In April 2026, the Bitwarden CLI npm package was compromised in a maintainer-account-mediated attack attributed to the same threat group.[^unit42][^theregister-bitwarden]

On May 11, the TanStack pipeline was hijacked through the three-primitive chain described above.

On May 19, GitHub removed 640 malicious packages from the `@antv` data-visualisation ecosystem after another maintainer account was compromised.[^microsoft-antv]

Four different doors. One room. The consistent technique underneath was OIDC token extraction from runner memory, followed by exfiltration, followed by self-propagation using the harvested tokens.[^stepsecurity][^unit42]

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

What changed is not the technique. Pwn Request was documented in May 2024. Cache poisoning is an old class. OIDC token extraction from `/proc` requires inside-the-runner code execution, which has never been hard once the first foothold lands. What changed is that a threat actor has emerged whose operating model is to industrialise the abuse of legitimate pipelines, to exploit the property the canon left unguarded: legitimate outputs and malicious outputs become indistinguishable downstream once the legitimate pipeline has been turned.

The canon was designed against a different threat actor. The 2020 playbook assumed that the cost of turning a legitimate pipeline was high enough that signing the output of one was a useful trust signal. TeamPCP has demonstrated that the cost is now low enough that the signal collapses. The canon plays still work against the threats the canon was designed for. They do not work against this one.

Patching `pull_request_target`, patching cache scoping, patching `/proc` access, even ratcheting OIDC token lifetimes to single-digit seconds, will each raise the cost of one tactical entry without changing the strategic move. The room is still there. The canon does not have a play for the room.

## The 2020 plays and what replaces them

Four operating-model moves are worth making in the next ninety days. Each is a pairing: the canon play that defined the work in 2020, the play that replaces it now, and the capability the team has to own. The role question is downstream of the capability and is organisation-specific. Some teams will hire. Some will redeploy. Some will hand the capability to a platform team. The capability does not change with the answer.

### Move 1: from evidence collection to evidence as code

**2020 play.** Compliance evidence is a quarterly artefact. A GRC analyst gathers screenshots, exports, ticket histories, and binds them into a PDF for an auditor. The artefact's value comes from the analyst's effort and the auditor's professional reading.

**2026 play.** Compliance evidence is a continuous stream. Controls are encoded as software that emits structured evidence by default, every time the underlying state changes. The auditor consumes the stream, not a binder.

**Capability the team must own.** Encoding controls as software. Treating evidence as a build output of the platform, not a deliverable of the GRC function. The OpenSSF Gemara model is the cleanest public framing of what this looks like in practice.[^openssf-gemara] The transition is not a rename of the GRC analyst. It is a different work product that the GRC function is now responsible for shipping.

### Move 2: from canonical trust signal to independent verification

**2020 play.** The supply-chain trust question ends at signature verification. If the SLSA attestation verifies, if the SBOM matches, if the signed commit is valid, the artefact is trusted. The canon treats the cryptographic check as the end of the question.

**2026 play.** Treat the canon artefact as one input to a trust decision, not the trust decision itself. Add a second layer of consumer-side verification: independent rebuild from source and binary comparison where the ecosystem allows it, sandbox execution with behavioural baselining where it does not, cross-reference against external attestations from independent trust roots where they exist. The signature still has to pass. It just stops being sufficient on its own.

**Capability the team must own.** Independent verification as a discipline. The capability sits between platform engineering (who runs the rebuilds and sandboxes at scale) and supply-chain security (who specifies what counts as sufficient evidence beyond the signature). The TanStack consumer who checked the SLSA attestation and shipped the package did everything the canon asked. The capability whose absence let them ship malware is the one that would have asked, separately, what the artefact actually does.

### Move 3: from artefact-centric verification to runtime-centric observation

**2020 play.** Verification is reading the artefact: SBOM, signed commit, SLSA attestation. The artefact is the surface; the pipeline is opaque. If the artefact verifies, the pipeline is trusted.

**2026 play.** Verification extends into the runtime of the pipeline that produced the artefact. `Runner.Worker` process events. OIDC token redemption patterns. Cache key access patterns. Post-merge artefact diffs. These are the signals that distinguish a legitimate publish from a hijacked one, and none of them live in the artefact.

**Capability the team must own.** Reading the pipeline as a stream of events, not as a producer of artefacts. The capability tracks each of the three primitives that failed on May 11. `Runner.Worker` process events catch the OIDC token extraction from `/proc` memory. Cache key access patterns catch poisoning of cache keys that cross trust boundaries. Post-merge artefact diffs catch the moment a `pull_request_target` workflow produces something the previous run did not. This is the capability whose absence let May 11 happen. It sits between platform engineering and security; the venue is organisation-specific, the capability is not.

### Move 4: from human-paced review to agent-orchestrated review-at-scale

**2020 play.** Code review is a human gate. An engineer reads the diff, asks questions, approves or requests changes. AppSec sits inside the human-review pool for sensitive areas.

**2026 play.** Code review at fleet scale is an agent activity orchestrated by humans. Agents do the breadth pass on every change. Humans enrich, contextualise, and judge the cases the agents flagged, plus the cases the agents systematically miss. The bottleneck moves from "how many PRs can a human read this week" to "how well are the agents tuned, and what are they consistently blind to."

**Capability the team must own.** Agent orchestration. Tuning, calibrating, and reviewing what agents systematically miss. The cost asymmetry that breaks the rest of the canon is, for code review at scale, an opportunity. The same cheapness that floods the room can be turned into breadth coverage no human reviewer was designed to provide, if the agent orchestration is owned and not delegated to a vendor's default settings.

---

If the operating-model overhaul has to be sequenced, and at the budget table it always does, the first move is the one with the bigger gap, and the answer differs by where your organisation sits in the supply chain.

If your organisation primarily consumes upstream software, fund Move 2. The TanStack consumers who shipped malware did so because they had no independent verification layer. That is the capability whose absence May 11 exposed most directly for downstream organisations.

If your organisation primarily produces software others consume, fund Move 3. The capability whose absence let TanStack itself get hijacked is build-environment runtime telemetry. The pipeline observability that would have caught the OIDC extraction does not yet exist as a security signal in most engineering organisations.

Most organisations are both. The right first move is the one where you have the bigger gap.

![The capabilities that need to exist. Most do not yet.](./assets/img/posts/20260525/new_structure.jpeg)

Across 2026, the dominant operating-model prediction has been that platform engineering will absorb security. The PlatformCon 2026 CFP explicitly bundles security into the platform stack.[^platformcon] The KubeCon EU 2026 recap pieces converged on the same read.[^kubecon-recap] The prediction is mostly right for organizations large enough to have a real platform team. It is mostly wrong, or at least dangerously underspecified, for organizations whose platform team is two people and a Backstage instance. The capability move is the same in each. The venue for the work is what differs.

## The harder conversation

Some 2020 plays carry forward into 2026. Threat modelling. Secure design review. Tabletop incident response. Identity governance. First-party vulnerability response as coordination work, distinct from vulnerability triage as ticket-queue management.[^vulncoord-post] These plays still address threats the canon was right about.

The harder conversation is about the plays that do not carry forward. Hand evidence collection. PR-time scanning queues as the primary security work surface. SLSA verification as the end of the supply-chain trust question. The canon play and the 2026 play are different enough that asking the people who ran the 2020 version to run the 2026 version is not a transition; it is a different job description.

Before that team-level conversation, there is one I have to have with myself first. Most of us, myself included, kept running 2020 plays for too long. The budget arguments I made over the years were downstream of that. I was asking for more reviewers, more analysts, more scanning, more ticket throughput, more of what the 2020 playbook called for, against a 2026 threat model. I was not arguing for a different thing. That is the confession. The displacement now coming for the work product of those teams is downstream of that, not of any failure on the team's part.

The political point is worth making explicit. This is a ninety-day leadership conversation, not a tooling decision. The vendor pitch deck on the table is not the right artefact to be reading. The right artefacts are the org chart, the capability map, and an honest list of which plays in your security program were canon when you adopted them and are no longer.

---

Six minutes, three trust primitives, one valid SLSA attestation per artefact. The signatures verified. The OIDC binding was real. The malicious package shipped anyway. The canon held. None of it helped.

If the artefacts your security program is built around can be produced just as easily by the people you are trying to keep out, what is your program for?

Canon is not safe by virtue of being canon. The artefacts have not changed. What we do with them has to.

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

[^vulncoord-post]: David Andersson, [*"Vulnerability management is a coordination problem. Here is what existing SaaS and automation can do about it."*]({% post_url 2026-05-18-vulnerability-coordination-state-machine %}). The state-machine framing of first-party vulnerability response, distinct from queue-based vulnerability triage, that the carry-forward claim here rests on.
