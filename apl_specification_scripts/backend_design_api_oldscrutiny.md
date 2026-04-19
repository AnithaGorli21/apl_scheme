Update the below API as per request:

curl 'http://localhost:3000/api/v1/apl-wip/old-scrutiny?page=1&limit=1000&sortBy=rc_no&sortOrder=DESC&fpsCode=150230800186&fy=2023-24&mm=2&status=APPROVED&latestOnly=true' \
 
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'x-user-id: 1'


  Use Case: 
 
Get Records from apl.t_apl_scrutinydetail from (latest distinct APPROVED records —where all family records matches with t_apl_data irrespective of month filter and year filter)

You can improve the query based on your logic

Please support keep all exsiting filters and of the api