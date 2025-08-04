-- Fix the swipes trigger to work with the current schema
-- The trigger was referencing 'swipe_type' and old field names that don't exist

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS trigger_handle_mutual_rejection ON swipes;
DROP FUNCTION IF EXISTS handle_mutual_rejection();

-- Function to handle mutual rejections (when one likes, other rejects)
CREATE OR REPLACE FUNCTION handle_mutual_rejection()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a rejection (liked = false), check if the other person has already rejected
    IF NEW.liked = false THEN
        -- Check if the target user has already rejected this user
        IF EXISTS (
            SELECT 1 FROM swipes 
            WHERE swiper_id = NEW.swipee_id 
              AND swipee_id = NEW.swiper_id 
              AND liked = false
        ) THEN
            -- Both have rejected each other, clean up both swipes
            DELETE FROM swipes 
            WHERE (swiper_id = NEW.swiper_id AND swipee_id = NEW.swipee_id)
               OR (swiper_id = NEW.swipee_id AND swipee_id = NEW.swiper_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle mutual rejections
CREATE TRIGGER trigger_handle_mutual_rejection
    AFTER INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION handle_mutual_rejection(); 