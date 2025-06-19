import { useDispatch } from 'react-redux';
import { clearUserId } from '@/Redux/store/userSlice';
import { useRouter } from 'next/navigation';

export function Logout() {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = () => {
    dispatch(clearUserId());
    router.push('/registration');
  };

  return logout;
}
