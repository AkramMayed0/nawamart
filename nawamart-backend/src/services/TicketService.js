const Ticket = require('../models/Ticket');
const TicketMessage = require('../models/TicketMessage');
const Merchant = require('../models/Merchant');
const Store = require('../models/Store');

class TicketService {
  async createTicket(data) {
    const ticket = await Ticket.create({
      merchant: data.merchant || null,
      store: data.store || null,
      customer: data.customer || null,
      subject: data.subject,
      description: data.description,
      category: data.category || 'general',
      priority: data.priority || 'medium',
      source: data.source || 'in_app',
      tags: data.tags || [],
    });

    await TicketMessage.create({
      ticket: ticket._id,
      sender: data.senderId || data.merchant || data.customer,
      senderRole: data.senderRole || (data.merchant ? 'merchant' : 'customer'),
      senderName: data.senderName || null,
      content: data.description,
      type: 'text',
    });

    return ticket;
  }

  async addMessage(ticketId, senderId, senderRole, content, options = {}) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return null;

    if (ticket.status === 'closed') {
      ticket.status = 'open';
      await ticket.save();
    }

    if (!ticket.firstResponseAt && senderRole === 'admin') {
      ticket.firstResponseAt = new Date();
      await ticket.save();
    }

    const message = await TicketMessage.create({
      ticket: ticketId,
      sender: senderId,
      senderRole,
      senderName: options.senderName || null,
      content,
      type: options.type || 'text',
      attachments: options.attachments || [],
      isInternal: options.isInternal || false,
    });

    return message;
  }

  async changeStatus(ticketId, status, userId, userRole) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return null;

    ticket.status = status;
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    }
    if (status === 'closed') {
      ticket.closedAt = new Date();
      ticket.closedBy = userId;
    }
    if (status === 'in_progress' && userRole === 'admin') {
      ticket.assignedTo = userId;
    }
    await ticket.save();

    const systemMessage = await TicketMessage.create({
      ticket: ticketId,
      sender: userId,
      senderRole: userRole,
      content: this.getStatusChangeMessage(status),
      type: 'system',
      isInternal: false,
    });

    return ticket;
  }

  getStatusChangeMessage(status) {
    const messages = {
      open: 'تم فتح التذكرة',
      in_progress: 'تم بدء العمل على التذكرة',
      waiting_on_merchant: 'في انتظار رد التاجر',
      waiting_on_customer: 'في انتظار رد العميل',
      resolved: 'تم حل المشكلة',
      closed: 'تم إغلاق التذكرة',
    };
    return messages[status] || `تم تغيير الحالة إلى ${status}`;
  }

  async assignTicket(ticketId, adminId) {
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { assignedTo: adminId },
      { new: true }
    ).populate('assignedTo', 'name email');
    return ticket;
  }

  async addInternalNote(ticketId, adminId, content) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return null;

    ticket.internalNotes.push({
      content,
      addedBy: adminId,
    });
    await ticket.save();
    return ticket;
  }

  async rateSatisfaction(ticketId, score, comment) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return null;

    ticket.satisfactionRating = {
      score,
      comment: comment || null,
      ratedAt: new Date(),
    };
    await ticket.save();
    return ticket;
  }

  async getTicketStats() {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'in_progress' }),
      Ticket.countDocuments({ status: 'resolved' }),
      Ticket.countDocuments({ status: 'closed' }),
      Ticket.countDocuments({ priority: 'urgent', status: { $nin: ['resolved', 'closed'] } }),
    ]);

    const avgResponse = await Ticket.aggregate([
      { $match: { firstResponseAt: { $ne: null } } },
      {
        $group: {
          _id: null,
          avgHours: { $avg: { $divide: [{ $subtract: ['$firstResponseAt', '$createdAt'] }, 3600000] } },
        },
      },
    ]);

    const avgResolution = await Ticket.aggregate([
      { $match: { resolvedAt: { $ne: null } } },
      {
        $group: {
          _id: null,
          avgHours: { $avg: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000] } },
        },
      },
    ]);

    return {
      total: totalTickets,
      byStatus: {
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
      },
      urgent: urgentTickets,
      averageResponseTimeHours: avgResponse[0]?.avgHours?.toFixed(1) ?? null,
      averageResolutionTimeHours: avgResolution[0]?.avgHours?.toFixed(1) ?? null,
    };
  }
}

module.exports = new TicketService();
