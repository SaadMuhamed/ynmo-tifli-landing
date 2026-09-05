# Design QA

- Source visual truth: https://www.figma.com/design/Zd2kdJppJubokdUvLi6egT/Ynmo-Website-New-Design?node-id=1201-7155
- Implementation capture: http://127.0.0.1:4200/#specialists (Google Chrome CUA capture, 2026-09-06)
- Viewport: 1224 × 768 desktop browser viewport
- State: light theme, specialists rail at its initial RTL position

## Full-view comparison evidence

The Figma card and rendered card use the same compact 381 × 312 proportion, 16px corner radius, ticket-edge cutouts, translucent off-white surface, white inner stroke, and neutral tinted elevation. The wider card keeps the credentials on one line where the content length permits, removing the tall narrow-card appearance from the previous implementation. The rail still shows the clipped edge card and centered pagination pattern from the design.

## Focused region comparison evidence

The card header retains the Figma-aligned 64px portrait, 24px bold Arabic name, 16px specialty, and 16px spacing between portrait and copy. The divider remains centered between 32px edge cutouts with the supplied information icon. Credential and experience rows retain the existing 24px source icons, 16px Arabic copy, and RTL alignment. No replacement or generated assets were introduced.

## Fidelity surfaces

- Fonts and typography: passed. IBM Plex Sans Arabic, weights, sizes, line height, hierarchy, and wrapping match the existing Figma-derived type system.
- Spacing and layout rhythm: passed. Card width, minimum height, 40px inset, 32px internal rhythm, 16px radius, edge cutouts, and rail spacing match the target proportions.
- Colors and visual tokens: passed. The card uses the layered page/white surface, white inner border, existing text palette, and neutral design-system shadow tint.
- Image quality and asset fidelity: passed. Existing source portraits and supplied specialist icons remain sharp and correctly masked.
- Copy and content: passed. All Arabic names, specialties, credentials, and experience labels are unchanged.

## Findings

No actionable P0, P1, or P2 mismatches remain in the requested card styling.

## Patches made

- Increased the desktop card basis from 320px to the Figma width of 381px.
- Added the 312px target minimum height with a viewport-safe mobile width.
- Replaced the flat white fill with the layered off-white surface.
- Added the 2px white inner border and neutral 16px/32px elevation.
- Matched the divider icon backing surface to the card.

## Follow-up polish

No P3 follow-up is required for the requested card style pass.

final result: passed
