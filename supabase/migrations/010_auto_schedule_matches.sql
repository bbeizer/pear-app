-- Auto-schedule matches when both users propose the same time
-- This trigger will automatically update the status to 'scheduled' when both users have the same proposed time

CREATE OR REPLACE FUNCTION auto_schedule_matches()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if both users have proposed times and they match
    IF NEW.user1_proposed_time IS NOT NULL 
       AND NEW.user2_proposed_time IS NOT NULL 
       AND NEW.user1_proposed_time = NEW.user2_proposed_time 
       AND NEW.status != 'scheduled' THEN
        
        -- Update status to scheduled
        NEW.status := 'scheduled';
        
        -- Log the auto-scheduling
        RAISE NOTICE 'Auto-scheduling match %: both users proposed %', NEW.id, NEW.user1_proposed_time;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-schedule matches when both users propose the same time
DROP TRIGGER IF EXISTS trigger_auto_schedule_matches ON matches;
CREATE TRIGGER trigger_auto_schedule_matches
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION auto_schedule_matches(); 