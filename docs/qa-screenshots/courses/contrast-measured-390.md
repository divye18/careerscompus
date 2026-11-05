# Scene 4 measured text contrast (390x844)

Real-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Disabled controls and aria-hidden decoration are excluded.

| State | View | Text elements | Lowest ratio | Result |
|---|---|---:|---|---|
| empty | #act-courses | 13 | 8.12 (need 4.5) "Start with where you are today, th" 11px | pass |
| empty | #pw-direction | 17 | 8.12 (need 4.5) "Start with where you are today, th" 11px | pass |
| empty | #pw-notes | 10 | 8.30 (need 4.5) "Possible pathways for orientation " 10px | pass |
| route-technology | #act-courses | 17 | 8.19 (need 4.5) "04" 11px | pass |
| route-technology | #pw-direction | 23 | 8.48 (need 4.5) "Choose a direction" 11px | pass |
| route-technology | #pw-notes | 14 | 8.30 (need 4.5) "Possible pathways for orientation " 10px | pass |
| class10-medicine-fallback | #act-courses | 16 | 8.19 (need 4.5) "04" 11px | pass |
| class10-medicine-fallback | #pw-direction | 21 | 8.12 (need 4.5) "Commonly after Class 12" 10px | pass |
| class10-medicine-fallback | #pw-notes | 10 | 8.30 (need 4.5) "Possible pathways for orientation " 10px | pass |

Text/background pairs tested: 141; passing: 141; failing: 0
