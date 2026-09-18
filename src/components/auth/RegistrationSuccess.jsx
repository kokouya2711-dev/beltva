import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

// 登録完了演出: 黒背景にロゴ・完了テキスト・ネオンイエローのチェック
// 約1秒表示後、onCompleteでホームへ遷移
// 端末でアニメーションを減らす設定が有効なら動きを省く
export default function RegistrationSuccess({ onComplete }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const duration = reduceMotion ? 600 : 1000;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [reduceMotion, onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-5xl font-extrabold tracking-[0.18em] mb-10"
        style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
      >
        <span className="text-white">BELTV</span><span className="text-primary">A</span>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 18, delay: 0.25 }}
        className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center mb-6"
      >
        <Check className="w-10 h-10 text-primary" strokeWidth={3} />
      </motion.div>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        登録完了！
      </motion.p>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.3 }}
        className="text-base text-muted-foreground"
      >
        BELTVAへようこそ
      </motion.p>
    </div>
  );
}