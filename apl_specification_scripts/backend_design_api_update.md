Update the below API as per request:

curl 'http://localhost:3000/api/v1/apl-data/?page=1&limit=1000&sortBy=rc_no&sortOrder=DESC&fpsCode=150230800208&fy=2024-25&mm=2&excludeSubmitted=true' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'x-user-id: 1'

Use Case: 
  Get records from t_apl_data — where with selected month, year data should not be there in t_apl_scrutiny_data (Excluding already submitted records - status 'SCRUTINY_PENDING' for the selected month in t_apl_scrutiny_data)

Example of query : with cte as (
  SELECT rc_no , count(1) over(partition by rc_no) cnt
  FROM apl.t_apl_data a
)select * from cte a
where not exists (select from apl.t_apl_scrutinydetail b
where a.rc_no=b.rc_no and b.fy='2026-27' and b.mm=4 and cnt=b.member_count)

You can improve the query based on your logic

Please support keep all exsiting filters and of the api