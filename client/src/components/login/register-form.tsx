import { useState } from 'react';

import { TermsDialog } from '@/components/login/term-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { register } from '@/utils/api/auth';

export const RegisterForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(form);
    onSwitch();
  };

  return (
    <section className='flex w-full flex-col items-center justify-center gap-6'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>สมัครสมาชิก</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='grid gap-6' onSubmit={handleRegister}>
            <section className='grid gap-6'>
              <article className='grid gap-3'>
                <Label htmlFor='name'>ชื่อ</Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='name'
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </article>
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
                <Label htmlFor='password'>รหัสผ่าน</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='*******'
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </article>
              <Button type='submit'>สมัครสมาชิก</Button>
            </section>
            <section className='text-center text-sm'>
              กลับไปยัง{' '}
              <button
                onClick={onSwitch}
                type='button'
                className='text-blue-500 underline underline-offset-4'
              >
                เข้าสู่ระบบ
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
