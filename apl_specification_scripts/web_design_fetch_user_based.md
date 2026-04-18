1. Now When DFSO Login in

> On the Scheme Search page, build a search form with these fields:
> - Financial Year — dropdown, mandatory
> - Month — dropdown, mandatory
> - DFSO Office Name — read-only label field, non-editable, pre-filled based on logged-in user's location
> - AFSO Office Name — dropdown, mandatory, from /m_afso API
> - FPS Name — dropdown, mandatory
>
> Add a Proceed button. On click, validate that all mandatory fields are filled. If valid, fetch or load beneficiary data from created API based on the selected parameters and display the Beneficiary List table below the form. Records should be fetched where status = 'SCRUTINY_PENDING'

Call update api to update the record status as APPROVED
