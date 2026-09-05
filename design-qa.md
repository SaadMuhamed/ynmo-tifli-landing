# Design QA

- Source visual truth: https://www.figma.com/design/Zd2kdJppJubokdUvLi6egT/Ynmo-Website-New-Design?node-id=1110-23648
- Implementation capture: http://127.0.0.1:4200/#specialists (Google Chrome CUA capture, 2026-09-06)
- Viewport: 1224 × 768 desktop browser viewport
- States checked: light theme; initial RTL position; one-card advance; scroll endpoint

## Full-view comparison evidence

The rendered rail follows the final frame: cards are flush, the right edge remains aligned with the section gutter, and the left side extends responsively to the viewport edge. The initial and scrolled captures confirm that the clipped cards fade as they enter and leave the horizontal viewport. Navigation advances by one measured card and updates its disabled state and active dot.

## Focused region comparison evidence

The cards match the measured 381.33 × 312 frame, 16px radius, 40px inset, 32px vertical rhythm, layered translucent surface, 2px white inner stroke, and neutral elevation. Each divider uses the Figma 56px boolean-subtraction diameter, with separate line segments and 16px clearance around the 21px info icon. Portraits sit on the right of RTL-aligned copy. Credential icons also sit on the right, use the source cyan color, and retain their 24px size.

## Fidelity surfaces

- Fonts and typography: passed. Arabic hierarchy, RTL alignment, line heights, and wrapping match the target.
- Spacing and layout rhythm: passed. Card dimensions, zero rail gap, 40px inset, 32px rhythm, divider clearance, and responsive rail bleed match the measured frame.
- Colors and visual tokens: passed. Surface layers, white stroke, neutral shadow, muted copy, grey info icon, and cyan metadata icons match the design.
- Image quality and asset fidelity: passed. Existing portrait and specialist SVG assets remain sharp and are placed at their source sizes.
- Copy and content: passed. Names, specialties, credentials, and experience labels remain unchanged.

## Findings and patches

- Corrected portrait and metadata ordering for RTL reading.
- Rebuilt the divider with two line segments and 56px masked edge circles.
- Set the exact desktop card geometry and removed spacing between cards.
- Added position-aware edge fades for initial, middle, and endpoint states.
- Extended the rail through the left page gutter while preserving the right alignment and responsive card sizing.

No actionable P0, P1, P2, or P3 mismatch remains in the requested card and rail pass.

final result: passed
