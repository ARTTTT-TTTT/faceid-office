import { useRouter } from 'next/navigation';
import { useState } from 'react';

import logger from '@/lib/logger';

import { TermsDialog } from '@/components/login/term-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { loginAdmin } from '@/app/api/auth/route';

export const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const router = useRouter();
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginAdmin(form);
      router.push('/detection');
    } catch (error) {
      logger(error, '[LoginForm] handleLogin');
    }
  };

  return (
    <section className='flex w-full flex-col items-center justify-center gap-6'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>ยินดีต้อนรับกลับมา</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='grid gap-6' onSubmit={handleLogin}>
            <section className='grid gap-6'>
              <article className='grid gap-3'>
                <Label htmlFor='email'>อีเมล</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='name@example.com'
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </article>
              <article className='grid gap-3'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>รหัสผ่าน</Label>
                  <a
                    href=''
                    className='ml-auto text-sm underline-offset-4 hover:underline'
                  >
                    ลืมรหัสผ่าน?
                  </a>
                </div>
                <Input
                  id='password'
                  type='password'
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </article>
              <Button type='submit'>เข้าสู่ระบบ</Button>
            </section>
            <section className='text-center text-sm'>
              ยังไม่มีบัญชี?{' '}
              <button
                onClick={onSwitch}
                type='button'
                className='text-blue-500 underline underline-offset-4'
              >
                สมัครสมาชิก
              </button>
            </section>
          </form>
        </CardContent>
      </Card>
      <span
        onClick={() => setOpenTermsDialog(true)}
        className='cursor-pointer text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-primary'
      >
        เงื่อนไขการให้บริการ
        <br />
        และนโยบายความเป็นส่วนตัว
      </span>

      <TermsDialog
        openTermsDialog={openTermsDialog}
        setOpenTermsDialog={setOpenTermsDialog}
      />
    </section>
  );
};
