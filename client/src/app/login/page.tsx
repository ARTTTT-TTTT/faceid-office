'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Variants } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

import { LoginForm } from '@/components/login/login-form';
import { RegisterForm } from '@/components/login/register-form';

const h1Variants: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const cardVariants: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut', delay: 0.15 },
  },
  exit: { opacity: 0, y: 50, transition: { duration: 0.2, ease: 'easeOut' } },
};

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className='flex min-h-screen w-screen flex-col items-center justify-center bg-gray-100'>
      <motion.section
        className='flex w-full flex-col items-center justify-center'
        layout
      >
        <motion.h1
          className='mb-6 mt-24 text-4xl font-extrabold tracking-tight text-gray-800'
          initial='initial'
          animate='animate'
          variants={h1Variants}
        >
          Face ID Office
        </motion.h1>
        <AnimatePresence mode='wait'>
          <motion.div
            key={isLogin ? 'login' : 'register'}
            variants={cardVariants}
            initial='initial'
            animate='animate'
            exit='exit'
            className='flex min-h-[32rem] w-full flex-col items-center justify-start'
          >
            {isLogin ? (
              <LoginForm onSwitch={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitch={() => setIsLogin(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.section>
      <footer className='absolute bottom-4 text-base text-gray-500'>
        © {new Date().getFullYear()} by{' '}
        <Link href='' className='font-medium text-blue-500 hover:underline'>
          CHANOM
        </Link>
      </footer>
    </main>
  );
}
