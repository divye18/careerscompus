# Scene 5 measured text contrast (390x844)

Real-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Disabled controls and aria-hidden decoration are excluded.

| State | View | Text elements | Lowest ratio | Result |
|---|---|---:|---|---|
| empty | #act-universities | 19 | 7.47 (need 4.5) "5" 11px | pass |
| empty | #atlas-type | 19 | 7.47 (need 4.5) "5" 11px | pass |
| empty | #atlas-region-m | 30 | 7.47 (need 4.5) "5" 11px | pass |
| empty | #atlas-filters | 30 | 7.47 (need 4.5) "5" 11px | pass |
| empty | __bottom__ | 21 | 7.97 (need 4.5) "Vellore" 10px | pass |
| region-south | #act-universities | 19 | 7.70 (need 4.5) "5" 11px | pass |
| region-south | #atlas-type | 19 | 7.70 (need 4.5) "5" 11px | pass |
| region-south | #atlas-region-m | 26 | 7.70 (need 4.5) "5" 11px | pass |
| region-south | #atlas-filters | 26 | 7.70 (need 4.5) "5" 11px | pass |
| region-south | __bottom__ | 27 | 7.70 (need 4.5) "5" 11px | pass |
| institution-iit-kanpur | #act-universities | 19 | 7.51 (need 4.5) "5" 11px | pass |
| institution-iit-kanpur | #atlas-type | 19 | 7.51 (need 4.5) "5" 11px | pass |
| institution-iit-kanpur | #atlas-region-m | 26 | 7.51 (need 4.5) "5" 11px | pass |
| institution-iit-kanpur | #atlas-filters | 26 | 7.51 (need 4.5) "5" 11px | pass |
| institution-iit-kanpur | __bottom__ | 22 | 5.99 (need 4.5) "www.iitk.ac.in/" 13px | pass |
| filters-ini-medicine | #act-universities | 8 | 7.65 (need 4.5) "1" 11px | pass |
| filters-ini-medicine | #atlas-type | 13 | 7.65 (need 4.5) "1" 11px | pass |
| filters-ini-medicine | #atlas-region-m | 21 | 7.99 (need 4.5) "New Delhi" 10px | pass |
| filters-ini-medicine | #atlas-filters | 13 | 7.65 (need 4.5) "1" 11px | pass |
| filters-ini-medicine | __bottom__ | 21 | 7.99 (need 4.5) "New Delhi" 10px | pass |

Text/background pairs tested: 424; passing: 424; failing: 0
