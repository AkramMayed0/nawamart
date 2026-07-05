const Feedback = require('../models/Feedback');

class FeedbackService {
  async submitFeedback(data) {
    const feedback = await Feedback.create({
      feedbackType: data.feedbackType,
      merchant: data.merchant || null,
      customer: data.customer || null,
      email: data.email || null,
      npsScore: data.npsScore ?? null,
      rating: data.rating ?? null,
      message: data.message || null,
      featureTitle: data.featureTitle || null,
      featureDescription: data.featureDescription || null,
      featureCategory: data.featureCategory || null,
      source: data.source || 'in_app',
    });
    return feedback;
  }

  async voteFeatureRequest(feedbackId, userId, userRole) {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) return null;
    if (feedback.feedbackType !== 'feature_request') return null;

    const alreadyVoted = feedback.voters.some(
      (v) => v.user && v.user.toString() === userId.toString()
    );
    if (alreadyVoted) return feedback;

    feedback.voters.push({ user: userId, userRole });
    feedback.votes = feedback.voters.length;
    await feedback.save();
    return feedback;
  }

  async unvoteFeatureRequest(feedbackId, userId) {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) return null;

    feedback.voters = feedback.voters.filter(
      (v) => v.user && v.user.toString() !== userId.toString()
    );
    feedback.votes = feedback.voters.length;
    await feedback.save();
    return feedback;
  }

  async updateFeatureRequestStatus(feedbackId, status, adminResponse) {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) return null;

    feedback.status = status;
    if (adminResponse) {
      feedback.adminResponse = {
        content: adminResponse,
        respondedAt: new Date(),
      };
    }
    await feedback.save();
    return feedback;
  }

  async getNPSReport() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [total, last30Days, last90Days] = await Promise.all([
      Feedback.find({ feedbackType: 'nps' }).lean(),
      Feedback.find({ feedbackType: 'nps', createdAt: { $gte: thirtyDaysAgo } }).lean(),
      Feedback.find({ feedbackType: 'nps', createdAt: { $gte: ninetyDaysAgo } }).lean(),
    ]);

    const calculateNPS = (responses) => {
      if (responses.length === 0) return null;
      const promoters = responses.filter((r) => r.npsCategory === 'promoter').length;
      const detractors = responses.filter((r) => r.npsCategory === 'detractor').length;
      return Math.round(((promoters - detractors) / responses.length) * 100);
    };

    const scoreDistribution = (responses) => {
      const dist = {};
      for (let i = 0; i <= 10; i++) dist[i] = 0;
      responses.forEach((r) => {
        if (r.npsScore !== null && r.npsScore !== undefined) {
          dist[r.npsScore] = (dist[r.npsScore] || 0) + 1;
        }
      });
      return dist;
    };

    return {
      totalResponses: total.length,
      npsScore: calculateNPS(total),
      npsLast30Days: calculateNPS(last30Days),
      npsLast90Days: calculateNPS(last90Days),
      distribution: {
        promoters: total.filter((r) => r.npsCategory === 'promoter').length,
        passives: total.filter((r) => r.npsCategory === 'passive').length,
        detractors: total.filter((r) => r.npsCategory === 'detractor').length,
      },
      scoreDistribution: scoreDistribution(total),
      responseCount: {
        total: total.length,
        last30Days: last30Days.length,
        last90Days: last90Days.length,
      },
    };
  }

  async getFeatureRequests(filters = {}) {
    const query = { feedbackType: 'feature_request' };
    if (filters.status) query.status = filters.status;
    if (filters.category) query.featureCategory = filters.category;

    const requests = await Feedback.find(query)
      .sort({ votes: -1, createdAt: -1 })
      .select('-voters')
      .lean();

    return requests;
  }

  async getRecentFeedback(limit = 20) {
    return Feedback.find({ feedbackType: { $in: ['general', 'bug_report'] } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('merchant', 'name email')
      .populate('customer', 'name email')
      .lean();
  }

  async getFeedbackStats() {
    const [totalNps, totalGeneral, totalFeatureRequests, totalBugReports] = await Promise.all([
      Feedback.countDocuments({ feedbackType: 'nps' }),
      Feedback.countDocuments({ feedbackType: 'general' }),
      Feedback.countDocuments({ feedbackType: 'feature_request' }),
      Feedback.countDocuments({ feedbackType: 'bug_report' }),
    ]);

    return {
      total: totalNps + totalGeneral + totalFeatureRequests + totalBugReports,
      byType: {
        nps: totalNps,
        general: totalGeneral,
        featureRequest: totalFeatureRequests,
        bugReport: totalBugReports,
      },
    };
  }
}

module.exports = new FeedbackService();
