
API:

http://localhost:3000/api/v1/apl-wip/?page=1&limit=100&sortBy=rc_no&sortOrder=DESC&isActive=true&wf_status=SCRUTINY_PENDING

Current Response Data Object:
 {
            "id": "19",
            "rc_no": "272029418641",
            "member_id": "27202941864101",
            "dist_code": "502",
            "dfso_code": "1502",
            "afso_code": "1502308",
            "fps_code": "150230800186",
            "fps_name": "ANAI",
            "hof_name": "BANU CHHATTU CHAUDHARI",
            "wf_status": "SCRUTINY_PENDING",
            "is_active": true,
            "created_at": "2026-04-19T11:08:51.371Z",
            "created_by": 1,
            "updated_at": null,
            "updated_by": null,
            "fy": "2023-24",
            "mm": 1,
            "member_count": 3,
            "amount": 510,
            "is_aadhaar_linked_account": true,
            "is_disbursement_account": true
        }

        dist_name, dfso_name, afso_name, member_name, gender, relationship,dob, aadhaar_no, demo_auth, ekyc - these additional columns are in t_apl_data table.
        Based on member_id join and get the data also in object to show the content in UI.