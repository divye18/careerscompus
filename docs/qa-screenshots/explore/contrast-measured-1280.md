# Scene 3 measured text contrast (1280x800)

Real-pixel measurement in Chrome: DOM text made transparent, lightest background pixel under each text box, computed text colour (with alpha) composited over it.

| Room | Text elements | Lowest ratio (relative to requirement) | Result |
|---|---:|---|---|
| technology | 23 | 5.10 (need 4.5) "General orientation only. Programm" 10px | pass |
| medicine | 25 | 5.38 (need 4.5) "Understanding how the body works, " 14px | pass |
| business | 24 | 5.16 (need 4.5) "General orientation only. Programm" 10px | pass |
| design | 23 | 4.91 (need 4.5) "General orientation only. Programm" 10px | pass |
| law | 22 | 5.35 (need 4.5) "General orientation only. Programm" 10px | pass |
| architecture | 23 | 5.89 (need 4.5) "Planning and designing buildings, " 14px | pass |
| science | 22 | 5.82 (need 4.5) "Asking questions about the natural" 14px | pass |

Text/background pairs tested: 162; passing: 162; failing: 0
