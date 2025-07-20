-- Clean up swipes when matches are created or when there are mutual rejections
-- This ensures swipes don't accumulate and handles the case where one person likes and the other rejects

-- Function to clean up swipes when a match is created
CREATE OR REPLACE FUNCTION cleanup_swipes_on_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the swipes that created this match
    DELETE FROM swipes 
    WHERE (user_id = NEW.user1_id AND target_user_id = NEW.user2_id)
       OR (user_id = NEW.user2_id AND target_user_id = NEW.user1_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to clean up swipes when a match is created
DROP TRIGGER IF EXISTS trigger_cleanup_swipes_on_match ON matches;
CREATE TRIGGER trigger_cleanup_swipes_on_match
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_swipes_on_match();

-- Function to handle mutual rejections (when one likes, other rejects)
CREATE OR REPLACE FUNCTION handle_mutual_rejection()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a rejection, check if the other person has already rejected
    IF NEW.swipe_type = 'reject' THEN
        -- Check if the target user has already rejected this user
        IF EXISTS (
            SELECT 1 FROM swipes 
            WHERE user_id = NEW.target_user_id 
              AND target_user_id = NEW.user_id 
              AND swipe_type = 'reject'
        ) THEN
            -- Both have rejected each other, clean up both swipes
            DELETE FROM swipes 
            WHERE (user_id = NEW.user_id AND target_user_id = NEW.target_user_id)
               OR (user_id = NEW.target_user_id AND target_user_id = NEW.user_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle mutual rejections
DROP TRIGGER IF EXISTS trigger_handle_mutual_rejection ON swipes;
CREATE TRIGGER trigger_handle_mutual_rejection
    AFTER INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION handle_mutual_rejection(); 