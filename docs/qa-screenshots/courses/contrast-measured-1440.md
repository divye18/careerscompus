# Scene 4 measured text contrast (1440x900)

Real-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Disabled controls and aria-hidden decoration are excluded.

| State | View | Text elements | Lowest ratio | Result |
|---|---|---:|---|---|
| empty | #act-courses | 14 | 8.12 (need 4.5) "Start with where you are today, th" 11px | pass |
| empty | #pw-direction | 32 | 8.12 (need 4.5) "Start with where you are today, th" 11px | pass |
| empty | #pw-notes | 11 | 8.35 (need 4.5) "Possible pathways for orientation " 10px | pass |
| route-technology | #act-courses | 20 | 8.22 (need 4.5) "04" 12px | pass |
| route-technology | #pw-direction | 48 | 8.12 (need 4.5) "Commonly after Class 12 / Diploma" 10px | pass |
| route-technology | #pw-notes | 15 | 8.34 (need 4.5) "Possible pathways for orientation " 10px | pass |
| class10-medicine-fallback | #act-courses | 17 | 8.22 (need 4.5) "04" 12px | pass |
| class10-medicine-fallback | #pw-direction | 42 | 6.09 (need 4.5) "No common route from" 10px | pass |
| class10-medicine-fallback | #pw-notes | 11 | 8.34 (need 4.5) "Possible pathways for orientation " 10px | pass |

Text/background pairs tested: 210; passing: 210; failing: 0
