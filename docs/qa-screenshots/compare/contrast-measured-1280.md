# Scene 6 measured text contrast (1280x800)

Real-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Every state is scrolled through the whole workspace, so a text element can be measured at more than one position. Disabled controls and aria-hidden glyphs are excluded.

| State | Text measurements | Lowest ratio | Result |
|---|---:|---|---|
| empty | 36 | 7.72 (need 4.5) "The institution" 20px | pass |
| picker | 65 | 7.72 (need 4.5) "North India" 10px | pass |
| three-institutions+evidence | 253 | 5.39 (need 4.5) "home.iitd.ac.in/about.php" 13px | pass |
| differences | 118 | 5.39 (need 4.5) "home.iitd.ac.in/about.php" 13px | pass |
| parameter-chooser | 265 | 5.39 (need 4.5) "home.iitd.ac.in/about.php" 13px | pass |
| courses | 129 | 5.39 (need 4.5) "bits-pilani.ac.in/academics/integr" 13px | pass |
| programmes | 179 | 5.39 (need 4.5) "iitm.ac.in/academics/study-at-iitm" 13px | pass |
| no-differences | 41 | 7.72 (need 4.5) "Technology" 10px | pass |

Text/background pairs tested: 1086; passing: 1086; failing: 0

Graphical signals on the ledger surface (need 3.0): cyan difference rule and focus ring 11.21; champagne top rule 7.72.
