-- Enable realtime for otp_rate_limits table
ALTER TABLE public.otp_rate_limits REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.otp_rate_limits;