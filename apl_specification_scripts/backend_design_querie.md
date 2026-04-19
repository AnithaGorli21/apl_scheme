AFSO:
Tab  1- New Scrutiny

Use case 1:  

Get records from t_apl_data — where with selected month, year data should not be there in t_apl_scrutiny_data (Excluding already submitted for the selected month in t_apl_scrutiny_data)
Key Points:


Ex: with cte as (
  SELECT rc_no , count(1) over(partition by rc_no) cnt
  FROM apl.t_apl_data a
)select * from cte a
where not exists (select from apl.t_apl_scrutinydetail b
where a.rc_no=b.rc_no and b.fy='2026-27' and b.mm=4 and cnt=b.member_count)




Tab 2 Old Scrutiny:

Get Records from apl.t_apl_scrutinydetail from (latest distinct APPROVED records —where all family records matches with t_apl_data)


Only update APIS source - apl_scheme_services
fy - Financial Year
mm - Selected month in 1,2, 3,...12 format - Allow Fetch and Update APIS of t_apl_data, t_apl_scrutinydetail to handle or insert fy, mm columns data.

Pass fy, mm values also white submitting the bulk insert or update

