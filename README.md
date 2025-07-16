## Supabase Table Migration Example

Run this SQL in the Supabase SQL editor to add new profile fields:

```sql
alter table profiles
add column gender text,
add column sexuality text,
add column age integer,
add column age_range_min integer,
add column age_range_max integer,
add column religion text,
add column politics text,
add column deal_breakers jsonb;
``` 