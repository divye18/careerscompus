# Scene 7 measured text contrast (1440x900)

Real-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Every state is scrolled through the whole workspace, so a text element can be measured at more than one position. Disabled controls and aria-hidden glyphs are excluded.

| State | Text measurements | Lowest ratio | Result |
|---|---:|---|---|
| empty | 34 | 7.69 (need 4.5) "07" 12px | pass |
| partial | 118 | 7.69 (need 4.5) "07" 12px | pass |
| full | 213 | 7.69 (need 4.5) "07" 12px | pass |
| ticked | 217 | 7.69 (need 4.5) "07" 12px | pass |

Text/background pairs tested: 582; passing: 582; failing: 0

Graphical signals on Deep Aubergine (need 3.0): cyan focus ring and tick 11.19; champagne meridian 7.72.
