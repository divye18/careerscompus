# Scene 3 measured text contrast (1440x900)

Real-pixel measurement in Chrome: DOM text made transparent, lightest background pixel under each text box, computed text colour (with alpha) composited over it.

| Room | Text elements | Lowest ratio (relative to requirement) | Result |
|---|---:|---|---|
| technology | 23 | 5.45 (need 4.5) "General orientation only. Programm" 10px | pass |
| medicine | 25 | 5.66 (need 4.5) "Understanding how the body works, " 14px | pass |
| business | 24 | 5.42 (need 4.5) "General orientation only. Programm" 10px | pass |
| design | 23 | 5.07 (need 4.5) "General orientation only. Programm" 10px | pass |
| law | 22 | 5.40 (need 4.5) "General orientation only. Programm" 10px | pass |
| architecture | 23 | 6.15 (need 4.5) "Planning and designing buildings, " 14px | pass |
| science | 22 | 5.65 (need 4.5) "Asking questions about the natural" 14px | pass |

Text/background pairs tested: 162; passing: 162; failing: 0
