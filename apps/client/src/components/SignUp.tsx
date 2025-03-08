'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, loginUser } from '@/services/authService';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // 이메일/비밀번호 회원가입
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    const res = await registerUser(email, password);
    console.log(res);
    if (res?.errors?.length > 0) {
      console.log(res.errors);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setErrors(res?.errors?.map((err: any) => err.message));
      return;
    }

    setSuccess('Sign-up successful! Redirecting to the dashboard...');
    if (res?.success) {
      // 회원가입 후 자동 로그인 처리
      const loginRes = await loginUser(email, password);
      if (loginRes?.success) {
        setTimeout(() => {
          router.push('/user/courses'); // 로그인 성공 후 대시보드로 리디렉션
        }, 500);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>

        {errors.length > 0 && (
          <Alert variant="destructive" className="mt-4 text-sm text-red-400 text-center">
            <ul className="list-disc list-inside">
              {errors.map((errMsg, index) => (
                <li key={index}>{errMsg}</li>
              ))}
            </ul>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mt-4 text-sm text-green-400 text-center">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-2 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            type="submit"
            variant="link"
            className="w-full py-3 rounded-lg font-medium mt-4 hover:bg-blue-700 transition"
          >
            Sign Up
          </Button>
        </form>
        {/* 구분선 */}
        <div className="flex items-center mt-6">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="mx-3 text-sm text-gray-500 dark:text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* 로그인 페이지로 이동 */}
        <div className="mt-6 text-center">
          <Link href="/signin" className="text-blue-400 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
