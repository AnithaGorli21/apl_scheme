const aplWipService = require('../services/aplWip.service');
const { successResponse, notFoundResponse, databaseErrorResponse, validationErrorResponse } = require('../utils/response');

async function aplWipRoutes(fastify, options) {
  // Get all WIP records
  fastify.get('/', {
    schema: {
      description: 'Get all WIP records with pagination, search, and filters',
      tags: ['APL WIP'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          search: { type: 'string' },
          isActive: { type: 'boolean' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
          dfsoCode: { type: 'integer' },
          afsoCode: { type: 'integer' },
          fpsCode: { type: 'integer' },
          sortBy: { type: 'string', default: 'created_at' },
          sortOrder: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await aplWipService.getAll(request.query);
      return reply.send(successResponse(result.data, 'WIP records retrieved successfully', result.pagination));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });

  // Get WIP by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get WIP record by ID',
      tags: ['APL WIP'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      }
    }
  }, async (request, reply) => {
    try {
      const wip = await aplWipService.getById(request.params.id);
      if (!wip) return reply.status(404).send(notFoundResponse('WIP record'));
      return reply.send(successResponse(wip, 'WIP record retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });

  // Bulk insert WIP records
  fastify.post('/bulk', {
    schema: {
      description: 'Bulk insert WIP records',
      tags: ['APL WIP'],
      body: {
        type: 'array',
        items: {
          type: 'object',
          required: ['dist_code', 'dist_name', 'dfso_code', 'dfso_name', 'afso_code', 'afso_name', 
                     'fps_code', 'fps_name', 'rc_no', 'hof_name', 'member_id', 'member_name'],
          properties: {
            sno: { type: 'integer' },
            dist_code: { type: 'integer' },
            dist_name: { type: 'string' },
            dfso_code: { type: 'integer' },
            dfso_name: { type: 'string' },
            afso_code: { type: 'integer' },
            afso_name: { type: 'string' },
            fps_code: { type: 'integer' },
            fps_name: { type: 'string' },
            ct_card_desk: { type: 'string' },
            rc_no: { type: 'integer' },
            hof_name: { type: 'string' },
            member_id: { type: 'integer' },
            member_name: { type: 'string' },
            gender: { type: 'string' },
            relation_name: { type: 'string' },
            member_dob: { type: 'string' },
            uid: { type: 'string' },
            demo_auth: { type: 'string' },
            ekyc: { type: 'string' },
            total_disbursement_amount: { type: 'number' },
            is_disbursement_account: { type: 'boolean' },
            status: { type: 'string', enum: ['SCRUTINY_PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      if (!Array.isArray(request.body) || request.body.length === 0) {
        return reply.status(400).send(validationErrorResponse('Request body must be a non-empty array'));
      }

      const userId = request.headers['x-user-id'] || 1; // In production, get from auth token
      const result = await aplWipService.bulkInsert(request.body, userId);
      
      return reply.status(201).send(successResponse(
        result.data, 
        `Successfully inserted ${result.count} WIP records`, 
        { count: result.count }
      ));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });

  // Create WIP record
  fastify.post('/', {
    schema: {
      description: 'Create new WIP record',
      tags: ['APL WIP'],
      body: {
        type: 'object',
        required: ['dist_code', 'dist_name', 'dfso_code', 'dfso_name', 'afso_code', 'afso_name', 
                   'fps_code', 'fps_name', 'rc_no', 'hof_name', 'member_id', 'member_name'],
        properties: {
          sno: { type: 'integer' },
          dist_code: { type: 'integer' },
          dist_name: { type: 'string' },
          dfso_code: { type: 'integer' },
          dfso_name: { type: 'string' },
          afso_code: { type: 'integer' },
          afso_name: { type: 'string' },
          fps_code: { type: 'integer' },
          fps_name: { type: 'string' },
          ct_card_desk: { type: 'string' },
          rc_no: { type: 'integer' },
          hof_name: { type: 'string' },
          member_id: { type: 'integer' },
          member_name: { type: 'string' },
          gender: { type: 'string' },
          relation_name: { type: 'string' },
          member_dob: { type: 'string', format: 'date' },
          uid: { type: 'string' },
          demo_auth: { type: 'string' },
          ekyc: { type: 'string' },
          total_disbursement_amount: { type: 'number' },
          is_disbursement_account: { type: 'boolean' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.headers['x-user-id'] || 1; // In production, get from auth token
      const wip = await aplWipService.create(request.body, userId);
      return reply.status(201).send(successResponse(wip, 'WIP record created successfully'));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });

  // Update WIP record
  fastify.put('/:id', {
    schema: {
      description: 'Update WIP record',
      tags: ['APL WIP'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      },
      body: {
        type: 'object',
        required: ['dist_code', 'dist_name', 'dfso_code', 'dfso_name', 'afso_code', 'afso_name', 
                   'fps_code', 'fps_name', 'rc_no', 'hof_name', 'member_id', 'member_name']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.headers['x-user-id'] || 1;
      const wip = await aplWipService.update(request.params.id, request.body, userId);
      if (!wip) return reply.status(404).send(notFoundResponse('WIP record'));
      return reply.send(successResponse(wip, 'WIP record updated successfully'));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });

  // Approve WIP record
  fastify.patch('/:id/approve', {
    schema: {
      description: 'Approve WIP record',
      tags: ['APL WIP'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      },
      body: {
        type: 'object',
        properties: {
          remarks: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.headers['x-user-id'] || 1;
      const wip = await aplWipService.approve(request.params.id, userId, request.body.remarks);
      if (!wip) return reply.status(404).send(notFoundResponse('WIP record'));
      return reply.send(successResponse(wip, 'WIP record approved successfully'));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });

  // Reject WIP record
  fastify.patch('/:id/reject', {
    schema: {
      description: 'Reject WIP record',
      tags: ['APL WIP'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      },
      body: {
        type: 'object',
        properties: {
          remarks: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.headers['x-user-id'] || 1;
      const wip = await aplWipService.reject(request.params.id, userId, request.body.remarks);
      if (!wip) return reply.status(404).send(notFoundResponse('WIP record'));
      return reply.send(successResponse(wip, 'WIP record rejected successfully'));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });

  // Delete WIP record
  fastify.delete('/:id', {
    schema: {
      description: 'Delete WIP record',
      tags: ['APL WIP'],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      }
    }
  }, async (request, reply) => {
    try {
      const wip = await aplWipService.delete(request.params.id);
      if (!wip) return reply.status(404).send(notFoundResponse('WIP record'));
      return reply.send(successResponse(wip, 'WIP record deleted successfully'));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });

  // Get WIP statistics
  fastify.get('/stats/summary', {
    schema: {
      description: 'Get WIP statistics summary',
      tags: ['APL WIP']
    }
  }, async (request, reply) => {
    try {
      const stats = await aplWipService.getStatistics();
      return reply.send(successResponse(stats, 'WIP statistics retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(databaseErrorResponse(error));
    }
  });
}

module.exports = aplWipRoutes;
