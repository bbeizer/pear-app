-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    likee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(liker_id, likee_id) -- Prevent duplicate likes
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_likee_id ON likes(likee_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC); 