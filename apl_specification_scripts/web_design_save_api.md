Now When clicking on Save , call below api to store data.
curl -X 'POST' \
  'http://127.0.0.1:3000/api/v1/apl-wip/bulk' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '[
  {
    "sno": 0,
    "dist_code": 0,
    "dist_name": "string",
    "dfso_code": 0,
    "dfso_name": "string",
    "afso_code": 0,
    "afso_name": "string",
    "fps_code": 0,
    "fps_name": "string",
    "ct_card_desk": "string",
    "rc_no": 0,
    "hof_name": "string",
    "member_id": 0,
    "member_name": "string",
    "gender": "string",
    "relation_name": "string",
    "member_dob": "string",
    "uid": "string",
    "demo_auth": "string",
    "ekyc": "string",
    "total_disbursement_amount": 0,
    "is_disbursement_account": true,
    "status": "SCRUTINY_PENDING"
  }
]'


After Sucessful submission show sucess prompt and reset page.
Incase of API failure show failure prompt only with close icon 