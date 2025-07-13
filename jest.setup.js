// Polyfill for 'self' to make Supabase and ESM modules happy in Jest/Node
if (typeof self === 'undefined') {
    global.self = global;
} 