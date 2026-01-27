-- Create email_otps table for storing OTP codes
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otp VARCHAR(6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  
  -- Add indexes for performance
  INDEX idx_email_otps_user_id (user_id),
  INDEX idx_email_otps_expires_at (expires_at),
  INDEX idx_email_otps_used (used)
);

-- Add RLS policies
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- Users can only access their own OTPs
CREATE POLICY "Users can view own OTPs" ON email_otps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OTPs" ON email_otps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own OTPs" ON email_otps
  FOR UPDATE USING (auth.uid() = user_id);

-- Add columns to profiles table for MFA settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_otp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS totp_secret TEXT;
