# Scene 5 measured text contrast (1440x900)

Real-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Disabled controls and aria-hidden decoration are excluded.

| State | View | Text elements | Lowest ratio | Result |
|---|---|---:|---|---|
| empty | #act-universities | 11 | 7.81 (need 4.5) "1" 11px | pass |
| empty | #atlas-type | 23 | 7.81 (need 4.5) "1" 11px | pass |
| empty | #atlas-region-m | 23 | 7.81 (need 4.5) "1" 11px | pass |
| empty | #atlas-filters | 23 | 7.81 (need 4.5) "1" 11px | pass |
| empty | __bottom__ | 23 | 7.81 (need 4.5) "1" 11px | pass |
| region-south | #act-universities | 11 | 7.81 (need 4.5) "1" 11px | pass |
| region-south | #atlas-type | 25 | 7.81 (need 4.5) "1" 11px | pass |
| region-south | #atlas-region-m | 25 | 7.81 (need 4.5) "1" 11px | pass |
| region-south | #atlas-filters | 25 | 7.81 (need 4.5) "1" 11px | pass |
| region-south | __bottom__ | 25 | 7.81 (need 4.5) "1" 11px | pass |
| institution-iit-kanpur | #act-universities | 11 | 7.64 (need 4.5) "1" 11px | pass |
| institution-iit-kanpur | #atlas-type | 32 | 7.64 (need 4.5) "1" 11px | pass |
| institution-iit-kanpur | #atlas-region-m | 32 | 7.64 (need 4.5) "1" 11px | pass |
| institution-iit-kanpur | #atlas-filters | 32 | 7.64 (need 4.5) "1" 11px | pass |
| institution-iit-kanpur | __bottom__ | 21 | 8.27 (need 4.5) "Kanpur" 11px | pass |
| filters-ini-medicine | #act-universities | 9 | 7.81 (need 4.5) "1" 11px | pass |
| filters-ini-medicine | #atlas-type | 16 | 7.81 (need 4.5) "1" 11px | pass |
| filters-ini-medicine | #atlas-region-m | 16 | 7.81 (need 4.5) "1" 11px | pass |
| filters-ini-medicine | #atlas-filters | 16 | 7.81 (need 4.5) "1" 11px | pass |
| filters-ini-medicine | __bottom__ | 16 | 7.81 (need 4.5) "1" 11px | pass |

Text/background pairs tested: 415; passing: 415; failing: 0
