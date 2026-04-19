const db = require('../config/database');
const { buildPagination, buildSearchQuery, buildActiveFilter, buildOrderBy } = require('../utils/pagination');
const { tables } = require('../config/tables');

class APLWipService {
  /**
   * Get all WIP records with pagination, search, and filters
   */
  async getAll(queryParams) {
    try {
      const { 
        page = 1, limit = 10, search = '', isActive, status, 
        dfsoCode, afsoCode, fpsCode, sortBy = 'created_at', sortOrder = 'DESC' 
      } = queryParams;

      // Build WHERE conditions
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      // Add search condition
      if (search) {
        const searchColumns = [
          'member_name', 'hof_name', 'rc_no::text', 'member_id::text', 
          'uid', 'dist_name', 'fps_name'
        ];
        const searchQuery = buildSearchQuery(search, searchColumns);
        if (searchQuery.condition) {
          conditions.push(searchQuery.condition);
          searchQuery.params.forEach(p => params.push(p));
          paramIndex += searchQuery.params.length;
        }
      }

      // Add status filter
      if (status) {
        conditions.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      // Add DFSO filter
      if (dfsoCode) {
        conditions.push(`dfso_code = $${paramIndex}`);
        params.push(dfsoCode);
        paramIndex++;
      }

      // Add AFSO filter
      if (afsoCode) {
        conditions.push(`afso_code = $${paramIndex}`);
        params.push(afsoCode);
        paramIndex++;
      }

      // Add FPS filter
      if (fpsCode) {
        conditions.push(`fps_code = $${paramIndex}`);
        params.push(fpsCode);
        paramIndex++;
      }

      // Add active filter
      if (isActive !== undefined) {
        const activeFilter = buildActiveFilter(isActive);
        if (activeFilter.condition) {
          conditions.push(activeFilter.condition.replace('$1', `$${paramIndex}`));
          params.push(...activeFilter.params);
          paramIndex++;
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM ${tables.APL_WIP} ${whereClause}`;
      const countResult = await db.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0].count);

      // Build pagination
      const pagination = buildPagination(page, limit, totalCount);

      // Get data
      const orderByClause = buildOrderBy(sortBy, sortOrder);
      const dataQuery = `
        SELECT * FROM ${tables.APL_WIP}
        ${whereClause}
        ${orderByClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const dataParams = [...params, pagination.query.limit, pagination.query.offset];
      const result = await db.query(dataQuery, dataParams);

      return {
        data: result.rows,
        pagination: pagination.metadata
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get WIP record by ID
   */
  async getById(id) {
    try {
      const query = `SELECT * FROM ${tables.APL_WIP} WHERE id = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk insert WIP records
   */
  async bulkInsert(wipDataArray, userId = 1) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const insertedRecords = [];
      
      for (const wipData of wipDataArray) {
        const query = `
          INSERT INTO ${tables.APL_WIP} (
            dist_code, dfso_code, afso_code,
            fps_code, fps_name, rc_no, hof_name, member_id,
            wf_status,
            created_by, is_active
            --total_benefit_amount,
            -- is_disbursement_account, 

          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            --, $12, $13, $14,
          )
          RETURNING *
        `;

        const params = [
          wipData.dist_code,
          wipData.dfso_code,
          wipData.afso_code,
          wipData.fps_code,
          wipData.fps_name,
          wipData.rc_no,
          wipData.hof_name,
          wipData.member_id,
          wipData.status || 'PENDING',
          userId,
          true
          //wipData.total_benefit_amount || 0,
          //wipData.is_disbursement_account || true,
        ];

        const result = await client.query(query, params);
        insertedRecords.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      
      return {
        success: true,
        count: insertedRecords.length,
        data: insertedRecords
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create new WIP record
   */
  async create(wipData, userId = 1) {
    try {
      const query = `
        INSERT INTO ${tables.APL_WIP} (
          sno, dist_code, dist_name, dfso_code, dfso_name, afso_code, afso_name,
          fps_code, fps_name, ct_card_desk, rc_no, hof_name, member_id, member_name,
          gender, relation_name, member_dob, uid, demo_auth, ekyc,
          total_disbursement_amount, is_disbursement_account, status,
          created_by, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
        )
        RETURNING *
      `;

      const params = [
        wipData.sno || 0,
        wipData.dist_code,
        wipData.dist_name,
        wipData.dfso_code,
        wipData.dfso_name,
        wipData.afso_code,
        wipData.afso_name,
        wipData.fps_code,
        wipData.fps_name,
        wipData.ct_card_desk || null,
        wipData.rc_no,
        wipData.hof_name,
        wipData.member_id,
        wipData.member_name,
        wipData.gender || null,
        wipData.relation_name || null,
        wipData.member_dob || null,
        wipData.uid || null,
        wipData.demo_auth || null,
        wipData.ekyc || null,
        wipData.total_disbursement_amount || 0,
        wipData.is_disbursement_account || false,
        wipData.status || 'PENDING',
        userId,
        true
      ];

      const result = await db.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update WIP record
   */
  async update(id, wipData, userId = 1) {
    try {
      const query = `
        UPDATE ${tables.APL_WIP} 
        SET 
          sno = $1, dist_code = $2, dist_name = $3, dfso_code = $4, dfso_name = $5,
          afso_code = $6, afso_name = $7, fps_code = $8, fps_name = $9,
          ct_card_desk = $10, rc_no = $11, hof_name = $12, member_id = $13,
          member_name = $14, gender = $15, relation_name = $16, member_dob = $17,
          uid = $18, demo_auth = $19, ekyc = $20,
          total_disbursement_amount = $21, is_disbursement_account = $22,
          status = $23, modified_by = $24, modified_at = CURRENT_TIMESTAMP,
          remarks = $25
        WHERE id = $26
        RETURNING *
      `;

      const params = [
        wipData.sno,
        wipData.dist_code,
        wipData.dist_name,
        wipData.dfso_code,
        wipData.dfso_name,
        wipData.afso_code,
        wipData.afso_name,
        wipData.fps_code,
        wipData.fps_name,
        wipData.ct_card_desk || null,
        wipData.rc_no,
        wipData.hof_name,
        wipData.member_id,
        wipData.member_name,
        wipData.gender || null,
        wipData.relation_name || null,
        wipData.member_dob || null,
        wipData.uid || null,
        wipData.demo_auth || null,
        wipData.ekyc || null,
        wipData.total_disbursement_amount || 0,
        wipData.is_disbursement_account || false,
        wipData.status || 'PENDING',
        userId,
        wipData.remarks || null,
        id
      ];

      const result = await db.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Approve WIP record
   */
  async approve(id, userId = 1, remarks = null) {
    try {
      const query = `
        UPDATE ${tables.APL_WIP} 
        SET status = 'APPROVED',
            approved_by = $1,
            approved_at = CURRENT_TIMESTAMP,
            modified_by = $1,
            modified_at = CURRENT_TIMESTAMP,
            remarks = $2
        WHERE id = $3
        RETURNING *
      `;

      const result = await db.query(query, [userId, remarks, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reject WIP record
   */
  async reject(id, userId = 1, remarks = null) {
    try {
      const query = `
        UPDATE ${tables.APL_WIP} 
        SET status = 'REJECTED',
            approved_by = $1,
            approved_at = CURRENT_TIMESTAMP,
            modified_by = $1,
            modified_at = CURRENT_TIMESTAMP,
            remarks = $2
        WHERE id = $3
        RETURNING *
      `;

      const result = await db.query(query, [userId, remarks, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete WIP record
   */
  async delete(id) {
    try {
      const query = `DELETE FROM ${tables.APL_WIP} WHERE id = $1 RETURNING *`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get WIP statistics
   */
  async getStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'SCRUTINY_PENDING') as pending,
          COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
          COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
          COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled
        FROM ${tables.APL_WIP}
      `;
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Old Scrutiny Records - Latest distinct APPROVED records matching with t_apl_data
   * Irrespective of fy and mm filters (they are informational only)
   */
  async getOldScrutinyRecords(queryParams) {
    try {
      const {
        page = 1,
        limit = 10,
        fpsCode,
        afsoCode,
        dfsoCode,
        status = 'APPROVED',
        latestOnly = true,
        sortBy = 'rc_no',
        sortOrder = 'DESC'
      } = queryParams;

      // Build WHERE conditions for filters (excluding fy and mm as per spec)
      const conditions = ['wip.wf_status = $1']; // Status fixed to APPROVED
      const params = [status];
      let paramIndex = 2;

      // Add DFSO filter
      if (dfsoCode) {
        conditions.push(`wip.dfso_code = $${paramIndex}`);
        params.push(dfsoCode);
        paramIndex++;
      }

      // Add AFSO filter
      if (afsoCode) {
        conditions.push(`wip.afso_code = $${paramIndex}`);
        params.push(afsoCode);
        paramIndex++;
      }

      // Add FPS filter
      if (fpsCode) {
        conditions.push(`wip.fps_code = $${paramIndex}`);
        params.push(fpsCode);
        paramIndex++;
      }

      const whereClause = conditions.join(' AND ');

      // Query logic: Get latest APPROVED records that match with t_apl_data
      // Using DISTINCT ON for latest records per rc_no
      const baseQuery = latestOnly ? `
        WITH latest_approved AS (
          SELECT DISTINCT ON (wip.rc_no) wip.*
          FROM ${tables.APL_WIP} wip
          WHERE ${whereClause}
          ORDER BY wip.rc_no, wip.created_at DESC
        )
        SELECT la.* 
        FROM latest_approved la
        WHERE EXISTS (
          SELECT 1 FROM ${tables.APL_DATA} data
          WHERE data.rc_no = la.rc_no
        )
      ` : `
        SELECT wip.* 
        FROM ${tables.APL_WIP} wip
        WHERE ${whereClause}
          AND EXISTS (
            SELECT 1 FROM ${tables.APL_DATA} data
            WHERE data.rc_no = wip.rc_no
          )
      `;

      // Get total count
      const countQuery = latestOnly ? `
        WITH latest_approved AS (
          SELECT DISTINCT ON (wip.rc_no) wip.rc_no
          FROM ${tables.APL_WIP} wip
          WHERE ${whereClause}
          ORDER BY wip.rc_no, wip.created_at DESC
        )
        SELECT COUNT(*) 
        FROM latest_approved la
        WHERE EXISTS (
          SELECT 1 FROM ${tables.APL_DATA} data
          WHERE data.rc_no = la.rc_no
        )
      ` : `
        SELECT COUNT(*) 
        FROM ${tables.APL_WIP} wip
        WHERE ${whereClause}
          AND EXISTS (
            SELECT 1 FROM ${tables.APL_DATA} data
            WHERE data.rc_no = wip.rc_no
          )
      `;

      const countResult = await db.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0].count);

      // Build pagination
      const pagination = buildPagination(page, limit, totalCount);

      // Get data with ordering and pagination
      const orderByClause = buildOrderBy(sortBy, sortOrder);
      const dataQuery = `
        ${baseQuery}
        ${orderByClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const dataParams = [...params, pagination.query.limit, pagination.query.offset];
      const result = await db.query(dataQuery, dataParams);

      return {
        data: result.rows,
        pagination: pagination.metadata
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk update WIP status (for DFSO approve/reject operations)
   */
  async bulkUpdateStatus(rcNumbers, status, remarks = null, userId = 1) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const updatedRecords = [];

      // Update all records for the given RC numbers
      for (const rcNo of rcNumbers) {
        const query = `
          UPDATE ${tables.APL_WIP}
          SET wf_status = $1,
              approved_by = $2,
              approved_at = CURRENT_TIMESTAMP,
              modified_by = $2,
              modified_at = CURRENT_TIMESTAMP,
              remarks = $3
          WHERE rc_no = $4
            AND wf_status = 'SCRUTINY_PENDING'
          RETURNING *
        `;

        const params = [status, userId, remarks, rcNo];
        const result = await client.query(query, params);
        updatedRecords.push(...result.rows);
      }

      await client.query('COMMIT');

      return {
        success: true,
        count: updatedRecords.length,
        data: updatedRecords
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new APLWipService();
