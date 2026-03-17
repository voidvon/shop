---
name: url-requirements-mindmap-vue3
description: Generate a requirements mindmap document from a website URL for Vue3 frontend projects. Use when a user provides a site link and wants a structured PRD-style breakdown of pages, flows, features, data, and Vue3 implementation scope in mindmap format.
---

# URL Requirements Mindmap (Vue3)

## Overview

Generate a concise requirements mindmap plus a short assumptions/questions section from a website URL, oriented to building a Vue3 frontend. Focus on information architecture, user flows, features, data needs, and implementation scope.

## Inputs to Collect or Infer

- Website URL(s)
- Goal: clone, redesign, or partial reference
- Target users and roles
- Locale and content language
- Platforms: desktop, mobile, or both
- Constraints: SEO, accessibility, performance, integrations
- Known exclusions or out-of-scope areas

If details are missing, infer from the site and state assumptions explicitly.

## Workflow

### 1. Acquire Site Context

- Use `web.run` when allowed to open the URL, primary navigation, footer links, and key flows.
- Capture entry points, nav structure, and any gated areas.
- If browsing is unavailable, ask the user for a sitemap, screenshots, or a page list.

### 2. Extract Information Architecture

- List primary and secondary navigation items.
- Enumerate pages/screens with a one-line purpose each.

### 3. Derive User Flows and Features

- For each key journey, note steps, forms, validations, error/empty states, and success criteria.
- Identify reusable content modules and UI components.

### 4. Define Data and Integrations

- Identify core entities, fields, and relationships implied by the UI.
- Note third-party integrations (auth, payments, maps, analytics) when visible.

### 5. Map to Vue3 Implementation Scope

- Translate pages to routes and layouts.
- Map features to modules/components.
- Call out state management and API layer concerns.
- Apply the Vue3 checklist in `references/vue3-requirements-checklist.md`.

### 6. Produce Deliverables

- Output a single Markdown document that includes:
- A Mermaid mindmap block (see `references/mindmap-format.md`)
- Assumptions
- Open questions
- Scope exclusions

Keep node titles concise and use names that map cleanly to routes and components.

## Output Rules

- Prefer Mermaid `mindmap` syntax.
- Keep depth to 3–4 levels.
- Mark unknowns as `TBD`.
- Avoid long sentences in node labels.

## References

- Mindmap format and template: `references/mindmap-format.md`
- Vue3 requirements checklist: `references/vue3-requirements-checklist.md`
