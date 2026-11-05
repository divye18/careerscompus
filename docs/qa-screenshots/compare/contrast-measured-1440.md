# Scene 6 measured text contrast (1440x900)

Real-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Every state is scrolled through the whole workspace, so a text element can be measured at more than one position. Disabled controls and aria-hidden glyphs are excluded.

| State | Text measurements | Lowest ratio | Result |
|---|---:|---|---|
| empty | 37 | 7.72 (need 4.5) "The institution" 20px | pass |
| picker | 63 | 7.72 (need 4.5) "North India" 10px | pass |
| three-institutions+evidence | 264 | 7.72 (need 4.5) "New Delhi, Delhi" 10px | pass |
| differences | 126 | 7.72 (need 4.5) "New Delhi, Delhi" 10px | pass |
| parameter-chooser | 281 | 7.53 (need 4.5) "Last checked" 10px | pass |
| courses | 130 | 7.72 (need 4.5) "Technology" 10px | pass |
| programmes | 185 | 7.72 (need 4.5) "at IIT Madras" 10px | pass |
| no-differences | 42 | 7.72 (need 4.5) "Technology" 10px | pass |

Text/background pairs tested: 1128; passing: 1128; failing: 0

Graphical signals on the ledger surface (need 3.0): cyan difference rule and focus ring 11.21; champagne top rule 7.72.
