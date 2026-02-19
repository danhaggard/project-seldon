# Project Seldon: Product Overview

## Vision
A searchable, verified database of predictions made by public figures to enforce accountability and document the accuracy of the world's most vocal experts.

## Core Objectives
* **Accountability:** Visualize the success/fail rate of "Gurus" (pundits, experts, influencers).
* **Shareability:** Generate "Scorecards" that can be easily shared across social media.
* **Simplicity:** Maintain a clean, intuitive experience that delivers immediate answers without unnecessary clicks.

---

## Target Audience & User Personas

The platform serves three distinct tiers of users, each with unique motivations and feature needs:

### Tier 1: The Public (Read Only)
* **The Validator (Casual User):** Seeks to quickly fact-check a "hot take" they saw online. They need "At a Glance" scorecards with a clear red/green rating immediately visible on search results.
* **The Amplifier (Journalist / Creator):** Needs credible data to support their content and drive traffic back to the platform. They require exportable visuals (like PNG scorecards) and embeddable widgets.

### Tier 2: The Contributors (Write Access)
* **The Hunter (Contributor):** The engine of the platform—both skeptics debunking fraud and super-fans documenting wins. They need a robust "Receipts Engine" to submit source URLs (YouTube, Archive.org) and a way to challenge misinterpreted predictions.
* **The Aspiring Guru (Subject):** Experts seeking to build a verified track record. They need a "Claim Profile" flow and the ability to add official, pinned context to their predictions without altering the underlying data.

### Tier 3: Governance (High Trust)
* **The Arbiter (Moderator):** Trusted community members who adjudicate grey areas and vague language. They need a "Tribunal Dashboard" to vote on contested predictions.
* **The Admin (System Owner):** Focused on system stability and data integrity. They require "God Mode" tools to lock profiles, ban bad actors, and instantly remove defamatory content.

---

## Current Functionality (Built So Far)

Based on our current UI implementations, the foundational MVP is taking shape with several key features active:

* **Global Navigation & Access:** A clean, persistent sidebar granting access to Home, the Gurus directory, the Admin Panel (RBAC protected), and personal Account settings.
* **The Gurus Directory:** A searchable index of tracked experts, displaying their name, bio, and a high-level "Score" at a glance.
* **Guru Scorecards & Profiles:** Detailed profile pages that calculate and display an expert's Accuracy Rate, Total Predictions, Average Horizon, and a weighted "Credibility Score." 
* **Prediction Tracking:** A tabbed interface separating "Pending Predictions" from "Prediction History." Each prediction card displays the target, deadline, and links to original sources.
* **Evidence Management:** A detailed modal for editing predictions that tracks the current status (e.g., Pending, Correct, Vague), Quality Score, Description/Reasoning, and a list of Primary and Secondary source URLs.
* **Content Management (RBAC enabled):** Secure forms allowing authorized users (based on "Own vs. Any" permissions) to edit Guru details (bio, social links) and update their personal user profiles.

---

## Remaining Functionality (Roadmap & Gap Analysis)

To fully realize the vision and satisfy the needs of our defined personas, the following major features still need to be built:

1. **The Shareability Engine (For The Amplifier):** * Implementation of "Export as PNG" for Guru scorecards to facilitate sharing on Twitter/X and newsletters.
   * Embeddable code snippets for external blogs.
2. **The Receipts & Challenge System (For The Hunter):**
   * A streamlined public submission form that rigidly enforces source URL requirements.
   * A "Challenge" button on existing predictions allowing users to flag items as "Out of Context."
3. **The Tribunal Dashboard (For The Arbiter):**
   * A dedicated moderation queue where Arbiters can review and vote on the resolution of predictions marked as "In Evaluation" or "Vague."
4. **Guru Verification (For The Aspiring Guru):**
   * An identity verification flow allowing individuals to claim their auto-generated profile and post "Official Statements."
5. **Admin Moderation Tools (For The Admin):**
   * UI for the Admin Panel to leverage our RBAC system, allowing the suspension of users, locking of heavily contested profiles, and management of global categories.