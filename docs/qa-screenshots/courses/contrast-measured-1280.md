# Scene 4 measured text contrast (1280x800)

Real-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Disabled controls and aria-hidden decoration are excluded.

| State | View | Text elements | Lowest ratio | Result |
|---|---|---:|---|---|
| empty | #act-courses | 13 | 8.27 (need 4.5) "04" 12px | pass |
| empty | #pw-direction | 29 | 8.12 (need 4.5) "Start with where you are today, th" 11px | pass |
| empty | #pw-notes | 11 | 8.36 (need 4.5) "Possible pathways for orientation " 10px | pass |
| route-technology | #act-courses | 13 | 8.22 (need 4.5) "04" 12px | pass |
| route-technology | #pw-direction | 45 | 8.12 (need 4.5) "Commonly after Class 12 / Diploma" 10px | pass |
| route-technology | #pw-notes | 15 | 8.34 (need 4.5) "Possible pathways for orientation " 10px | pass |
| class10-medicine-fallback | #act-courses | 13 | 8.22 (need 4.5) "04" 12px | pass |
| class10-medicine-fallback | #pw-direction | 40 | 5.67 (need 4.5) "No common route from" 10px | pass |
| class10-medicine-fallback | #pw-notes | 11 | 8.35 (need 4.5) "Possible pathways for orientation " 10px | pass |

Text/background pairs tested: 190; passing: 190; failing: 0
