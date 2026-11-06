# Institution data verification (2026-11-06) (DRY RUN: nothing in src/ was changed)

Every kept claim matched a pattern on the live official page; quotes are exact, word-bounded excerpts. Anything not listed as verified is shown to students as unavailable, with its recorded reason.

| Institution | Result | Notes |
|---|---|---|
| IIT Delhi | kept | unavailable: duration of M.Tech(page gives a usual duration; not recorded); duration of MBA(source does not state it); other courses(not yet verified; the list is partial) |
| IIT Bombay | kept | unavailable: courses(not yet verified) |
| IIT Madras | kept | unavailable: established(no unambiguous evidence); other courses(not yet verified; the list is partial) |
| IIT Kanpur | kept | unavailable: type(no evidence recorded); courses(not yet verified) |
| IIT Kharagpur | kept | unavailable: established(no unambiguous evidence); other courses(not yet verified; the list is partial) |
| IIT Guwahati | kept | unavailable: type(no evidence recorded); courses(not yet verified) |
| IISc Bengaluru | kept | unavailable: type(no evidence recorded); duration of Bachelor of Science (Research)(mentioned in the statement; not recorded); duration of M.Tech(mentioned in the statement; not recorded); other courses(not yet verified; the list is partial) |
| University of Delhi | kept | unavailable: type(no evidence recorded); domains(multi-disciplinary; not verifiable from one phrase); courses(not yet verified) |
| AIIMS New Delhi | kept | unavailable: established(no unambiguous evidence); courses(not yet verified) |
| SPA New Delhi | kept | unavailable: established(no unambiguous evidence); duration of B.Arch(source does not state it); other courses(not yet verified; the list is partial) |
| NLSIU Bengaluru | kept | unavailable: type(no evidence recorded); established(no unambiguous evidence); other courses(not yet verified; the list is partial) |
| IIM Ahmedabad | kept | unavailable: type(no evidence recorded); established(no unambiguous evidence); other courses(not yet verified; the list is partial) |
| BITS Pilani | kept | unavailable: established(no unambiguous evidence); duration of B.E. (Computer Science)(source does not state it); duration of B.Pharm(source does not state it); other courses(not yet verified; the list is partial) |
| VIT Vellore | kept | unavailable: type(no evidence recorded); duration of B.Tech(source does not state it); other courses(not yet verified; the list is partial) |
| BHU Varanasi | kept | unavailable: type(no evidence recorded); established(no unambiguous evidence); domains(multi-disciplinary; not verifiable from one phrase); courses(not yet verified) |
| AIIMS Bhopal | kept | unavailable: type(no evidence recorded); established(no unambiguous evidence); domain medicine(pattern not found); courses(not yet verified) |
| Anna University | kept | unavailable: type(no evidence recorded); established(no unambiguous evidence); domains(multi-disciplinary; not verifiable from one phrase); courses(not yet verified) |

Kept: 17 of 17

## Programme match log

| Programme | Kind | Status | Matches | Duration |
|---|---|---|---|---|
| iit-delhi--m-tech | statement | matched | 1 |  |
| iit-delhi--mba | listing | matched | 1 |  |
| iit-delhi--mba (also tried) | listing | page-unavailable (UNABLE_TO_VERIFY_LEAF_SIGNATURE) | 0 |  |
| iit-madras--b-tech | statement | matched | 1 | ok |
| iit-madras--m-tech | statement | matched | 1 | ok |
| iit-madras--m-sc | statement | matched | 1 | ok |
| iit-madras--mba | statement | matched | 1 | ok |
| iit-kharagpur--b-tech | statement | matched | 1 | ok |
| iit-kharagpur--b-arch | statement | matched | 1 | ok |
| iisc-bengaluru--bachelor-of-science-research | statement | matched | 1 |  |
| iisc-bengaluru--m-tech | listing | matched | 2 |  |
| spa-delhi--b-arch | listing | matched | 1 |  |
| nlsiu-bengaluru--b-a-ll-b-hons | statement | matched | 1 | ok |
| nlsiu-bengaluru--ll-b-hons | statement | matched | 1 | ok |
| nlsiu-bengaluru--ll-m | statement | matched | 1 | ok |
| iim-ahmedabad--mba-pgp | statement | matched | 1 | ok |
| bits-pilani--b-e-computer-science | listing | matched | 2 |  |
| bits-pilani--b-pharm | listing | matched | 2 |  |
| vit-vellore--b-tech | listing | matched | 1 |  |

## Institution-level claim match counts (diagnostic only)

These claims always use the FIRST match. This section records how many places each pattern matched; it never changes a fact. 62 claims were checked: 24 matched once, 36 matched the same phrase several times (the page simply repeats it), 2 matched different wording (review these).

| Institution | Claim | Matches | Shape | Distinct wordings |
|---|---|---|---|---|
| iit-delhi | name | 9 | repeated | indian institute of technology delhi |
| iit-delhi | city | 6 | varied | hauz khas / new delhi |
| iit-delhi | academicDomains:technology | 9 | repeated | institute of technology |
| iit-bombay | name | 2 | repeated | iit bombay was established |
| iit-bombay | academicDomains:technology | 2 | repeated | indian institute of technology |
| iit-madras | city | 4 | repeated | chennai |
| iit-kanpur | name | 4 | repeated | indian institute of technology kanpur |
| iit-kanpur | city | 4 | repeated | indian institute of technology kanpur |
| iit-kanpur | academicDomains:technology | 4 | repeated | institute of technology |
| iit-kharagpur | name | 4 | repeated | indian institute of technology kharagpur |
| iit-kharagpur | city | 4 | repeated | technology kharagpur |
| iit-kharagpur | academicDomains:technology | 8 | repeated | institute of technology |
| iit-guwahati | name | 4 | repeated | indian institute of technology guwahati |
| iit-guwahati | city | 4 | repeated | technology guwahati |
| iit-guwahati | academicDomains:technology | 4 | repeated | institute of technology |
| iisc-bengaluru | name | 3 | repeated | indian institute of science |
| iisc-bengaluru | city | 2 | repeated | bengaluru |
| iisc-bengaluru | academicDomains:science | 3 | repeated | indian institute of science |
| university-of-delhi | name | 13 | varied | delhi university / university of delhi |
| university-of-delhi | city | 3 | repeated | delhi university |
| aiims-delhi | name | 3 | repeated | all india institute of medical sciences |
| aiims-delhi | city | 2 | repeated | medical sciences, new delhi |
| aiims-delhi | academicDomains:medicine | 4 | repeated | institute of medical sciences |
| spa-delhi | name | 5 | repeated | school of planning and architecture |
| spa-delhi | city | 2 | repeated | architecture, new delhi |
| spa-delhi | academicDomains:architecture | 5 | repeated | planning and architecture |
| nlsiu-bengaluru | name | 7 | repeated | national law school of india university |
| nlsiu-bengaluru | city | 3 | repeated | university, bengaluru |
| nlsiu-bengaluru | academicDomains:law | 7 | repeated | national law school |
| iim-ahmedabad | name | 3 | repeated | indian institute of management ahmedabad |
| iim-ahmedabad | city | 3 | repeated | management ahmedabad |
| iim-ahmedabad | academicDomains:business | 3 | repeated | indian institute of management |
| vit-vellore | city | 8 | repeated | vellore |
| banaras-hindu-university | name | 6 | repeated | banaras hindu university |
| aiims-bhopal | name | 15 | repeated | aiims bhopal |
| aiims-bhopal | city | 15 | repeated | aiims bhopal |
| anna-university | name | 191 | repeated | anna university |
| anna-university | city | 25 | repeated | anna university, chennai |
