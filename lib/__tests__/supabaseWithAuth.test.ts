jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => 'mockClient'),
}));

describe('getSupabaseWithAuth', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, EXPO_PUBLIC_SUPABASE_URL: 'url', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'key' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns a client when session exists', async () => {
    const { getSupabaseWithAuth } = require('../supabaseWithAuth');
    const { supabase } = require('../supabaseClient');
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { access_token: 'token' } } });
    const client = await getSupabaseWithAuth();
    expect(client).toBe('mockClient');
    expect(require('@supabase/supabase-js').createClient).toHaveBeenCalledWith(
      'url',
      'key',
      expect.objectContaining({ global: { headers: { Authorization: 'Bearer token' } } })
    );
  });

  it('throws if no session', async () => {
    const { getSupabaseWithAuth } = require('../supabaseWithAuth');
    const { supabase } = require('../supabaseClient');
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });
    await expect(getSupabaseWithAuth()).rejects.toThrow('No session available');
  });
}); 