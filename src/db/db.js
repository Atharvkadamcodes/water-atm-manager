import { supabase, isSupabaseConfigured } from './supabase';
import { CUSTOMER_FILTER, CUSTOMER_STATUS } from '../utils/customerStatus';

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

// Helper to format ISO dates for Supabase queries
const getISOStartOfToday = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return today.toISOString();
};

const getISOStartOfWeek = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  return startOfWeek.toISOString();
};

const getISOStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

export const db = {
  isOfflineMode: () => {
    return false;
  },

  getStats: async () => {
    ensureSupabaseConfigured();

    try {
      // 1. Total Customers
      const { count: totalCustomers, error: err1 } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (err1) throw err1;

      // 2. Active Customers
      const { count: activeCustomers, error: err2 } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('status', CUSTOMER_STATUS.ACTIVE);

      if (err2) throw err2;

      // 3. Total Recharges
      const { count: totalRecharges, error: err3 } = await supabase
        .from('history')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'RECHARGE');

      if (err3) throw err3;

      const { data: rechargeRows, error: revenueError } = await supabase
        .from('history')
        .select('amount')
        .eq('event_type', 'RECHARGE');

      if (revenueError) throw revenueError;

      const totalRechargeRevenue = (rechargeRows || []).reduce((sum, row) => {
        return sum + (parseFloat(row.amount) || 0);
      }, 0);

      // Compute inactive customers (total - active)
      const { count: inactiveCustomers, error: inactiveError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('status', CUSTOMER_STATUS.INACTIVE);
      if (inactiveError) throw inactiveError;

      const { count: currentLostCardCustomers, error: err4 } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('has_lost_card', true);
      if (err4) throw err4;

      const { data: lostCardRecords, error: lostCardRecordsError } = await supabase
        .from('history')
        .select('customer_id')
        .eq('event_type', 'LOST_CARD');
      if (lostCardRecordsError) throw lostCardRecordsError;

      const resolvedCustomerIds = [...new Set((lostCardRecords || []).map((item) => item.customer_id))];
      let previousLostCardCustomers = 0;
      if (resolvedCustomerIds.length > 0) {
        const { count, error: previousError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .in('id', resolvedCustomerIds)
          .eq('has_lost_card', false);
        if (previousError) throw previousError;
        previousLostCardCustomers = count || 0;
      }
      
      return {
        totalCustomers: totalCustomers || 0,
        activeCustomers: activeCustomers || 0,
        inactiveCustomers: inactiveCustomers || 0,
        currentLostCardCustomers: currentLostCardCustomers || 0,
        previousLostCardCustomers,
        totalRecharges: totalRecharges || 0,
        totalRechargeRevenue
      };
    } catch (error) {
      console.error('Supabase getStats error:', error);
      throw error;
    }
  },

  getCustomers: async (searchQuery = '', page = 1, limit = 10, statusFilter = CUSTOMER_FILTER.ALL) => {
    ensureSupabaseConfigured();

    try {
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' });

      if (statusFilter === CUSTOMER_FILTER.LOST_CARD_CURRENT) {
        query = query.eq('has_lost_card', true);
      } else if (statusFilter === CUSTOMER_FILTER.LOST_CARD_PREVIOUS) {
        const { data: lostCardRecords, error: lostCardRecordsError } = await supabase
          .from('history')
          .select('customer_id')
          .eq('event_type', 'LOST_CARD');
        if (lostCardRecordsError) throw lostCardRecordsError;

        const resolvedCustomerIds = [...new Set((lostCardRecords || []).map((item) => item.customer_id))];
        if (resolvedCustomerIds.length === 0) {
          return { data: [], total: 0, pages: 0 };
        }
        query = query.in('id', resolvedCustomerIds).eq('has_lost_card', false);
      } else if (statusFilter && statusFilter !== CUSTOMER_FILTER.ALL) {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery.trim()) {
        const q = `%${searchQuery.trim()}%`;
        // Search by name, mobile number, or customer ID/code. Card numbers are optional and not part of primary search.
        query = query.or(`full_name.ilike.${q},mobile_number.ilike.${q},customer_code.ilike.${q},id.ilike.${q}`);
      }

      const from = (page - 1) * limit;
      const to = page * limit - 1;

      const { data, count, error } = await query
        .order('id', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Supabase getCustomers error:', error);
      throw error;
    }
  },

  getCustomerById: async (id) => {
    ensureSupabaseConfigured();

    try {
      // Fetch Customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (customerError) throw customerError;

      // Fetch customer history
      const { data: history, error: historyError } = await supabase
        .from('history')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      if (historyError) throw historyError;

      return {
        customer,
        history: history || []
      };
    } catch (error) {
      console.error('Supabase getCustomerById error:', error);
      throw error;
    }
  },

  addCustomer: async (fullName, mobileNumber) => {
    ensureSupabaseConfigured();

    try {
      const { data: customer, error: insertError } = await supabase
        .from('customers')
        .insert({
          full_name: fullName,
          mobile_number: mobileNumber,
          status: CUSTOMER_STATUS.ACTIVE
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return customer;
    } catch (error) {
      console.error('Supabase addCustomer error:', error);
      throw error;
    }
  },

  addRecharge: async (customerId, amount, notes) => {
    ensureSupabaseConfigured();

    try {
      const { data: historyEvent, error } = await supabase
        .from('history')
        .insert({
          customer_id: parseInt(customerId),
          event_type: 'RECHARGE',
          amount: parseFloat(amount),
          notes: notes || 'Cash recharge'
        })
        .select()
        .single();

      if (error) throw error;

      return historyEvent;
    } catch (error) {
      console.error('Supabase addRecharge error:', error);
      throw error;
    }
  },

  markCardLost: async (customerId, note = '') => {
    ensureSupabaseConfigured();

    try {
      const reportedAt = new Date().toISOString();
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({
          has_lost_card: true,
          lost_card_reported_at: reportedAt,
          lost_card_note: note || null
        })
        .eq('id', customerId)
        .select()
        .single();
      if (updateError) throw updateError;

      const { error: historyError } = await supabase
        .from('history')
        .insert({
          customer_id: parseInt(customerId),
          event_type: 'LOST_CARD',
          amount: null,
          notes: note || 'Lost card reported',
          created_at: reportedAt
        });

      if (historyError) throw historyError;
      return updatedCustomer;
    } catch (error) {
      console.error('Supabase markCardLost error:', error);
      throw error;
    }
  },

  clearLostCard: async (customerId, nextStatus, note = '') => {
    ensureSupabaseConfigured();

    try {
      const resolvedAt = new Date().toISOString();
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({
          has_lost_card: false,
          lost_card_reported_at: null,
          lost_card_note: null,
          status: nextStatus
        })
        .eq('id', customerId)
        .select()
        .single();

      if (updateError) throw updateError;

      const resolutionLabel = nextStatus === CUSTOMER_STATUS.ACTIVE ? 'Marked active after lost card' : 'Marked inactive after lost card';
      const { error: historyError } = await supabase
        .from('history')
        .insert({
          customer_id: parseInt(customerId),
          event_type: 'LOST_CARD_RESOLVED',
          amount: null,
          notes: note ? `${resolutionLabel}. ${note}` : resolutionLabel,
          created_at: resolvedAt
        });

      if (historyError) throw historyError;
      return updatedCustomer;
    } catch (error) {
      console.error('Supabase clearLostCard error:', error);
      throw error;
    }
  },

  getHistory: async (filters = {}) => {
    ensureSupabaseConfigured();

    try {
      // Query history table joining customers
      let query = supabase
        .from('history')
        .select('*, customers!inner(full_name, customer_code)')
        .eq('event_type', 'RECHARGE');

      // 1. Date Range filter
      if (filters.dateRange) {
        if (filters.dateRange === 'TODAY') {
          query = query.gte('created_at', getISOStartOfToday());
        } else if (filters.dateRange === 'THIS_WEEK') {
          query = query.gte('created_at', getISOStartOfWeek());
        } else if (filters.dateRange === 'THIS_MONTH') {
          query = query.gte('created_at', getISOStartOfMonth());
        } else if (filters.dateRange === 'CUSTOM' && filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
        }
      }

      // 2. Search query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = `%${filters.searchQuery.trim()}%`;
        // Search inside notes or match full_name or customer_code of join
        query = query.or(`notes.ilike.${q},customers.full_name.ilike.${q},customers.customer_code.ilike.${q}`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      if (error) throw error;

      // Map Supabase results to flat list containing customer names directly
      return (data || []).map(h => ({
        ...h,
        customer_name: h.customers ? h.customers.full_name : 'Unknown',
        customer_code: h.customers ? h.customers.customer_code : 'N/A'
      }));
    } catch (error) {
      console.error('Supabase getHistory error:', error);
      throw error;
    }
  },

  getRecentActivities: async (limit = 5) => {
    ensureSupabaseConfigured();

    try {
      const { data, error } = await supabase
        .from('history')
        .select('*, customers(full_name, customer_code)')
        .eq('event_type', 'RECHARGE')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(h => ({
        ...h,
        customer_name: h.customers ? h.customers.full_name : 'Unknown',
        customer_code: h.customers ? h.customers.customer_code : 'N/A'
      }));
    } catch (error) {
      console.error('Supabase getRecentActivities error:', error);
      throw error;
    }
  },

  updateCustomer: async (customerId, fields) => {
    ensureSupabaseConfigured();
    try {
      const old = await supabase.from('customers').select('*').eq('id', customerId).single();
      if (old.error) throw old.error;

      const changes = [];
      if (fields.fullName && fields.fullName !== old.data.full_name) changes.push(`Name changed to "${fields.fullName}"`);
      if (fields.mobileNumber && fields.mobileNumber !== old.data.mobile_number) changes.push(`Mobile changed to ${fields.mobileNumber}`);
      if (fields.status && fields.status !== old.data.status) changes.push(`Status changed to ${fields.status}`);
      const { data: updated, error: updateError } = await supabase
        .from('customers')
        .update({
          full_name: fields.fullName || old.data.full_name,
          mobile_number: fields.mobileNumber || old.data.mobile_number,
          status: fields.status || old.data.status,
          has_lost_card: fields.hasLostCard !== undefined ? fields.hasLostCard : old.data.has_lost_card,
          lost_card_reported_at: fields.lostCardReportedAt !== undefined ? fields.lostCardReportedAt : old.data.lost_card_reported_at,
          lost_card_note: fields.lostCardNote !== undefined ? fields.lostCardNote : old.data.lost_card_note,
        })
        .eq('id', customerId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updated;
    } catch (error) {
      console.error('Supabase updateCustomer error:', error);
      throw error;
    }
  },

  getAllData: async () => {
    ensureSupabaseConfigured();

    const [{ data: customers, error: customerError }, { data: history, error: historyError }] = await Promise.all([
      supabase.from('customers').select('*').order('id', { ascending: true }),
      supabase.from('history').select('*').order('created_at', { ascending: false }).order('id', { ascending: false }),
    ]);

    if (customerError) throw customerError;
    if (historyError) throw historyError;

    return {
      customers: customers || [],
      history: history || [],
    };
  },

  adminLogin: async (email, password) => {
    ensureSupabaseConfigured();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      user: data.user,
      session: data.session,
      email: data.user?.email || '',
      username:
        data.user?.user_metadata?.display_name ||
        data.user?.email ||
        'Operator',
    };
  },

  checkSession: async () => {
    ensureSupabaseConfigured();

    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data.session;
    if (!session?.user) return null;

    return {
      user: session.user,
      session,
      email: session.user.email || '',
      username:
        session.user.user_metadata?.display_name ||
        session.user.email ||
        'Operator',
    };
  },

  logout: async () => {
    ensureSupabaseConfigured();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange: (callback) => {
    ensureSupabaseConfigured();

    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }

      callback({
        user: session.user,
        session,
        email: session.user.email || '',
        username:
          session.user.user_metadata?.display_name ||
          session.user.email ||
          'Operator',
      });
    });
  },

  getAuthModeLabel: () => {
    return 'Supabase Auth';
  }
};
