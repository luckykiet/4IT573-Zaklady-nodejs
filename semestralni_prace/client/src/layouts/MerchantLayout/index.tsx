import { GuardProps } from '@/types/auth';
import { useAuthStore } from '@/store/auth-store';
import { Typography } from '@mui/material';

// ==============================|| GUEST GUARD ||============================== //

const MerchantLayout = ({ children }: GuardProps) => {
  const { user } = useAuthStore();
  return user && ['merchant', 'admin'].includes(user.role) ? (
    children
  ) : (
    <Typography align="center" color="error">
      No permission
    </Typography>
  );
};

export default MerchantLayout;
