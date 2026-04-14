user below API to fetch masterdata on Proceed.


Fetch Data on Proceed button: Process data and bind according to my design. 
curl -X 'GET' \
  'http://127.0.0.1:3000/api/v1/apl-data/?page=1&limit=10&sortBy=created_at&sortOrder=DESC' \
  -H 'accept: */*'

Constraint: 
Based on configuration flag from env, load mock data otherwise data from API only