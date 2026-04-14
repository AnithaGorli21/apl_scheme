DataBase: 
Use DB - Postgres
Master Entities: I have in this excel
Please create entity tables as per the excel - Excel path - ATL.xlsx
Table Performance should be good
Common - Add Is_active , created_at, created_by, modified_at, modified_by columns for all created tables

Master Tables:
Table	            Table Name	        Comments
Financial Year	    m_financial_year	Create data with dummy data - 20 records sufficient
Month	            m_month             Create data with dummy data - 20 records sufficient
AFSO Office	        m_asfo	            Take it from excel tab - m_asfo
DFSO Name	        m_dfso	            Take it from excel tab - m_dsfo
FPS Name		    m_fps	            Take it from excel tab - m_fps
APL Data	        t_apl_data	        Take it from excel tab - t_apl_data
User	            t_user	            Create table with columns username, password, role, 
APL Data WIP table	t_apl_wip_data	    This content will be pushed based on User Request for Approval 
                                        -use all columns of t_apl_data table
                                        Along with add 
                                        - total_disbusement_amount, is_disbursement_acount (Boolen), status (String)
