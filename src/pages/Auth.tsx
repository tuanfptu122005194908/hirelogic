import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên không được quá 100 ký tự'),
  studentId: z.string().min(5, 'Mã sinh viên phải có ít nhất 5 ký tự').max(20, 'Mã sinh viên không được quá 20 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const loginSchema = z.object({
  studentId: z.string().min(5, 'Mã sinh viên phải có ít nhất 5 ký tự'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ studentId: formData.studentId, password: formData.password });
      } else {
        signUpSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Use student ID as email for simplicity
      const email = `${formData.studentId}@student.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Mã sinh viên hoặc mật khẩu không đúng');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Đăng nhập thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const email = `${formData.studentId}@student.local`;

      // Check if student ID already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('student_id')
        .eq('student_id', formData.studentId as any)
        .maybeSingle();

      if (existingProfile) {
        toast.error('Mã sinh viên đã được đăng ký');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Mã sinh viên đã được đăng ký');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: formData.name.trim(),
            student_id: formData.studentId.trim(),
          } as any);

        if (profileError) {
          toast.error('Lỗi tạo hồ sơ: ' + profileError.message);
          return;
        }

        // Create initial progress record so user appears on leaderboard
        const { error: progressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: data.user.id,
            is_active: false,
            current_day: 0,
            consecutive_days: 0,
            completed_days: 0,
          } as any);

        if (progressError) {
          console.error('Error creating progress:', progressError);
        }

        toast.success('Đăng ký thành công!');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden sakura-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-slow"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Glass card with gradient border */}
            <div className="relative group">
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition duration-300"></div>
              
              {/* Main card */}
              <Card className="relative glass-card-strong border-0 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header with gradient background */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 opacity-90"></div>
                  <CardHeader className="relative text-center pb-8 pt-12 px-8">
                    {/* Animated icon container */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="mx-auto mb-6 relative"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-3xl flex items-center justify-center shadow-lg animate-pulse-glow">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center">
                          {isLogin ? (
                            <LogIn className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500" />
                          ) : (
                            <UserPlus className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500" />
                          )}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <CardTitle className="text-3xl font-bold mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
                          {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-base font-medium">
                        {isLogin
                          ? 'Chào mừng trở lại! Đăng nhập để tiếp tục hành trình'
                          : 'Bắt đầu hành trình của bạn ngay hôm nay'}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                </div>

                <CardContent className="relative px-8 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="name" className="flex items-center gap-2 text-gray-700 font-semibold">
                          <div className="w-5 h-5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          Họ và tên
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`h-12 rounded-xl border-2 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-pink-400 bg-white'} transition-all duration-300 font-medium`}
                        />
                        {errors.name && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 font-medium flex items-center gap-1"
                          >
                            <span className="text-red-400">⚠</span>
                            {errors.name}
                          </motion.p>
                        )}
                      </motion.div>
                    )}

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="space-y-3"
                    >
                      <Label htmlFor="studentId" className="flex items-center gap-2 text-gray-700 font-semibold">
                        <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          🎓
                        </div>
                        Mã sinh viên
                      </Label>
                      <Input
                        id="studentId"
                        name="studentId"
                        type="text"
                        placeholder="VD: 2021001234"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className={`h-12 rounded-xl border-2 ${errors.studentId ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-400 bg-white'} transition-all duration-300 font-medium`}
                      />
                      {errors.studentId && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 font-medium flex items-center gap-1"
                        >
                          <span className="text-red-400">⚠</span>
                          {errors.studentId}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="space-y-3"
                    >
                      <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 font-semibold">
                        <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm">
                          🔒
                        </div>
                        Mật khẩu
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`h-12 rounded-xl border-2 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400 bg-white'} transition-all duration-300 font-medium`}
                      />
                      {errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 font-medium flex items-center gap-1"
                        >
                          <span className="text-red-400">⚠</span>
                          {errors.password}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 btn-primary relative overflow-hidden group"
                        disabled={loading}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center gap-3">
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Đang xử lý...</span>
                            </>
                          ) : isLogin ? (
                            <>
                              <span>Đăng Nhập</span>
                              <ArrowLeft className="w-5 h-5 rotate-180" />
                            </>
                          ) : (
                            <>
                              <span>Đăng Ký</span>
                              <UserPlus className="w-5 h-5" />
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">hoặc</span>
                    </div>
                  </div>

                  {/* Switch auth mode */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="text-center"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrors({});
                      }}
                      className="group relative inline-flex items-center gap-2 text-gray-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 font-semibold transition-all duration-300"
                    >
                      <span className="text-lg">
                        {isLogin ? '🌸' : '🚀'}
                      </span>
                      {isLogin ? (
                        <>
                          <span>Chưa có tài khoản?</span>
                          <span className="relative">
                            <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></span>
                            <span className="relative">Đăng ký ngay</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Đã có tài khoản?</span>
                          <span className="relative">
                            <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></span>
                            <span className="relative">Đăng nhập</span>
                          </span>
                        </>
                      )}
                    </button>
                  </motion.div>

                  {/* Back button */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className="mt-6"
                  >
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/')}
                      className="w-full h-12 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-300 border border-gray-200 hover:border-gray-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại trang chủ
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
